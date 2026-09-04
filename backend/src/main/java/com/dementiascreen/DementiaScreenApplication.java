package com.dementiascreen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DementiaScreen — Early Cognitive Screening & Monitoring System.
 *
 * IMPORTANT: This system is a research-inspired SCREENING / DECISION-SUPPORT
 * tool. It must never present a definitive medical diagnosis. All screening
 * outputs are limited to "LOW_CONCERN" / "REVIEW_RECOMMENDED" plus a
 * recommendation that a qualified healthcare professional interpret results.
 */
@SpringBootApplication
public class DementiaScreenApplication {
    public static void main(String[] args) {
        SpringApplication.run(DementiaScreenApplication.class, args);
    }
}
