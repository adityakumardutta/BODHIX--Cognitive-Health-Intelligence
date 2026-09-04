package com.dementiascreen.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Defines an instrument (AD8 / RUDAS / PFAQ) including its scoring rules.
 * Scoring is kept configurable/data-driven on purpose: validated wording and
 * cutoffs from an authorized source can be inserted here without code changes.
 */
@Entity
@Table(name = "assessment_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // AD8, RUDAS, PFAQ

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_score", nullable = false)
    private BigDecimal maxScore;

    @Column(name = "review_cutoff", nullable = false)
    private BigDecimal reviewCutoff;

    @Enumerated(EnumType.STRING)
    @Column(name = "scoring_direction", nullable = false, length = 30)
    private ScoringDirection scoringDirection;

    @Column(length = 30)
    private String version;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public enum ScoringDirection {
        HIGHER_IS_CONCERNING, LOWER_IS_CONCERNING
    }
}
