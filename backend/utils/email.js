const nodemailer = require('nodemailer');

const EMAIL_PROVIDERS = new Set(['auto', 'brevo', 'gmail', 'gmail-api']);

class EmailConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmailConfigurationError';
    this.statusCode = 503;
  }
}

function getEmailProvider() {
  const configuredProvider = (process.env.EMAIL_PROVIDER || 'auto').trim().toLowerCase();

  if (!EMAIL_PROVIDERS.has(configuredProvider)) {
    throw new EmailConfigurationError('EMAIL_PROVIDER must be auto, brevo, gmail, or gmail-api.');
  }

  if (configuredProvider === 'brevo') {
    if (!process.env.BREVO_API_KEY) {
      throw new EmailConfigurationError('Brevo is selected, but BREVO_API_KEY is missing.');
    }
    if (!process.env.EMAIL_USER) {
      throw new EmailConfigurationError('Brevo is selected, but EMAIL_USER must be a verified Brevo sender.');
    }
    return 'brevo';
  }

  if (configuredProvider === 'gmail') {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new EmailConfigurationError('Gmail is selected, but EMAIL_USER or EMAIL_PASS is missing.');
    }
    return 'gmail';
  }

  if (configuredProvider === 'gmail-api') {
    validateGmailApiConfiguration();
    return 'gmail-api';
  }

  if (hasGmailApiConfiguration()) return 'gmail-api';
  if (process.env.BREVO_API_KEY) {
    if (!process.env.EMAIL_USER) {
      throw new EmailConfigurationError('Brevo is configured, but EMAIL_USER must be a verified Brevo sender.');
    }
    return 'brevo';
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) return 'gmail';

  throw new EmailConfigurationError('No email provider is configured. Add BREVO_API_KEY or Gmail credentials.');
}

function hasGmailApiConfiguration() {
  return Boolean(
    process.env.GMAIL_API_CLIENT_ID
    || process.env.GMAIL_API_CLIENT_SECRET
    || process.env.GMAIL_API_REFRESH_TOKEN
  );
}

function validateGmailApiConfiguration() {
  const requiredVariables = [
    'EMAIL_USER',
    'GMAIL_API_CLIENT_ID',
    'GMAIL_API_CLIENT_SECRET',
    'GMAIL_API_REFRESH_TOKEN',
  ];
  const missing = requiredVariables.filter((name) => !process.env[name]);

  if (missing.length) {
    throw new EmailConfigurationError(`Gmail API is selected, but ${missing.join(', ')} is missing.`);
  }
}

function buildHtml(otp) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body { font-family: 'Inter', -apple-system, sans-serif; background: #f9fafb; color: #1f2937; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
  .header { background: #111827; color: #fff; padding: 30px; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
  .content { padding: 40px 30px; text-align: center; }
  .content p { font-size: 16px; line-height: 1.5; color: #4b5563; margin-bottom: 24px; }
  .otp-box { display: inline-block; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; padding: 16px 32px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111827; margin-bottom: 24px; }
  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>VIT Shuttle</h1></div>
    <div class="content">
      <h2>Verify Your Email</h2>
      <p>Use the following 4-digit code to verify your email. Valid for 10 minutes.</p>
      <div class="otp-box">${otp}</div>
      <p>If you didn't request this, ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} VIT Shuttle - Vellore Institute of Technology</p>
    </div>
  </div>
</body>
</html>`;
}

function sender() {
  return {
    name: process.env.EMAIL_SENDER_NAME || 'VIT Shuttle',
    email: process.env.EMAIL_USER.trim(),
  };
}

async function sendViaBrevo(options, html) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: sender(),
      to: [{ email: options.email, name: options.email.split('@')[0] }],
      subject: options.subject,
      htmlContent: html,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Brevo API error (${response.status}): ${data.message || 'Email was rejected.'}`);
  }

  return { provider: 'brevo', messageId: data.messageId };
}

let transporter;
let gmailApiAccessToken;
let gmailApiAccessTokenExpiresAt = 0;

function getGmailTransporter() {
  if (transporter) return transporter;

  const port = Number(process.env.EMAIL_PORT || 465);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new EmailConfigurationError('EMAIL_PORT must be a valid SMTP port number.');
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASS.replace(/\s/g, ''),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return transporter;
}

async function sendViaGmail(options, html) {
  const info = await getGmailTransporter().sendMail({
    from: `VIT Shuttle <${sender().email}>`,
    to: options.email,
    subject: options.subject,
    html,
  });

  if (info.rejected && info.rejected.length) {
    throw new Error('Gmail rejected the recipient address.');
  }

  return { provider: 'gmail', messageId: info.messageId };
}

function base64UrlEncode(value) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function assertSafeHeader(value, headerName) {
  if (!value || /[\r\n]/.test(value)) {
    throw new EmailConfigurationError(`${headerName} contains an invalid value.`);
  }
  return value;
}

function buildGmailApiMessage(options, html) {
  const from = sender();
  const subject = assertSafeHeader(options.subject, 'Email subject');
  const recipient = assertSafeHeader(options.email, 'Recipient email');
  const senderEmail = assertSafeHeader(from.email, 'Sender email');
  const senderName = assertSafeHeader(from.name, 'Sender name').replace(/"/g, "'");
  const encodedHtml = Buffer.from(html, 'utf8').toString('base64').match(/.{1,76}/g).join('\r\n');

  return [
    `From: ${senderName} <${senderEmail}>`,
    `To: ${recipient}`,
    `Reply-To: ${senderEmail}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodedHtml,
  ].join('\r\n');
}

async function getGmailApiAccessToken() {
  if (gmailApiAccessToken && Date.now() < gmailApiAccessTokenExpiresAt) {
    return gmailApiAccessToken;
  }

  const body = new URLSearchParams({
    client_id: process.env.GMAIL_API_CLIENT_ID,
    client_secret: process.env.GMAIL_API_CLIENT_SECRET,
    refresh_token: process.env.GMAIL_API_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.access_token) {
    throw new Error(`Gmail API token error (${response.status}): ${data.error_description || data.error || 'Unable to authorize email sending.'}`);
  }

  gmailApiAccessToken = data.access_token;
  gmailApiAccessTokenExpiresAt = Date.now() + Math.max(60, Number(data.expires_in || 3600) - 60) * 1000;
  return gmailApiAccessToken;
}

async function sendViaGmailApi(options, html) {
  const accessToken = await getGmailApiAccessToken();
  const rawMessage = base64UrlEncode(buildGmailApiMessage(options, html));
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ raw: rawMessage }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.id) {
    throw new Error(`Gmail API send error (${response.status}): ${data.error?.message || 'Email was rejected.'}`);
  }

  return { provider: 'gmail-api', messageId: data.id };
}

async function sendEmail(options) {
  const provider = getEmailProvider();
  const html = buildHtml(options.otp);

  if (provider === 'brevo') return sendViaBrevo(options, html);
  if (provider === 'gmail-api') return sendViaGmailApi(options, html);
  return sendViaGmail(options, html);
}

module.exports = sendEmail;
module.exports.getEmailProvider = getEmailProvider;
