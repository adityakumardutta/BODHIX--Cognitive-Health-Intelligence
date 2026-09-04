package com.dementiascreen.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerSubmission {
    @NotNull
    private Long questionId;

    @NotNull
    private String responseValue; // option label, e.g. "Yes" / "No" / a numeric task score as string
}
