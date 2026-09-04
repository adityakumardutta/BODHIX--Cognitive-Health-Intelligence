package com.dementiascreen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningResultResponse {
    private Long screeningId;
    private Long personId;
    private String overallStatus; // LOW_CONCERN or REVIEW_RECOMMENDED
    private LocalDateTime completedAt;
    private String recommendationText;
    private List<SectionResultDto> sections;
}
