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
public class ScoreCardItemDto {
    private Long questionId;
    private String prompt;
    private String response;
    private BigDecimal score;
}