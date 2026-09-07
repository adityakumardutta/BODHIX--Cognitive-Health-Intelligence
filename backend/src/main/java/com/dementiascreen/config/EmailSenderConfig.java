package com.dementiascreen.config;

import com.dementiascreen.service.EmailSender;
import com.dementiascreen.service.ResendEmailSender;
import com.dementiascreen.service.SmtpEmailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.client.RestClient;

/**
 * Selects the email transport implementation based on the {@code email.provider}
 * configuration property:
 * <ul>
 *   <li>{@code smtp} (default) — {@link SmtpEmailSender} for local development</li>
 *   <li>{@code resend} — {@link ResendEmailSender} for production on Render
 *       (HTTPS API, works around Render Free's SMTP port blocks)</li>
 * </ul>
 * Each implementation is constructed here (not auto-scanned as a component) so
 * only the selected transport is registered as a bean, avoiding duplicate bean
 * definitions.
 */
@Configuration
public class EmailSenderConfig {

    /** SMTP implementation — active when email.provider is "smtp" or unset. */
    @Bean
    @ConditionalOnProperty(name = "email.provider", havingValue = "smtp", matchIfMissing = true)
    public EmailSender smtpEmailSender(
            JavaMailSender mailSender,
            @Value("${app.mail.from:}") String mailFrom,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${spring.mail.username:}") String mailUsername) {
        return new SmtpEmailSender(mailSender, mailFrom, mailHost, mailUsername);
    }

    /** Resend HTTPS API implementation — active when email.provider=resend. */
    @Bean
    @ConditionalOnProperty(name = "email.provider", havingValue = "resend")
    public EmailSender resendEmailSender(
            RestClient.Builder restClientBuilder,
            @Value("${RESEND_API_KEY:}") String apiKey,
            @Value("${RESEND_FROM:}") String from) {
        return new ResendEmailSender(restClientBuilder, apiKey, from);
    }

    /** RestClient builder used by the Resend sender. */
    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}
