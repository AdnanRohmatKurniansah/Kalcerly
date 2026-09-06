import nodemailer from 'nodemailer'
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } from '../config'

const createTransport = () =>
  nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { 
      user: SMTP_USER, 
      pass: SMTP_PASS 
    },
  })

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = createTransport()
  await transporter.sendMail({ from: `"Kalcerly" <${EMAIL_FROM}>`, to, subject, html })
}

export const sendVerificationEmail = async (to: string, token: string, verificationUrl: string) => {
  const link = `${verificationUrl}?token=${token}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Kalcerly email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#22c55e;padding:28px 32px;text-align:center;">
              <div style="display:inline-block;background-color:rgba(255,255,255,0.15);border-radius:12px;padding:10px 16px;">
                <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Kalcerly</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;color:#111827;font-size:28px;line-height:1.3;font-weight:700;letter-spacing:-0.5px;">
                Verify your email
              </h1>
              <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.7;">
                Welcome to <strong style="color:#16a34a;">Kalcerly</strong>! We're excited to have you on board.
              </p>
              <p style="margin:0 0 28px;color:#4b5563;font-size:16px;line-height:1.7;">
                Please verify your email address to activate your account and start using Kalcerly.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${link}" style="display:inline-block;width:100%;box-sizing:border-box;background-color:#22c55e;color:#ffffff;text-decoration:none;text-align:center;padding:15px 24px;border-radius:10px;font-size:16px;font-weight:700;">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top:28px;padding:16px;background-color:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
                <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">
                  This verification link will expire in <strong style="color:#374151;">24 hours</strong>.
                </p>
              </div>
              <p style="margin:28px 0 8px;color:#6b7280;font-size:13px;line-height:1.5;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.6;">
                <a href="${link}" style="color:#16a34a;text-decoration:none;">${link}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;background-color:#fafafa;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;line-height:1.5;">
                If you didn't create a Kalcerly account, you can safely ignore this email.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} Kalcerly. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        <p style="max-width:560px;margin:20px auto 0;color:#9ca3af;font-size:11px;text-align:center;line-height:1.5;">
          This is an automated email. Please do not reply to this message.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
  await sendEmail(to, 'Verify your Kalcerly email', html)
}

