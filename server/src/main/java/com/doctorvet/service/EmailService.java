package com.doctorvet.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;

  @Value("${app.mail.from:no-reply@zenvevet.com}")
  private String fromEmail;

  @Value("${app.mail.sender-name:Zenve Vet}")
  private String senderName;

  @Value("${app.mail.enabled:true}")
  private boolean mailEnabled;

  @Value("${app.mail.app-url:https://zenvevet.com}")
  private String appUrl;

  @Value("${spring.mail.password:}")
  private String mailPassword;

  @Value("${spring.mail.host:mail.zenvevet.com}")
  private String mailHost;

  public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  /**
   * Asynchronously sends a welcome email to newly registered
   * doctors/practitioners.
   */
  @Async
  public void sendDoctorWelcomeEmail(String toEmail, String doctorName, String specialty) {
    if (toEmail == null || toEmail.isBlank() || !toEmail.contains("@")) {
      log.warn("[Zenve Mail] Skipping doctor welcome email: invalid recipient email '{}'", toEmail);
      return;
    }

    String displayName = (doctorName != null && !doctorName.isBlank()) ? doctorName : "Doctor";
    String displaySpecialty = (specialty != null && !specialty.isBlank()) ? specialty : "Veterinary Medicine";

    String subject = "Welcome to Zenve Vet, " + displayName + "! 🐾";
    String htmlBody = buildDoctorWelcomeHtml(displayName, toEmail, displaySpecialty);
    String plainText = buildDoctorWelcomePlainText(displayName, displaySpecialty);

    sendEmail(toEmail, subject, htmlBody, plainText);
  }

  /**
   * Asynchronously sends a welcome email to newly registered
   * advertisers/sponsors.
   */
  @Async
  public void sendAdvertiserWelcomeEmail(String toEmail, String fullName, String companyName) {
    if (toEmail == null || toEmail.isBlank() || !toEmail.contains("@")) {
      log.warn("[Zenve Mail] Skipping advertiser welcome email: invalid recipient email '{}'", toEmail);
      return;
    }

    String contactName = (fullName != null && !fullName.isBlank()) ? fullName : "Partner";
    String company = (companyName != null && !companyName.isBlank()) ? companyName : "Organization";

    String subject = "Welcome to Zenve Vet Ads & Partnerships — " + company;
    String htmlBody = buildAdvertiserWelcomeHtml(contactName, company, toEmail);
    String plainText = "Welcome to Zenve Vet Partner Network, " + contactName + " (" + company + ")!";

    sendEmail(toEmail, subject, htmlBody, plainText);
  }

  /**
   * Asynchronously sends a password reset OTP verification email from
   * no-reply@zenvevet.com.
   */
  @Async
  public void sendPasswordResetOtpEmail(String toEmail, String recipientName, String otpCode, int expiryMinutes) {
    if (toEmail == null || toEmail.isBlank() || !toEmail.contains("@")) {
      log.warn("[Zenve Mail] Skipping OTP email: invalid recipient email '{}'", toEmail);
      return;
    }

    String displayName = (recipientName != null && !recipientName.isBlank()) ? recipientName : "Doctor / Member";
    String subject = "Zenve Vet: Password Reset Verification Code (" + otpCode + ")";
    String htmlBody = buildPasswordResetOtpHtml(displayName, toEmail, otpCode, expiryMinutes);
    String plainText = buildPasswordResetOtpPlainText(displayName, otpCode, expiryMinutes);

    log.info("==========================================================================");
    log.info("[Zenve Security] PASSWORD RESET OTP GENERATED");
    log.info("Recipient: {} | Name: {} | OTP: [{}] | Expiry: {} mins | Sender: {}",
        toEmail, displayName, otpCode, expiryMinutes, fromEmail);
    log.info("==========================================================================");

    sendEmail(toEmail, subject, htmlBody, plainText);
  }

  /**
   * Asynchronously sends a confirmation email to the user stating that their
   * password has been changed.
   */
  @Async
  public void sendPasswordChangedSuccessEmail(String toEmail, String recipientName) {
    if (toEmail == null || toEmail.isBlank() || !toEmail.contains("@")) {
      log.warn("[Zenve Mail] Skipping password changed email: invalid recipient email '{}'", toEmail);
      return;
    }

    String displayName = (recipientName != null && !recipientName.isBlank()) ? recipientName : "Doctor / Member";
    String subject = "Zenve Vet: Your Password Has Been Successfully Changed 🔒";
    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, hh:mm a"));
    String htmlBody = buildPasswordChangedSuccessHtml(displayName, toEmail, timestamp);
    String plainText = buildPasswordChangedSuccessPlainText(displayName, timestamp);

    log.info("==========================================================================");
    log.info("[Zenve Security] PASSWORD CHANGED CONFIRMATION EMAIL");
    log.info("Recipient: {} | Name: {} | Status: Changed Successfully | Sender: {}",
        toEmail, displayName, fromEmail);
    log.info("==========================================================================");

    sendEmail(toEmail, subject, htmlBody, plainText);
  }

  /**
   * Dispatches an email with HTML & plain text multipart support.
   * Guaranteed to never throw unhandled exceptions to calling methods.
   */
  public void sendEmail(String toEmail, String subject, String htmlContent, String plainTextAlternative) {
    if (!mailEnabled) {
      log.info("[Zenve Mail] Mail delivery disabled via 'app.mail.enabled=false'. Target: {}", toEmail);
      return;
    }

    if (mailSender == null) {
      log.warn("[Zenve Mail] JavaMailSender bean is not initialized. Email to {} was not sent.", toEmail);
      return;
    }

    // If credentials are not set and using remote SMTP, log simulation message to
    // avoid hanging on auth failure
    boolean isLocalHost = "localhost".equalsIgnoreCase(mailHost) || "127.0.0.1".equals(mailHost);
    if (!isLocalHost && (mailPassword == null || mailPassword.isBlank())) {
      log.info(
          "[Zenve Mail - Ready] Automated email prepared for: <{}> | From: {} <{}> | Subject: '{}'. (Set 'SPRING_MAIL_PASSWORD' in application.properties or environment variable to dispatch live SMTP messages)",
          toEmail, senderName, fromEmail, subject);
      return;
    }

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(
          message,
          MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
          StandardCharsets.UTF_8.name());

      helper.setFrom(new InternetAddress(fromEmail, senderName));
      helper.setTo(toEmail.trim());
      helper.setSubject(subject);
      helper.setText(plainTextAlternative != null ? plainTextAlternative : "", htmlContent);

      mailSender.send(message);
      log.info("[Zenve Mail] Successfully dispatched automated email to: {} from: {}", toEmail, fromEmail);
    } catch (Exception e) {
      log.error("[Zenve Mail] Could not dispatch email to {} via SMTP [{}]: {}", toEmail, mailHost, e.getMessage());
    }
  }

  private String buildPasswordResetOtpHtml(String recipientName, String email, String otpCode, int expiryMinutes) {
    return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Zenve Vet Password Reset OTP</title>
          <style>
            body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
            .wrapper { width: 100%%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0; }
            .header { background: linear-gradient(135deg, #003822 0%%, #0D9488 60%%, #059669 100%%); padding: 34px 30px; text-align: center; color: #FFFFFF; }
            .brand-badge { display: inline-block; background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
            .brand-title { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
            .brand-subtitle { margin: 6px 0 0 0; font-size: 13px; opacity: 0.92; font-weight: 400; }
            .content { padding: 34px 30px; line-height: 1.6; }
            .greeting { font-size: 19px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
            .intro { font-size: 14.5px; color: #475569; margin-bottom: 22px; }
            .otp-card { background: #F0FDF4; border: 2px dashed #0D9488; border-radius: 12px; padding: 22px 20px; text-align: center; margin: 24px 0; }
            .otp-label { display: block; font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
            .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #003822; margin: 6px 0; }
            .otp-meta { display: inline-block; font-size: 12px; color: #64748B; margin-top: 6px; font-weight: 500; }
            .details-table { width: 100%%; border-collapse: collapse; margin: 22px 0; font-size: 13.5px; background: #F8FAFC; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; }
            .details-table td { padding: 10px 16px; border-bottom: 1px solid #E2E8F0; }
            .details-table tr:last-child td { border-bottom: none; }
            .details-table .label { color: #64748B; font-weight: 600; width: 35%%; }
            .details-table .value { color: #0F172A; font-weight: 500; }
            .alert-box { background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 6px; padding: 14px 16px; margin: 22px 0; font-size: 13px; color: #92400E; }
            .footer { background-color: #0F172A; padding: 24px 30px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div style="background-color: #F8FAFC; padding: 32px 16px;">
            <div class="wrapper">
              <div class="header">
                <span class="brand-badge">Security Verification</span>
                <h1 class="brand-title">ZENVE VET</h1>
                <p class="brand-subtitle">The Professional Network for Animal Healthcare</p>
              </div>
              <div class="content">
                <div class="greeting">Hello %s,</div>
                <p class="intro">
                  We received a request to reset the password for your Zenve Vet account.
                  Please use the One-Time Password (OTP) below to verify your request and set your new password.
                </p>

                <div class="otp-card">
                  <span class="otp-label">Verification Code (OTP)</span>
                  <div class="otp-code">%s</div>
                  <span class="otp-meta">⏱ Valid for %d minutes • Single-use only</span>
                </div>

                <table class="details-table">
                  <tr>
                    <td class="label">Registered Email</td>
                    <td class="value">%s</td>
                  </tr>
                  <tr>
                    <td class="label">Request Type</td>
                    <td class="value">Password Reset Verification</td>
                  </tr>
                  <tr>
                    <td class="label">Dispatched By</td>
                    <td class="value">no-reply@zenvevet.com</td>
                  </tr>
                </table>

                <div class="alert-box">
                  <strong>Security Notice:</strong> Never share this OTP code with anyone. Zenve Vet representatives will never ask for your verification code. If you did not initiate this request, your account is still secure and you can safely disregard this email.
                </div>
              </div>
              <div class="footer">
                <p style="margin: 0 0 6px 0; font-weight: 600; color: #E2E8F0;">Zenve Pets Healthcare Pvt. Ltd.</p>
                <p style="margin: 0 0 10px 0;">Bengaluru, Karnataka, India • <a href="https://zenvevet.com" style="color: #14B8A6; text-decoration: none;">www.zenvevet.com</a></p>
                <p style="margin: 0; font-size: 11px; color: #64748B;">
                  This automated security message was sent to %s from <strong>no-reply@zenvevet.com</strong>.
                  <br>Please do not reply directly to this email address.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
        """
        .formatted(recipientName, otpCode, expiryMinutes, email, email);
  }

  private String buildPasswordResetOtpPlainText(String recipientName, String otpCode, int expiryMinutes) {
    return """
        Hello %s,

        We received a request to reset your Zenve Vet account password.
        Your One-Time Password (OTP) is:

        ====================
        %s
        ====================

        This OTP is valid for %d minutes.

        Never share this OTP with anyone. If you did not request this password reset, please ignore this email.

        Best regards,
        Zenve Vet Security Team
        Zenve Pets Healthcare Pvt. Ltd.
        Sent from: no-reply@zenvevet.com
        """.formatted(recipientName, otpCode, expiryMinutes);
  }

  private String buildPasswordChangedSuccessHtml(String recipientName, String email, String timestamp) {
    return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed Successfully - Zenve Vet</title>
          <style>
            body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
            .wrapper { width: 100%%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0; }
            .header { background: linear-gradient(135deg, #003822 0%%, #0D9488 60%%, #059669 100%%); padding: 34px 30px; text-align: center; color: #FFFFFF; }
            .brand-badge { display: inline-block; background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
            .brand-title { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
            .content { padding: 34px 30px; line-height: 1.6; }
            .status-badge { display: inline-flex; align-items: center; background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; font-size: 13px; font-weight: 700; border-radius: 20px; padding: 6px 16px; margin-bottom: 16px; }
            .greeting { font-size: 19px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
            .intro { font-size: 14.5px; color: #475569; margin-bottom: 22px; }
            .details-table { width: 100%%; border-collapse: collapse; margin: 22px 0; font-size: 13.5px; background: #F8FAFC; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; }
            .details-table td { padding: 10px 16px; border-bottom: 1px solid #E2E8F0; }
            .details-table tr:last-child td { border-bottom: none; }
            .details-table .label { color: #64748B; font-weight: 600; width: 35%%; }
            .details-table .value { color: #0F172A; font-weight: 500; }
            .cta-container { text-align: center; margin: 28px 0 20px 0; }
            .cta-btn { display: inline-block; background-color: #003822; color: #FFFFFF !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 56, 34, 0.25); }
            .danger-box { background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 6px; padding: 14px 16px; margin: 24px 0 10px 0; font-size: 13px; color: #991B1B; }
            .footer { background-color: #0F172A; padding: 24px 30px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div style="background-color: #F8FAFC; padding: 32px 16px;">
            <div class="wrapper">
              <div class="header">
                <span class="brand-badge">Security Confirmation</span>
                <h1 class="brand-title">ZENVE VET</h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.92;">The Professional Network for Animal Healthcare</p>
              </div>
              <div class="content">
                <div class="status-badge">✓ Password Updated Successfully</div>
                <div class="greeting">Dear %s,</div>
                <p class="intro">
                  This notification confirms that the password for your Zenve Vet account registered under <strong>%s</strong> was successfully updated.
                </p>

                <table class="details-table">
                  <tr>
                    <td class="label">Account Email</td>
                    <td class="value">%s</td>
                  </tr>
                  <tr>
                    <td class="label">Date & Time</td>
                    <td class="value">%s</td>
                  </tr>
                  <tr>
                    <td class="label">Status</td>
                    <td class="value" style="color: #047857; font-weight: 700;">Password Changed & Secured</td>
                  </tr>
                  <tr>
                    <td class="label">Dispatched From</td>
                    <td class="value">no-reply@zenvevet.com</td>
                  </tr>
                </table>

                <div class="cta-container">
                  <a href="%s" class="cta-btn" target="_blank">Sign In to Zenve Vet →</a>
                </div>

                <div class="danger-box">
                  <strong>Didn't make this change?</strong><br>
                  If you did not perform this password change, your account may be compromised. Please immediately reach out to our emergency support desk at <a href="mailto:support@zenvevet.com" style="color: #991B1B; font-weight: 700;">support@zenvevet.com</a> so we can lock and protect your account.
                </div>
              </div>
              <div class="footer">
                <p style="margin: 0 0 6px 0; font-weight: 600; color: #E2E8F0;">Zenve Pets Healthcare Pvt. Ltd.</p>
                <p style="margin: 0 0 10px 0;">Bengaluru, Karnataka, India • <a href="https://zenvevet.com" style="color: #14B8A6; text-decoration: none;">www.zenvevet.com</a></p>
                <p style="margin: 0; font-size: 11px; color: #64748B;">
                  This automated security communication was sent to %s from <strong>no-reply@zenvevet.com</strong>.
                  <br>Please do not reply directly to this email address.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
        """
        .formatted(recipientName, email, email, timestamp, appUrl, email);
  }

  private String buildPasswordChangedSuccessPlainText(String recipientName, String timestamp) {
    return """
        Dear %s,

        Your password for Zenve Vet has been changed successfully.

        Event Details:
        - Timestamp: %s
        - Status: Password Changed Successfully
        - Sender: no-reply@zenvevet.com

        Sign in to Zenve Vet: %s

        IMPORTANT: If you did not make this change, please immediately contact our security desk at support@zenvevet.com.

        Best regards,
        Zenve Vet Security Team
        Zenve Pets Healthcare Pvt. Ltd.
        """
        .formatted(recipientName, timestamp, appUrl);
  }

  private String buildDoctorWelcomeHtml(String doctorName, String email, String specialty) {
    return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Zenve Vet</title>
          <style>
            body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
            .wrapper { width: 100%%; max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); }
            .header { background: linear-gradient(135deg, #0F766E 0%%, #0D9488 50%%, #059669 100%%); padding: 36px 32px; text-align: center; color: #FFFFFF; }
            .brand-badge { display: inline-block; background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
            .brand-title { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
            .brand-subtitle { margin: 6px 0 0 0; font-size: 14px; opacity: 0.92; font-weight: 400; }
            .content { padding: 36px 32px; line-height: 1.6; }
            .greeting { font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
            .intro { font-size: 15px; color: #475569; margin-bottom: 24px; }
            .feature-box { background: #F0FDF4; border-left: 4px solid #10B981; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
            .feature-item { margin-bottom: 12px; font-size: 14px; color: #1E293B; }
            .feature-item:last-child { margin-bottom: 0; }
            .feature-item strong { color: #065F46; }
            .details-table { width: 100%%; border-collapse: collapse; margin: 24px 0; font-size: 14px; background: #F8FAFC; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; }
            .details-table td { padding: 10px 16px; border-bottom: 1px solid #E2E8F0; }
            .details-table tr:last-child td { border-bottom: none; }
            .details-table .label { color: #64748B; font-weight: 600; width: 35%%; }
            .details-table .value { color: #0F172A; font-weight: 500; }
            .cta-container { text-align: center; margin: 32px 0 24px 0; }
            .cta-btn { display: inline-block; background-color: #0D9488; color: #FFFFFF !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35); }
            .support-note { font-size: 13px; color: #64748B; background-color: #F1F5F9; border-radius: 8px; padding: 12px 16px; margin-top: 24px; text-align: center; }
            .footer { background-color: #0F172A; padding: 28px 32px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6; }
            .footer a { color: #14B8A6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div style="background-color: #F8FAFC; padding: 32px 16px;">
            <div class="wrapper">
              <div class="header">
                <span class="brand-badge">Official Welcome</span>
                <h1 class="brand-title">Zenve Vet 🐾</h1>
                <p class="brand-subtitle">India's Premier Veterinary Clinical Community & Network</p>
              </div>
              <div class="content">
                <div class="greeting">Dear %s,</div>
                <p class="intro">
                  Welcome to <strong>Zenve Vet</strong>! Your practitioner account has been successfully created. We are excited to welcome you into a dedicated, collaborative ecosystem designed exclusively for veterinary professionals.
                </p>

                <table class="details-table">
                  <tr>
                    <td class="label">Registered Name</td>
                    <td class="value">%s</td>
                  </tr>
                  <tr>
                    <td class="label">Registered Email</td>
                    <td class="value">%s</td>
                  </tr>
                  <tr>
                    <td class="label">Clinical Specialty</td>
                    <td class="value">%s</td>
                  </tr>
                  <tr>
                    <td class="label">Sender</td>
                    <td class="value">no-reply@zenvevet.com</td>
                  </tr>
                </table>

                <div class="feature-box">
                  <div class="feature-item"><strong>🩺 Clinical Case Exchange:</strong> Share challenging diagnostic cases, review imaging, and collaborate with veterinary surgeons and specialists.</div>
                  <div class="feature-item"><strong>🤝 Verified Practitioner Network:</strong> Connect and build professional relationships with verified veterinarians across India.</div>
                  <div class="feature-item"><strong>📚 Clinical Feeds & Updates:</strong> Stay abreast of latest veterinary guidelines, treatments, and events.</div>
                </div>

                <div class="cta-container">
                  <a href="%s" class="cta-btn" target="_blank">Access Your Zenve Vet Account →</a>
                </div>

                <div class="support-note">
                  Need assistance or have questions? Our veterinary support team is here to assist at <a href="mailto:support@zenvevet.com" style="color: #0D9488; font-weight: 600;">support@zenvevet.com</a>.
                </div>
              </div>
              <div class="footer">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #E2E8F0;">Zenve Pets Healthcare Pvt. Ltd.</p>
                <p style="margin: 0 0 12px 0;">Bengaluru, Karnataka, India • <a href="https://zenvevet.com">www.zenvevet.com</a></p>
                <p style="margin: 0; font-size: 11px; color: #64748B;">
                  This automated welcome message was sent to %s from <strong>no-reply@zenvevet.com</strong>.
                  <br>Please do not reply directly to this email address.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
        """
        .formatted(doctorName, doctorName, email, specialty, appUrl, email);
  }

  private String buildDoctorWelcomePlainText(String doctorName, String specialty) {
    return """
        Dear %s,

        Welcome to Zenve Vet!
        Your practitioner account has been successfully created. We are excited to welcome you into India's dedicated veterinary clinical network.

        Account Details:
        - Name: %s
        - Specialty: %s
        - Sender: no-reply@zenvevet.com

        Platform Highlights:
        1. Clinical Case Exchange: Collaborate on complex diagnostic cases and surgery.
        2. Verified Practitioner Network: Connect with licensed veterinarians across India.
        3. AI Clinical Companion: Instant veterinary differential diagnoses and reference tools.
        4. Clinical Feeds: Stay up to date with evidence-based medicine.

        Visit Zenve Vet: %s

        If you have questions, contact support@zenvevet.com.

        Best regards,
        The Zenve Vet Team
        Zenve Pets Healthcare Pvt. Ltd.
        Bengaluru, Karnataka, India
        """
        .formatted(doctorName, doctorName, specialty, appUrl);
  }

  private String buildAdvertiserWelcomeHtml(String contactName, String companyName, String email) {
    return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Zenve Vet Partnerships</title>
          <style>
            body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
            .wrapper { width: 100%%; max-width: 600px; margin: 0 auto; background: #FFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); }
            .header { background: #0F172A; padding: 32px; text-align: center; color: #FFF; }
            .content { padding: 32px; line-height: 1.6; }
            .cta { display: inline-block; background: #0D9488; color: #FFF !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; margin: 20px 0; }
            .footer { background: #F1F5F9; padding: 20px; text-align: center; font-size: 12px; color: #64748B; }
          </style>
        </head>
        <body>
          <div style="padding: 24px 16px;">
            <div class="wrapper">
              <div class="header">
                <h2 style="margin: 0; color: #14B8A6;">Zenve Vet Ads & Partnerships</h2>
                <p style="margin: 6px 0 0; font-size: 13px; color: #94A3B8;">Connecting animal healthcare brands with verified veterinarians</p>
              </div>
              <div class="content">
                <p>Dear <strong>%s</strong>,</p>
                <p>Thank you for registering <strong>%s</strong> on the Zenve Vet Partner Portal. Your advertiser account is active and you can now launch targeted educational campaigns, sponsor clinical updates, and reach verified veterinary practitioners.</p>
                <div style="text-align: center;">
                  <a href="%s" class="cta">Launch Partner Portal →</a>
                </div>
                <p style="font-size: 13px; color: #64748B;">For partnership inquiries and enterprise billing, reach us at ads@zenvevet.com.</p>
              </div>
              <div class="footer">
                Sent automatically by <strong>no-reply@zenvevet.com</strong> • Zenve Pets Healthcare Pvt. Ltd.
              </div>
            </div>
          </div>
        </body>
        </html>
        """
        .formatted(contactName, companyName, appUrl);
  }
}
