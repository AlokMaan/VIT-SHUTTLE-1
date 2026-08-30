const nodemailer = require('nodemailer');

// ── Build HTML template ─────────────────────────────────────────────────────
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

// ── Brevo HTTP API (no SMTP needed — works on Render) ───────────────────────
async function sendViaBrevo(options, html) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER || 'maanalok05@gmail.com';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'VIT Shuttle', email: senderEmail },
      to: [{ email: options.email, name: options.email.split('@')[0] }],
      subject: options.subject,
      htmlContent: html,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Brevo API error (${response.status}): ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

// ── Gmail SMTP fallback (works locally) ─────────────────────────────────────
let transporter = null;
function getGmailTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      pool: true,
    });
  }
  return transporter;
}

// ── Main send function ──────────────────────────────────────────────────────
const sendEmail = async (options) => {
  const html = buildHtml(options.otp);

  // Priority 1: Brevo HTTP API (works on Render — no SMTP needed)
  if (process.env.BREVO_API_KEY) {
    console.log('📬 Sending via Brevo HTTP API...');
    await sendViaBrevo(options, html);
    return;
  }

  // Priority 2: Gmail SMTP (works locally)
  console.log('📬 Sending via Gmail SMTP...');
  await getGmailTransporter().sendMail({
    from: `VIT Shuttle <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html,
  });
};

module.exports = sendEmail;
