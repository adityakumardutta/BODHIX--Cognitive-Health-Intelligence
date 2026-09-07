package com.dementiascreen.service;

import com.dementiascreen.exception.EmailDeliveryException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;

/**
 * HTTPS-based email sender using the Resend Email API.
 * <p>
 * Instantiated by {@link com.dementiascreen.config.EmailSenderConfig} when
 * {@code email.provider=resend} (production on Render). Unlike SMTP, this sends
 * email over HTTPS (port 443), which Render Free allows.
 * <p>
 * Environment variables required:
 * <ul>
 *   <li>{@code RESEND_API_KEY} — Resend API key (starts with {@code re_})</li>
 *   <li>{@code RESEND_FROM} — Verified sender address (e.g. {@code Bodhix <onboarding@resend.dev>})</li>
 * </ul>
 */
public class ResendEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailSender.class);
    private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final RestClient restClient;
    private final String apiKey;
    private final String from;

    public ResendEmailSender(RestClient.Builder restClientBuilder,
                             String apiKey,
                             String from) {
        this.restClient = restClientBuilder.build();
        this.apiKey = apiKey;
        this.from = from;
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String body,
                                        byte[] attachment, String attachmentName) {
        if (apiKey == null || apiKey.isBlank() || from == null || from.isBlank()) {
            throw new EmailDeliveryException("Email sending is not configured on this server");
        }
        String b64 = java.util.Base64.getEncoder().encodeToString(attachment);

        // Build JSON payload with attachment using Jackson tree model (no extra DTO class needed)
        ObjectNode payload = MAPPER.createObjectNode();
        payload.put("from", from);
        ArrayNode toNode = payload.putArray("to");
        toNode.add(to);
        payload.put("subject", subject);
        payload.put("text", body);

        ArrayNode attachments = payload.putArray("attachments");
        ObjectNode att = attachments.addObject();
        att.put("filename", attachmentName);
        att.put("content", b64);

        try {
            String response = restClient.post()
                    .uri(RESEND_ENDPOINT)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, resp) -> {
                        String errBody = new String(resp.getBody().readAllBytes(), StandardCharsets.UTF_8);
                        log.error("Resend API error {}: {}", resp.getStatusCode(), errBody);
                        throw new EmailDeliveryException("Email service returned " + resp.getStatusCode());
                    })
                    .body(String.class);

            log.info("Report email sent via Resend HTTPS API to {}", to);
        } catch (EmailDeliveryException e) {
            throw e;
        } catch (Exception e) {
            log.error("Resend delivery failed to {}: {}", to, e.getMessage());
            throw new EmailDeliveryException("Failed to send the report email: " + e.getMessage());
        }
    }
}
