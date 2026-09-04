package com.dementiascreen.service;

import com.dementiascreen.dto.*;
import com.dementiascreen.entity.*;
import com.dementiascreen.exception.BadRequestException;
import com.dementiascreen.exception.ResourceNotFoundException;
import com.dementiascreen.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Central scoring engine for AD8 / RUDAS / PFAQ.
 *
 * Scoring rules are data-driven (assessment_sections.review_cutoff,
 * scoring_direction, and questions.options_json) rather than hardcoded, so
 * validated instrument content and cutoffs from an authorized source can be
 * inserted via the database without changing this code.
 *
 * WHY A HashMap:
 * Every submitted answer needs its matching Question (for max score,
 * section, and option->score mapping). A HashMap keyed by question ID gives
 * O(1) lookup instead of scanning the question list per answer, which
 * matters once a screening includes dozens of items across three
 * instruments.
 */
@Service
public class ScreeningScoringService {

    private final QuestionRepository questionRepository;
    private final AssessmentSectionRepository sectionRepository;
    private final ScreeningRepository screeningRepository;
    private final AnswerRepository answerRepository;
    private final ScreeningResultRepository screeningResultRepository;
    private final ScreeningHistoryRepository screeningHistoryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ScreeningScoringService(QuestionRepository questionRepository,
                                    AssessmentSectionRepository sectionRepository,
                                    ScreeningRepository screeningRepository,
                                    AnswerRepository answerRepository,
                                    ScreeningResultRepository screeningResultRepository,
                                    ScreeningHistoryRepository screeningHistoryRepository) {
        this.questionRepository = questionRepository;
        this.sectionRepository = sectionRepository;
        this.screeningRepository = screeningRepository;
        this.answerRepository = answerRepository;
        this.screeningResultRepository = screeningResultRepository;
        this.screeningHistoryRepository = screeningHistoryRepository;
    }

    @Transactional
    public ScreeningResultResponse submitScreening(ScreeningSubmitRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Build a HashMap<questionId, Question> for O(1) lookups while scoring.
        List<Question> allQuestions = questionRepository.findAll();
        Map<Long, Question> questionById = new HashMap<>();
        for (Question q : allQuestions) {
            questionById.put(q.getId(), q);
        }

        Screening screening = Screening.builder()
                .personId(request.getPersonId())
                .conductedBy(currentUser.getId())
                .status(Screening.Status.COMPLETED)
                .startedAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .durationSeconds(request.getDurationSeconds())
                .isOfflineCapture(Boolean.TRUE.equals(request.getIsOfflineCapture()))
                .build();
        screening = screeningRepository.save(screening);

        // Accumulate per-section raw scores.
        Map<Long, BigDecimal> sectionTotals = new HashMap<>();

        for (AnswerSubmission submission : request.getAnswers()) {
            Question question = questionById.get(submission.getQuestionId());
            if (question == null) {
                throw new BadRequestException("Unknown question id: " + submission.getQuestionId());
            }

            BigDecimal itemScore = resolveItemScore(question, submission.getResponseValue());

            Answer answer = Answer.builder()
                    .screeningId(screening.getId())
                    .questionId(question.getId())
                    .responseValue(submission.getResponseValue())
                    .itemScore(itemScore)
                    .build();
            answerRepository.save(answer);

            Long sectionId = question.getSection().getId();
            sectionTotals.merge(sectionId, itemScore, BigDecimal::add);
        }

        List<SectionResultDto> sectionDtos = new ArrayList<>();
        boolean anyFlagged = false;
        BigDecimal ad8Score = null, rudasScore = null, pfaqScore = null;

        for (Map.Entry<Long, BigDecimal> entry : sectionTotals.entrySet()) {
            AssessmentSection section = sectionRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + entry.getKey()));
            BigDecimal raw = entry.getValue();
            BigDecimal maxScore = section.getMaxScore();

            // Normalize raw score if it exceeds the section's maximum score,
            // preserving the proportional distribution of answers.
            if (raw.compareTo(maxScore) > 0) {
                raw = raw.multiply(maxScore).divide(raw, 4, BigDecimal.ROUND_HALF_UP);
            }

            boolean flagged = isFlagged(section, raw);
            anyFlagged = anyFlagged || flagged;

            screeningResultRepository.save(ScreeningResult.builder()
                    .screeningId(screening.getId())
                    .sectionId(section.getId())
                    .rawScore(raw)
                    .flaggedForReview(flagged)
                    .build());

            sectionDtos.add(SectionResultDto.builder()
                    .sectionCode(section.getCode())
                    .sectionName(section.getName())
                    .rawScore(raw)
                    .maxScore(section.getMaxScore())
                    .flaggedForReview(flagged)
                    .build());

