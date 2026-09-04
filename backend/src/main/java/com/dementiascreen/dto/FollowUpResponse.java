package com.dementiascreen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpResponse {
    private Long id;
    private Long personId;
    private String personName;
    private String status;
    private String reason;
    private LocalDate scheduledDate;
    private LocalDateTime createdAt;
}
