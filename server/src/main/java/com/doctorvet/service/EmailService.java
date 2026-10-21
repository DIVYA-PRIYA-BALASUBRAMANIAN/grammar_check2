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

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Asynchronously sends a welcome email to newly registered doctors/practitioners.
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
     * Asynchronously sends a welcome email to newly registered advertisers/sponsors.
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

        // If credentials are not set and using remote SMTP, log simulation message to avoid hanging on auth failure
        boolean isLocalHost = "localhost".equalsIgnoreCase(mailHost) || "127.0.0.1".equals(mailHost);
        if (!isLocalHost && (mailPassword == null || mailPassword.isBlank())) {
            log.info("[Zenve Mail - Ready] Automated welcome email prepared for: <{}> | From: {} <{}> | Subject: '{}'. (Set 'SPRING_MAIL_PASSWORD' in application.properties or environment variable to dispatch live SMTP messages)",
                    toEmail, senderName, fromEmail, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(new InternetAddress(fromEmail, senderName));
            helper.setTo(toEmail.trim());
            helper.setSubject(subject);
            helper.setText(plainTextAlternative != null ? plainTextAlternative : "", htmlContent);

            mailSender.send(message);
            log.info("[Zenve Mail] Successfully dispatched automated welcome email to: {} from: {}", toEmail, fromEmail);
        } catch (Exception e) {
            log.error("[Zenve Mail] Could not dispatch welcome email to {} via SMTP [{}]: {}", toEmail, mailHost, e.getMessage());
        }
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
                      <div class="feature-item"><strong>🤖 AI Clinical Companion:</strong> Access instantaneous differential diagnoses, dosage guidelines, and veterinary protocols.</div>
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
            """.formatted(doctorName, doctorName, email, specialty, appUrl, email);
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
            """.formatted(doctorName, doctorName, specialty, appUrl);
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
            """.formatted(contactName, companyName, appUrl);
    }
}
