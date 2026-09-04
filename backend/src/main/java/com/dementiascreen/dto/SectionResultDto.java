package com.dementiascreen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionResultDto {
    private String sectionCode;
    private String sectionName;
    private BigDecimal rawScore;
    private BigDecimal maxScore;
    private boolean flaggedForReview;
}