            switch (section.getCode()) {
                case "AD8" -> ad8Score = raw;
                case "RUDAS" -> rudasScore = raw;
                case "PFAQ" -> pfaqScore = raw;
                default -> { /* no-op: future instrument codes */ }
            }
        }

        String overallStatus = anyFlagged ? "REVIEW_RECOMMENDED" : "LOW_CONCERN";

        screeningHistoryRepository.save(ScreeningHistory.builder()
                .personId(request.getPersonId())
                .screeningId(screening.getId())
                .overallStatus(ScreeningHistory.OverallStatus.valueOf(overallStatus))
                .ad8Score(ad8Score)
                .rudasScore(rudasScore)
                .pfaqScore(pfaqScore)
                .build());

        return ScreeningResultResponse.builder()
                .screeningId(screening.getId())
                .personId(request.getPersonId())
                .overallStatus(overallStatus)
                .completedAt(screening.getCompletedAt())
                .recommendationText("Further professional assessment may be appropriate. "
                        + "This is a screening result, not a diagnosis, and should be interpreted "
                        + "by an appropriately qualified healthcare professional.")
                .sections(sectionDtos)
                .build();
    }

    /** Looks up the configured score for a given option/response using the question's options_json map. */
    /**
     * Builds the full score-card payload for a completed screening using the
     * real stored answers, per-item scores and section results from the DB.
     */
    @Transactional(readOnly = true)
    public ScoreCardResponse getScoreCard(Long screeningId) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new ResourceNotFoundException("Screening not found: " + screeningId));

        Map<Long, ScreeningResult> resultBySection = new HashMap<>();
        for (ScreeningResult r : screeningResultRepository.findByScreeningId(screeningId)) {
            resultBySection.put(r.getSectionId(), r);
        }

        Map<Long, List<Answer>> answersByQuestion = new HashMap<>();
        for (Answer a : answerRepository.findByScreeningId(screeningId)) {
            answersByQuestion.computeIfAbsent(a.getQuestionId(), k -> new ArrayList<>()).add(a);
        }

        // Preserve question order within each section.
        Map<Long, List<Question>> questionsBySection = new LinkedHashMap<>();
        Map<Long, AssessmentSection> sectionById = new LinkedHashMap<>();
        for (Answer a : answerRepository.findByScreeningId(screeningId)) {
            Question q = questionRepository.findById(a.getQuestionId()).orElse(null);
            if (q == null) continue;
            questionsBySection.computeIfAbsent(q.getSection().getId(), k -> new ArrayList<>()).add(q);
            sectionById.putIfAbsent(q.getSection().getId(), q.getSection());
        }

        List<ScoreCardSectionDto> sections = new ArrayList<>();
        for (Map.Entry<Long, List<Question>> entry : questionsBySection.entrySet()) {
            AssessmentSection section = sectionById.get(entry.getKey());
            List<ScoreCardItemDto> items = new ArrayList<>();
            for (Question q : entry.getValue()) {
                for (Answer a : answersByQuestion.getOrDefault(q.getId(), List.of())) {
                    items.add(ScoreCardItemDto.builder()
                            .questionId(q.getId())
                            .prompt(q.getPromptText())
                            .response(a.getResponseValue())
                            .score(a.getItemScore())
                            .build());
                }
            }
            ScreeningResult result = resultBySection.get(section.getId());
            sections.add(ScoreCardSectionDto.builder()
                    .sectionCode(section.getCode())
                    .sectionName(section.getName())
                    .rawScore(result != null ? result.getRawScore() : BigDecimal.ZERO)
                    .maxScore(section.getMaxScore())
                    .flaggedForReview(result != null && Boolean.TRUE.equals(result.getFlaggedForReview()))
                    .items(items)
                    .build());
        }

        return ScoreCardResponse.builder()
                .screeningId(screeningId)
                .personId(screening.getPersonId())
                .completedAt(screening.getCompletedAt())
                .sections(sections)
                .build();
    }

    @SuppressWarnings("unchecked")
    private BigDecimal resolveItemScore(Question question, String responseValue) {
        if (question.getResponseType() == Question.ResponseType.TASK_SCORE
                || question.getResponseType() == Question.ResponseType.NUMERIC) {
            try {
                BigDecimal value = new BigDecimal(responseValue);
                if (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(question.getMaxItemScore()) > 0) {
                    throw new BadRequestException("Score for question " + question.getId() + " out of range");
                }
                return value;
            } catch (NumberFormatException e) {
                throw new BadRequestException("Expected a numeric score for question " + question.getId());
            }
        }

        if (question.getOptionsJson() == null) {
            throw new BadRequestException("Question " + question.getId() + " has no configured options");
        }
        try {
            Map<String, Object> options = objectMapper.readValue(question.getOptionsJson(), Map.class);
            Object score = options.get(responseValue);
            if (score == null) {
                throw new BadRequestException("Invalid response '" + responseValue + "' for question " + question.getId());
            }
            return new BigDecimal(score.toString());
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not parse options for question " + question.getId());
        }
    }

    private boolean isFlagged(AssessmentSection section, BigDecimal raw) {
        if (section.getScoringDirection() == AssessmentSection.ScoringDirection.HIGHER_IS_CONCERNING) {
            return raw.compareTo(section.getReviewCutoff()) >= 0;
        } else {
            return raw.compareTo(section.getReviewCutoff()) <= 0;
        }
    }
}
