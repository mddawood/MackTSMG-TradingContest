import logging
import requests
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("app.email")


def generate_password_reset_html(to_email: str, reset_url: str) -> str:
    """Generate a sleek, responsive HTML email for password reset."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #131b2e; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid #1e293b;">
              <div style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 9999px; margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #a855f7;">MWM Trading Championship</span>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Password Reset Request</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Hello,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                We received a request to reset the password for your account (<strong style="color: #f1f5f9;">{to_email}</strong>). Click the button below to select a new password.
              </p>

              <!-- Action Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);">
                    <a href="{reset_url}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.02em;">
                      Reset Your Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 8px; padding: 14px 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                  ⏱️ <strong>Note:</strong> This link is single-use and will expire in <strong>15 minutes</strong>. If you did not request this change, you can safely ignore this email — your password will remain unchanged.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #64748b; word-break: break-all;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{reset_url}" style="color: #818cf8; text-decoration: underline;">{reset_url}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #0d1322; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #475569;">
                © 2026 MWM Trading Championship. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    """
    Send a password reset email using Resend API.
    Always prints the reset URL to the terminal/console for instant local testing.
    """
    # Always log reset link to console for developer convenience and sandbox testing
    print("\n" + "=" * 76)
    print(f"[AUTH] PASSWORD RESET LINK GENERATED FOR: {to_email}")
    print(f"       Reset URL: {reset_url}")
    print("=" * 76 + "\n")

    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is not configured. Email will only appear in console.")
        return True

    payload = {
        "from": settings.EMAILS_FROM_EMAIL,
        "to": [to_email],
        "subject": "Reset Your Password - MWM Trading Championship",
        "html": generate_password_reset_html(to_email, reset_url),
        "text": f"Reset your password for MWM Trading Championship:\n\n{reset_url}\n\nThis link will expire in 15 minutes."
    }

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )

        if response.status_code in (200, 201):
            logger.info(f"Password reset email sent successfully to {to_email} via Resend.")
            return True
        else:
            logger.warning(
                f"Resend API returned status {response.status_code}: {response.text}. "
                f"(If in sandbox mode, emails are restricted to the Resend account owner. "
                f"Use the console link above for local testing.)"
            )
            # Return True so frontend gets a success response without exposing Resend sandbox restrictions
            return True

    except Exception as exc:
        logger.error(f"Error calling Resend API for {to_email}: {exc}", exc_info=True)
        # Even if network fails, link was logged to console
        return True
