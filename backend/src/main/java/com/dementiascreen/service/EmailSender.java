package com.dementiascreen.service;

/**
 * Abstraction over the email transport so the application can switch between
 * SMTP (local development) and an HTTPS email API (production on Render, which
 * blocks outbound SMTP on ports 25/465/587) without changing email behavior.
 *
 * <p>Every implementation delivers the exact same real email: same recipient,
 * same subject, same PDF attachment, and honest success/failure semantics.
 */
public interface EmailSender {

    /**
     * Send an email with a binary attachment.
     *
     * @param to               recipient email address
     * @param subject          email subject line
     * @param body             plain-text email body
     * @param attachment       the raw bytes of the attachment
     * @param attachmentName   file name for the attachment (e.g. "report.pdf")
     * @throws com.dementiascreen.exception.EmailDeliveryException on any delivery failure
     */
    void sendEmailWithAttachment(String to, String subject, String body,
                                 byte[] attachment, String attachmentName);
}
