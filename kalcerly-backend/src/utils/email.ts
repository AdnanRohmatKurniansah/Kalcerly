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

export const sendVerificationEmail = async (
  to: string,
  token: string,
  verificationUrl: string
) => {
  const link = `${verificationUrl}?token=${encodeURIComponent(token)}`;

  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Kalcerly email</title>
  </head>

  <body style="margin:0;
      padding:0;
      font-family:Arial,Helvetica,sans-serif; color:#111317;">
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background-color:#f3f4f6;
        padding:48px 20px;
      "
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width:560px;
              background-color:#ffffff;
              border:1px solid #e5e7eb;
              border-radius:20px;
              overflow:hidden;
              box-shadow:0 1px 3px rgba(0,0,0,0.04);
            ">
            <tr>
              <td
                style="
                  padding:32px 32px 28px;
                  border-bottom:1px solid #e5e7eb;
                ">
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>
                    <td
                      valign="middle"
                      >
                      <img width="40px" src="https://app-kalcerly.vercel.app/logo.png" alt="Logo Kalcerly" />
                    </td>
                    <td
                      valign="middle"
                      style="
                        padding-left:12px;
                      ">
                      <div
                        style="
                          color:#111317;
                          font-size:18px;
                          line-height:20px;
                          font-weight:700;
                          letter-spacing:-0.4px;
                        ">
                        KALCERLY
                      </div>
                      <div
                        style="
                          margin-top:4px;
                          color:#6b7280;
                          font-size:9px;
                          line-height:12px;
                          font-weight:600;
                          letter-spacing:1.2px;
                          text-transform:uppercase;
                        ">
                        Make Movement a Culture
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding:40px 40px 36px;
                ">
                <p
                  style="
                    margin:0 0 12px;
                    color:#65a30d;
                    font-size:12px;
                    line-height:18px;
                    font-weight:700;
                    letter-spacing:1.2px;
                    text-transform:uppercase;
                  ">
                  Account Verification
                </p>
                <h1
                  style="
                    margin:0 0 16px;
                    color:#111317;
                    font-size:30px;
                    line-height:38px;
                    font-weight:700;
                    letter-spacing:-0.8px;
                  ">
                  Verify your email.
                </h1>
                <p style="margin:0 0 16px;
                    color:#4b5563;
                    font-size:15px;
                    line-height:25px;">
                  Welcome to
                  <strong style="color:#111317;">
                    Kalcerly
                  </strong>.
                  Your account is almost ready.
                </p>
                <p style="
                    margin:0 0 30px;
                    color:#4b5563;
                    font-size:15px;
                    line-height:25px;">
                  Verify your email address to activate your account
                  and start turning every movement into meaningful progress.
                </p>
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0">
                  <tr>
                    <td align="center">
                      <a
                        href="${link}"
                        style="
                          display:block;
                          width:100%;
                          box-sizing:border-box;
                          background-color:#a3e635;
                          color:#111317;
                          text-decoration:none;
                          text-align:center;
                          padding:15px 24px;
                          border-radius:999px;
                          font-size:15px;
                          line-height:20px;
                          font-weight:500;
                        ">
                        Verify My Email&nbsp;&nbsp;→
                      </a>
                    </td>
                  </tr>
                </table>
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    margin-top:28px;
                    background-color:#f9fafb;
                    border:1px solid #e5e7eb;
                    border-radius:12px;
                  ">
                  <tr>
                    <td style="padding:15px 16px;">
                      <p style="
                          margin:0;
                          color:#6b7280;
                          font-size:13px;
                          line-height:19px;
                          text-align:center;
                        ">
                        This verification link will expire in
                        <strong style="color:#374151;">
                          24 hours
                        </strong>.
                      </p>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin:28px 0 8px;
                    color:#6b7280;
                    font-size:12px;
                    line-height:18px;
                  "
                >
                  If the button doesn't work, copy and paste this link
                  into your browser:
                </p>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background-color:#f9fafb;
                    border:1px solid #e5e7eb;
                    border-radius:8px;
                  ">
                  <tr>
                    <td
                      style="
                        padding:10px 12px;
                        overflow-x:auto;
                      ">
                      <div style="width:100%; overflow-x:auto;">
                        <a
                          href="${link}"
                          style="
                            display:inline-block;
                            white-space:nowrap;
                            color:#65a30d;
                            text-decoration:none;
                            font-size:11px;
                            line-height:18px;
                          ">
                          ${link}
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:24px 40px;
                  background-color:#f9fafb;
                  border-top:1px solid #e5e7eb;
                  text-align:center;
                ">
                <p
                  style="
                    margin:0 0 8px;
                    color:#6b7280;
                    font-size:11px;
                    line-height:17px;
                  ">
                  If you didn't create a Kalcerly account,
                  you can safely ignore this email.
                </p>
                <p
                  style="
                    margin:0;
                    color:#9ca3af;
                    font-size:11px;
                    line-height:17px;
                  ">
                  © ${new Date().getFullYear()} Kalcerly.
                  All rights reserved.
                </p>
              </td>
            </tr>

          </table>

          <p style="
              max-width:560px;
              margin:20px auto 0;
              color:#9ca3af;
              font-size:10px;
              line-height:16px;
              text-align:center;">
            This is an automated email from Kalcerly.
            Please do not reply to this message.
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  await sendEmail(
    to,
    "Verify your Kalcerly email",
    html
  );
};