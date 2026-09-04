package com.dementiascreen.controller;

import com.dementiascreen.dto.ScoreCardResponse;
import com.dementiascreen.dto.ScreeningResultResponse;
import com.dementiascreen.dto.ScreeningSubmitRequest;
import com.dementiascreen.entity.Question;
import com.dementiascreen.entity.User;
import com.dementiascreen.service.QuestionService;
import com.dementiascreen.service.ReportEmailService;
import com.dementiascreen.service.ScreeningScoringService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/screenings")
public class ScreeningController {

    private final ScreeningScoringService scoringService;
    private final QuestionService questionService;
    private final ReportEmailService reportEmailService;

    public ScreeningController(ScreeningScoringService scoringService, QuestionService questionService,
                               ReportEmailService reportEmailService) {
        this.scoringService = scoringService;
        this.questionService = questionService;
        this.reportEmailService = reportEmailService;
    }

    @GetMapping("/questions/{sectionCode}")
    public List<Question> getQuestions(@PathVariable String sectionCode) {
        return questionService.getBySection(sectionCode.toUpperCase());
    }

    @GetMapping("/{screeningId}/scorecard")
    public ScoreCardResponse getScoreCard(@PathVariable Long screeningId) {
        return scoringService.getScoreCard(screeningId);
    }

    /**
     * Emails the REAL evaluation report PDF to the current authenticated
     * specialist's registered email address (no email input, no hardcoding).
     */
    @PostMapping("/{screeningId}/email-report")
    public Map<String, String> emailReport(@PathVariable Long screeningId,
                                           @AuthenticationPrincipal User user) {
        reportEmailService.emailReportToSpecialist(screeningId, user);
        return Map.of("status", "sent");
    }

    @PostMapping
    public ScreeningResultResponse submit(@Valid @RequestBody ScreeningSubmitRequest request) {
        return scoringService.submitScreening(request);
    }
}
