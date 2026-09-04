package com.dementiascreen.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "screening_id", nullable = false)
    private Long screeningId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "response_value", nullable = false)
    private String responseValue;

    @Column(name = "item_score", nullable = false)
    private BigDecimal itemScore;
}
