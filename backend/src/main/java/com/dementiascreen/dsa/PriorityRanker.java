package com.dementiascreen.dsa;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

/**
 * Transparent, rule-based follow-up prioritization engine.
 *
 * WHY A PriorityQueue:
 * A max-heap (PriorityQueue with a reversed comparator) lets us repeatedly
 * pull the single highest-priority person in O(log n) without re-sorting the
 * whole list after every insertion — useful because, in the real system,
 * candidates arrive incrementally (new screenings/follow-ups completing
 * throughout the day) and the dashboard only needs the top-N at any time.
 *
 * This engine does NOT predict or diagnose dementia. It only encodes
 * transparent operational rules (review flags, overdue follow-ups, time
 * since last contact, trend direction) so that health workers can see
 * exactly WHY someone was prioritized.
 */
public class PriorityRanker {

    private static final int WEIGHT_FLAGGED_FOR_REVIEW = 40;
    private static final int WEIGHT_OVERDUE_FOLLOWUP = 30;
    private static final int WEIGHT_TREND_WORSENING = 20;
    private static final int WEIGHT_PENDING_FOLLOWUP = 10;
    private static final int WEIGHT_LONG_GAP = 10; // > 180 days since last screening

    public List<RankedPerson> rank(List<PriorityCandidate> candidates) {
        // Max-heap keyed by computed score.
        PriorityQueue<RankedPerson> heap = new PriorityQueue<>(
                Comparator.comparingInt((RankedPerson r) -> r.score).reversed());

        for (PriorityCandidate c : candidates) {
            List<String> reasons = new ArrayList<>();
            int score = 0;

            if (c.lastScreeningFlaggedForReview) {
                score += WEIGHT_FLAGGED_FOR_REVIEW;
                reasons.add("Recent screening requires professional review");
            }
            if (c.hasOverdueFollowUp) {
                score += WEIGHT_OVERDUE_FOLLOWUP;
                reasons.add("Follow-up overdue");
            }
            if (c.trendWorsening) {
                score += WEIGHT_TREND_WORSENING;
                reasons.add("Screening trend shows increasing concern over time");
            }
            if (c.hasPendingFollowUp) {
                score += WEIGHT_PENDING_FOLLOWUP;
                reasons.add("Follow-up pending");
            }
            if (c.daysSinceLastScreening > 180) {
                score += WEIGHT_LONG_GAP;
                reasons.add("No screening in over 6 months");
            }

            if (reasons.isEmpty()) {
                reasons.add("No outstanding concerns identified");
            }

            String level;
            if (score >= 50) {
                level = "HIGH";
            } else if (score >= 20) {
                level = "MEDIUM";
            } else {
                level = "LOW";
            }

            heap.offer(new RankedPerson(c.personId, c.personName, score, level, reasons));
        }

        // Drain the heap into a sorted (highest priority first) list.
        List<RankedPerson> ranked = new ArrayList<>();
        while (!heap.isEmpty()) {
            ranked.add(heap.poll());
        }
        return ranked;
    }
}
