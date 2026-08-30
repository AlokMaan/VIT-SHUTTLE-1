const nodemailer = require('nodemailer');

// Create a reusable transporter (created once, reused for all emails)
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL — faster than STARTTLS on port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      pool: true, // Reuse connections for faster subsequent emails
      maxConnections: 3,
    });
  }
  return transporter;
}

const sendEmail = async (options) => {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f9fafb;
        color: #1f2937;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }
      .header {
        background-color: #111827;
        color: #ffffff;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 40px 30px;
        text-align: center;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
        color: #4b5563;
        margin-bottom: 24px;
      }
      .otp-box {
        display: inline-block;
        background-color: #f3f4f6;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 16px 32px;
        font-size: 32px;
        font-weight: 800;
        letter-spacing: 8px;
        color: #111827;
        margin-bottom: 24px;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
      }
      .footer p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>VIT Shuttle</h1>
      </div>
      <div class="content">
        <h2>Verify Your Email</h2>
        <p>Hello,</p>
        <p>Use the following 4-digit code to verify your email address and securely access your VIT Shuttle account. This code is valid for 10 minutes.</p>
        
        <div class="otp-box">
          ${options.otp}
        </div>
        
        <p>If you didn't request this email, you can safely ignore it.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} VIT Shuttle. All rights reserved.</p>
        <p>Vellore Institute of Technology</p>
      </div>
    </div>
  </body>
  </html>
  `;

  const message = {
    from: `VIT Shuttle <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: htmlTemplate,
  };

  await getTransporter().sendMail(message);
};

module.exports = sendEmail;
