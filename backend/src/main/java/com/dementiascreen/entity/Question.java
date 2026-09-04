package com.dementiascreen.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "section_id", nullable = false)
    private AssessmentSection section;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "prompt_text", nullable = false, columnDefinition = "TEXT")
    private String promptText;

    @Enumerated(EnumType.STRING)
    @Column(name = "response_type", nullable = false, length = 30)
    private ResponseType responseType;

    // Raw JSON string of option -> score mapping, e.g. {"Yes":1,"No":0}
    @Column(name = "options_json", columnDefinition = "JSON")
    private String optionsJson;

    // Plain-language helper sentence explaining the item without changing its meaning
    @Column(name = "helper_text")
    private String helperText;

    // Optional practical example, explanatory only (never scored)
    @Column(name = "example_text")
    private String exampleText;

    @Column(name = "max_item_score", nullable = false)
    private BigDecimal maxItemScore;

    @Column(name = "is_placeholder", nullable = false)
    @Builder.Default
    private Boolean isPlaceholder = true;

    public enum ResponseType {
        YES_NO, MULTIPLE_CHOICE, NUMERIC, TASK_SCORE
    }
}
