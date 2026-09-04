package com.dementiascreen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/** Full per-question score-card payload for a completed screening. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreCardResponse {
    private Long screeningId;
    private Long personId;
    private LocalDateTime completedAt;
    private List<ScoreCardSectionDto> sections;
}