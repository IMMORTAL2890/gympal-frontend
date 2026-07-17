import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// 1. Configure the SMTP Transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[SMTP WARNING] SMTP Host, User, or Pass environment variables are not configured. Emails will be logged to console instead.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const transporter = getTransporter();

// 2. Validate configuration on startup (if transporter exists)
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('[SMTP ERROR] SMTP connection verification failed: ', error.message);
    } else {
      console.log('[SMTP SUCCESS] SMTP server connection established and ready to send messages.');
    }
  });
}

// 3. Main reusable sendEmail method
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const from = process.env.EMAIL_FROM || '"FitTrack Support" <noreply@fittrack.com>';
  
  const mailOptions = {
    from,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
    bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
    attachments: options.attachments ? options.attachments.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType
    })) : undefined
  };

  if (!transporter) {
    // Development console logging fallback
    console.log('\n=========================================');
    console.log(`[SMTP DEV FALLBACK] Sending Email to: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    if (mailOptions.text) console.log(`Text Body: ${mailOptions.text}`);
    if (mailOptions.html) console.log(`HTML Body: [HTML Content - ${mailOptions.html.length} chars]`);
    console.log('=========================================\n');
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SMTP SUCCESS] Email successfully sent to ${mailOptions.to}`);
  } catch (error: any) {
    console.error(`[SMTP ERROR] Failed to send email to ${mailOptions.to}: `, error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// 4. Send HTML Email helper
export async function sendHtmlEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string,
  options?: Omit<SendEmailOptions, 'to' | 'subject' | 'html' | 'text'>
): Promise<void> {
  await sendEmail({
    to,
    subject,
    html,
    text,
    ...options
  });
}

// 5. Beautiful HTML templates
export function getOtpTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your email</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f4f5f6; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #10b981; padding: 24px; text-align: center; color: white; font-size: 20px; font-weight: bold; }
        .content { padding: 32px; text-align: center; }
        .otp { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b; background: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px 24px; border-radius: 12px; display: inline-block; margin: 24px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">FitTrack Verification</div>
        <div class="content">
          <h3>One-Time Password (OTP)</h3>
          <p>Use the verification code below to complete your registration or login verification. This code is valid for 10 minutes.</p>
          <div class="otp">${otp}</div>
          <p style="font-size: 13px; color: #64748b;">If you did not request this code, please ignore this email.</p>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} FitTrack. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
}

export function getPasswordResetTemplate(resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset your password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f4f5f6; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #ef4444; padding: 24px; text-align: center; color: white; font-size: 20px; font-weight: bold; }
        .content { padding: 32px; text-align: center; }
        .button { display: inline-block; background-color: #1e293b; color: #ffffff !important; padding: 12px 28px; font-weight: bold; text-decoration: none; border-radius: 12px; margin: 24px 0; font-size: 14px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Password Reset Request</div>
        <div class="content">
          <h3>Reset Password</h3>
          <p>We received a request to reset your password. Click the button below to choose a new password. This link is valid for 1 hour.</p>
          <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
          <p style="font-size: 11px; color: #64748b; word-break: break-all;">Or copy and paste this link in your browser:<br>${resetLink}</p>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} FitTrack. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
}

export function getWelcomeTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FitTrack!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f4f5f6; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #10b981; padding: 32px 24px; text-align: center; color: white; font-size: 24px; font-weight: 800; }
        .content { padding: 32px; color: #334155; line-height: 1.6; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Welcome to FitTrack!</div>
        <div class="content">
          <h3>Hi ${name},</h3>
          <p>Thank you for registering your gym account with us! We are thrilled to help you manage your gym, track check-ins, streamline membership billing, and keep your gym members engaged.</p>
          <p>To get started, log into your owner portal, setup your membership plans, and register your first member.</p>
          <p>If you have any questions or need help setting up your access control devices, feel free to reply to this email.</p>
          <p>Best regards,<br>The FitTrack Team</p>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} FitTrack. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
}

// 6. Template specific functions
export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const html = getOtpTemplate(otp);
  await sendHtmlEmail(to, 'FitTrack - Verification Code', html, `Your OTP code is: ${otp}`);
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<void> {
  const html = getPasswordResetTemplate(link);
  await sendHtmlEmail(to, 'FitTrack - Password Reset Request', html, `Reset your password here: ${link}`);
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = getWelcomeTemplate(name);
  await sendHtmlEmail(to, 'Welcome to FitTrack!', html, `Welcome to FitTrack, ${name}!`);
}
