// backend/src/lib/emailService.js

/**
 * Service to handle Transactional Email Dispatch via Brevo API
 */
export async function sendOtpEmail(toEmail, recipientName, otpCode) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.GOOGLE_EMAIL || 'teamclickjack@gmail.com';
  const senderName = 'PayPilot Security';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF; color: #09090B;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #09090B; margin: 0; font-size: 24px; font-weight: 800; tracking: -0.5px;">PayPilot</h2>
        <p style="color: #71717A; font-size: 13px; margin-top: 4px; font-weight: 500;">Autonomous HRMS & Sentinel Payroll Engine</p>
      </div>

      <div style="border-top: 1px solid #F1F5F9; margin: 20px 0;"></div>

      <h3 style="color: #09090B; font-size: 18px; margin-bottom: 8px;">Verify Your Work Email</h3>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        Hello <strong>${recipientName || 'User'}</strong>,
      </p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        Thank you for creating an account with PayPilot. Please use the verification code below to authorize your account. This code is valid for <strong>10 minutes</strong>.
      </p>

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; text-align: center; padding: 20px; border-radius: 10px; margin: 24px 0; letter-spacing: 8px;">
        <span style="font-size: 32px; font-weight: 800; color: #1E40AF; font-family: monospace;">${otpCode}</span>
      </div>

      <p style="color: #94A3B8; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0;">
        If you did not request this verification code, please ignore this message or contact support if you have concerns.
      </p>

      <div style="border-top: 1px solid #F1F5F9; margin: 24px 0 16px 0;"></div>
      <p style="text-align: center; color: #94A3B8; font-size: 11px; margin: 0;">
        &copy; 2026 PayPilot Global Inc. All rights reserved.
      </p>
    </div>
  `;

  console.log(`[EMAIL INITIATE] Sending OTP to ${toEmail} using Brevo API...`);

  if (!brevoApiKey) {
    console.warn('[EMAIL WARN] BREVO_API_KEY is not configured in .env');
    return { success: false, error: 'BREVO_API_KEY missing' };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: recipientName || 'User' }],
        subject: `${otpCode} is your PayPilot Verification Code`,
        htmlContent,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log(`[BREVO API SUCCESS] Email successfully sent to ${toEmail}. Message ID: ${data.messageId}`);
      return { success: true, messageId: data.messageId };
    } else {
      console.error(`[BREVO API ERROR] Failed to send email to ${toEmail}:`, data);
      return { success: false, error: data.message || 'Brevo API error' };
    }
  } catch (err) {
    console.error(`[EMAIL DISPATCH EXCEPTION] Exception sending email to ${toEmail}:`, err);
    return { success: false, error: err.message };
  }
}
