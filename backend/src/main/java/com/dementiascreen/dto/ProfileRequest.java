package com.dementiascreen.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Specialist details captured after login (normal email/password login). */
@Data
public class ProfileRequest {
    @NotBlank
    private String fullName;

    private String specialization;
}
