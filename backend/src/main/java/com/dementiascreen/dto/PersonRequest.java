package com.dementiascreen.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PersonRequest {
    @NotBlank
    private String fullName;

    @NotNull @Min(0) @Max(130)
    private Integer age;

    @NotBlank
    private String gender; // MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY

    private String phone;

    private String location;

    private String emergencyContactName;

    private String emergencyContactPhone;

    @NotNull
    private Boolean consentGiven;
}
