package com.dementiascreen.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Payload sent by the frontend after Google redirects back with an authorization code. */
@Data
public class GoogleAuthRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String redirectUri;
}
