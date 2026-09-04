package com.dementiascreen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/** Returned by PATCH /api/profile after saving specialist details. */
@Data
@AllArgsConstructor
public class ProfileResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String specialization;
}
