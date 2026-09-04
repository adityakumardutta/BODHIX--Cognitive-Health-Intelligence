package com.dementiascreen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriorityItemDto {
    private Long personId;
    private String personName;
    private String priorityLevel; // HIGH, MEDIUM, LOW
    private int priorityScore;
    private List<String> reasons;
    private String lastScreeningStatus;
    private String lastScreeningDate;
}
