package com.dementiascreen.service;

import com.dementiascreen.exception.EmailDeliveryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;

/**
 * SMTP-based email sender using Spring's JavaMailSender.
 * <p>
 * Instantiated by {@link com.dementiascreen.config.EmailSenderConfig} when
 * {@code email.provider=smtp} (the default for local development).
 * Render Free blocks outbound SMTP on ports 25/465/587, so this implementation
 * is NOT used in production — {@link ResendEmailSender} takes over there.
 */
public class SmtpEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailSender.class);

    private final JavaMailSender mailSender;
    private final String mailFrom;
    private final String mailHost;
    private final String mailUsername;

    public SmtpEmailSender(JavaMailSender mailSender,
                           String mailFrom,
                           String mailHost,
                           String mailUsername) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
        this.mailHost = mailHost;
        this.mailUsername = mailUsername;
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String body,
                                        byte[] attachment, String attachmentName) {
        if (mailHost == null || mailHost.isBlank()
                || mailUsername == null || mailUsername.isBlank()
                || mailFrom == null || mailFrom.isBlank()) {
            throw new EmailDeliveryException("Email sending is not configured on this server");
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);
            helper.addAttachment(attachmentName, () -> new java.io.ByteArrayInputStream(attachment), "application/pdf");
            mailSender.send(message);
            log.info("Report email sent via SMTP to {}", to);
        } catch (MailException | jakarta.mail.MessagingException e) {
            log.error("SMTP delivery failed to {}: {}", to, e.getMessage());
            throw new EmailDeliveryException("Failed to send the report email: " + e.getMessage());
        }
    }
}
