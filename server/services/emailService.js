import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const logEmail = (msg) => {
  console.log(msg);
  try {
    const logPath = path.resolve(process.cwd(), 'email-debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {
    // ignore
  }
};

/**
 * Escapes unsafe HTML characters to prevent XSS in email clients.
 */
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Creates a reusable nodemailer transporter based on environment configuration.
 * Defaults to Gmail service if host is not explicitly specified.
 */
export const createTransporter = () => {
  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : '';

  if (!user || !pass) {
    return null;
  }

  // If a custom SMTP host is provided, use it; otherwise use Gmail service
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Gmail SMTP transporter with TLS fallback
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Builds the responsive HTML body for registration confirmation email.
 */
const buildRegistrationHtml = ({ name, role, phone, email, clientUrl }) => {
  const safeName = escapeHtml(name || 'Officer');
  const safeRole = escapeHtml(role || 'Officer');
  const safePhone = escapeHtml(phone || 'N/A');
  const safeEmail = escapeHtml(email || 'N/A');
  const safeUrl = escapeHtml(clientUrl || 'http://localhost:5173');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DPTS - Registration Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f3; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 8px 30px rgba(21, 128, 61, 0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; color: #dcfce7;">
                Official Notification &bull; නිල දැනුම්දීම
              </div>
              <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Development Progress Tracking System
              </h1>
              <div style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #bbf7d0;">
                Zonal Education Office - Katugastota
              </div>
              <div style="margin: 0; font-size: 13px; color: #e2e8f0; opacity: 0.95; font-weight: 500;">
                කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px 24px 28px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #0f291e; margin: 0 0 12px 0;">
                Dear ${safeName},
              </h2>

              <p style="font-size: 14.5px; line-height: 1.65; color: #334155; margin: 0 0 16px 0;">
                Welcome to the <strong>Development Progress Tracking System (DPTS)</strong>. Your official officer account has been registered successfully.
              </p>

              <div style="font-size: 13.5px; line-height: 1.6; color: #15803d; font-weight: 600; margin: 0 0 22px 0; padding: 12px 16px; background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 0 8px 8px 0;">
                කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලයීය සංවර්ධන ප්‍රගති අධීක්ෂණ පද්ධතියෙහි (DPTS) ඔබගේ නිල ගිණුම සාර්ථකව ලියාපදිංචි කර ඇත.
              </div>

              <!-- Details Box -->
              <table role="presentation" width="100%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 24px; padding: 14px 18px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
                    Registered Account Details / ගිණුමේ විස්තර
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13.5px; font-weight: 500;">Full Name (නම)</td>
                  <td align="right" style="padding: 8px 0; color: #0f291e; font-size: 13.5px; font-weight: 700;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13.5px; font-weight: 500;">Designation (තනතුර)</td>
                  <td align="right" style="padding: 8px 0; color: #0f291e; font-size: 13.5px; font-weight: 700;">${safeRole}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13.5px; font-weight: 500;">Contact Number (දුරකථනය)</td>
                  <td align="right" style="padding: 8px 0; color: #0f291e; font-size: 13.5px; font-weight: 700;">${safePhone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13.5px; font-weight: 500;">Official Email (විද්‍යුත් තැපෑල)</td>
                  <td align="right" style="padding: 8px 0; color: #0f291e; font-size: 13.5px; font-weight: 700;">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13.5px; font-weight: 500;">Account Status (තත්ත්වය)</td>
                  <td align="right" style="padding: 8px 0;">
                    <span style="display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 800;">Active (ක්‍රියාකාරී)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13.5px; font-weight: 500;">Office (කාර්යාලය)</td>
                  <td align="right" style="padding: 8px 0; color: #0f291e; font-size: 13.5px; font-weight: 700;">Zonal Education Office - Katugastota</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 26px 0 22px 0;">
                <a href="${safeUrl}" target="_blank" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 12px 30px; border-radius: 8px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);">
                  Login to DPTS Portal &rarr;
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; font-size: 12px; line-height: 1.55; color: #92400e; margin-top: 18px;">
                <strong>Security Notice (ආරක්ෂිත දැනුම්දීම):</strong> Please keep your login credentials and password confidential. You can log in using your contact number or email address with your chosen password. If you did not create this account, please inform the Zonal Education Office administration immediately.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 3px;">
                Development Progress Tracking System &bull; Zonal Education Office - Katugastota
              </div>
              <div>Official Educational Administration Portal &bull; All Rights Reserved</div>
              <div style="margin-top: 6px; color: #94a3b8; font-size: 11px;">
                This is an automated system notification. Please do not reply directly to this email.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Builds clean plain-text alternative.
 */
const buildRegistrationText = ({ name, role, phone, email, clientUrl }) => {
  return `Dear ${name || 'Officer'},

Welcome to the Development Progress Tracking System (DPTS).
Your account has been registered successfully at Zonal Education Office - Katugastota.
(කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලයීය සංවර්ධන ප්‍රගති අධීක්ෂණ පද්ධතියෙහි ඔබගේ නිල ගිණුම සාර්ථකව ලියාපදිංචි කර ඇත.)

Account Details:
- Name: ${name || 'Officer'}
- Designation: ${role || 'Officer'}
- Contact Number: ${phone || 'N/A'}
${email ? `- Official Email: ${email}\n` : ''}- Status: Active (ක්‍රියාකාරී)
- Office: Zonal Education Office - Katugastota

You can login to the system using your contact number / email and password:
${clientUrl || 'http://localhost:5173'}

Security Notice:
Please keep your login credentials confidential. If you did not create this account, please inform the administration immediately.

Thank you,
Zonal Education Office - Katugastota
`;
};

/**
 * Sends registration confirmation email to the newly registered officer.
 * - If EMAIL_USER & EMAIL_PASS are configured: sends via configured SMTP / Gmail to real inbox.
 * - If NOT configured: sends via Ethereal test mailer for local development/testing and logs preview URL.
 *
 * @param {Object} param
 * @param {string} param.to - Recipient email address
 * @param {string} param.name - Officer's full name
 * @param {string} param.role - Officer's designation
 * @param {string} param.phone - Officer's contact number
 * @param {string} [param.email] - Officer's official email (optional)
 * @returns {Promise<{ success: boolean, messageId?: string, previewUrl?: string, isTest?: boolean, error?: string }>}
 */
export const sendRegistrationConfirmationEmail = async ({ to, name, role, phone, email }) => {
  if (!to || typeof to !== 'string' || !to.trim()) {
    return { success: false, reason: 'no_email_provided' };
  }

  const cleanTo = to.trim();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const htmlContent = buildRegistrationHtml({
    name,
    role,
    phone,
    email: cleanTo,
    clientUrl,
  });

  const textContent = buildRegistrationText({
    name,
    role,
    phone,
    email: cleanTo,
    clientUrl,
  });

  const senderEmail = process.env.EMAIL_USER
    ? process.env.EMAIL_USER.trim()
    : 'dpts.katugastota@gmail.com';

  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      `"Zonal Education Office - Katugastota" <${senderEmail}>`,
    to: cleanTo,
    subject: 'Registration Successful - Development Progress Tracking System (DPTS)',
    text: textContent,
    html: htmlContent,
  };

  const transporter = createTransporter();

  // If real credentials are configured in .env -> Send to real inbox
  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      logEmail(
        `[Email Service] ✅ Real email sent successfully to ${cleanTo} (Message ID: ${info.messageId})`
      );
      return { success: true, messageId: info.messageId, isTest: false };
    } catch (err) {
      logEmail(
        `[Email Service] ❌ Failed to send email via SMTP to ${cleanTo}: ${err.message}`
      );
      return { success: false, error: err.message, isTest: false };
    }
  }

  // Fallback: If credentials are not yet set in .env -> Create Ethereal test account
  console.warn(
    `[Email Service] ⚠️ EMAIL_USER and EMAIL_PASS are not configured in server/.env.`
  );
  console.log(`[Email Service] Attempting to deliver via Ethereal test mailer for local inspection...`);

  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      ...mailOptions,
      from: `"Zonal Education Office - Katugastota" <${testAccount.user}>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service] 📧 Test confirmation email generated for ${cleanTo}!`);
    console.log(`[Email Service] 🔗 View the email in browser: ${previewUrl}`);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      isTest: true,
    };
  } catch (testErr) {
    console.error(`[Email Service] Ethereal fallback failed:`, testErr.message);
    return {
      success: false,
      error: 'credentials_not_configured_and_test_mailer_failed',
    };
  }
};
