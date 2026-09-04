package com.dementiascreen.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "screening_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScreeningResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "screening_id", nullable = false)
    private Long screeningId;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @Column(name = "raw_score", nullable = false)
    private BigDecimal rawScore;

    @Column(name = "flagged_for_review", nullable = false)
    private Boolean flaggedForReview;
}
