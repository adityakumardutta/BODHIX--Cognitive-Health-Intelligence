package com.dementiascreen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreCardSectionDto {
    private String sectionCode;
    private String sectionName;
    private BigDecimal rawScore;
    private BigDecimal maxScore;
    private boolean flaggedForReview;
    private List<ScoreCardItemDto> items;
}