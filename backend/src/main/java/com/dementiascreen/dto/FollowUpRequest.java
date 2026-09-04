package com.dementiascreen.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FollowUpRequest {
    @NotNull
    private Long personId;

    private Long screeningId;

    private String reason;

    private LocalDate scheduledDate;

    private String notes;
}
