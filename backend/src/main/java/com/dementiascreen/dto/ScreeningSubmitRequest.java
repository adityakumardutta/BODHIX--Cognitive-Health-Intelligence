package com.dementiascreen.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ScreeningSubmitRequest {
    @NotNull
    private Long personId;

    @NotEmpty
    private List<AnswerSubmission> answers;

    private Integer durationSeconds;

    private Boolean isOfflineCapture = false;
}
