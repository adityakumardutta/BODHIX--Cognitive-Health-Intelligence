package com.dementiascreen.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "screening_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScreeningHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "person_id", nullable = false)
    private Long personId;

    @Column(name = "screening_id", nullable = false)
    private Long screeningId;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", nullable = false, length = 30)
    private OverallStatus overallStatus;

    @Column(name = "ad8_score")
    private BigDecimal ad8Score;

    @Column(name = "rudas_score")
    private BigDecimal rudasScore;

    @Column(name = "pfaq_score")
    private BigDecimal pfaqScore;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;

    @PrePersist
    void prePersist() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }

    public enum OverallStatus {
        LOW_CONCERN, REVIEW_RECOMMENDED
    }
}
