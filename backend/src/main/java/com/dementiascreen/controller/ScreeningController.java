package com.dementiascreen.controller;

import com.dementiascreen.dto.ScoreCardResponse;
import com.dementiascreen.dto.ScreeningResultResponse;
import com.dementiascreen.dto.ScreeningSubmitRequest;
import com.dementiascreen.entity.Question;
import com.dementiascreen.entity.User;
import com.dementiascreen.exception.BadRequestException;
import com.dementiascreen.service.QuestionService;
import com.dementiascreen.service.ReportEmailService;
import com.dementiascreen.service.ScreeningScoringService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/screenings")
public class ScreeningController {

    private static final Logger log = LoggerFactory.getLogger(ScreeningController.class);

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

    /**
     * Submits a screening and automatically sends the report email to the
     * authenticated specialist. Returns the result with email status.
     */
    @PostMapping
    public ScreeningResultResponse submit(@Valid @RequestBody ScreeningSubmitRequest request,
                                          @AuthenticationPrincipal User user) {
        ScreeningResultResponse result = scoringService.submitScreening(request);

        // Automatically send report email after successful screening
        if (result != null && result.getScreeningId() != null && user != null) {
            try {
                reportEmailService.emailReportToSpecialist(result.getScreeningId(), user);
                result.setEmailSent(true);
                result.setEmailRecipient(user.getEmail());
                log.info("Auto-sent report email for screening {} to {}", result.getScreeningId(), user.getEmail());
            } catch (BadRequestException e) {
                // Clean refusal (e.g. the guest account has no usable email):
                // surface the friendly message without failing the submission.
                result.setEmailSent(false);
                result.setEmailError(e.getMessage());
                log.info("Report email not sent for screening {}: {}", result.getScreeningId(), e.getMessage());
            } catch (Exception e) {
                // Email failure should not fail the screening submission
                result.setEmailSent(false);
                result.setEmailError("Report generated, but email delivery is currently unavailable.");
                log.warn("Auto-email failed for screening {}: {}", result.getScreeningId(), e.getMessage());
            }
        }

        return result;
    }
}
