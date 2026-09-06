package com.dementiascreen.exception;

/**
 * Thrown when the email report cannot be delivered due to SMTP configuration
 * or connectivity issues. Mapped to HTTP 503 (Service Unavailable) by the
 * global exception handler - clearly distinct from a client-caused 400.
 */
public class EmailDeliveryException extends RuntimeException {
    public EmailDeliveryException(String message) {
        super(message);
    }
}
