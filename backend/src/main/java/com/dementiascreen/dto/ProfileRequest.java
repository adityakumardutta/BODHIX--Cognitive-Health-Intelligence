package com.dementiascreen.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Specialist details captured after login (normal or Google). */
@Data
public class ProfileRequest {
    @NotBlank
    private String fullName;

    private String specialization;
}
