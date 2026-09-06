package com.dementiascreen.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Payload sent by the frontend after Firebase Google sign-in succeeds.
 * The name is profile information only — role/authorization always comes
 * from the server-side BODHIX user record.
 */
@Data
public class FirebaseAuthRequest {
    @NotBlank
    private String idToken;

    private String name;
}
