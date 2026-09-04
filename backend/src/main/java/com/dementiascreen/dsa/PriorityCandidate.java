package com.dementiascreen.dsa;

import java.util.List;

/**
 * Plain data carrier fed into PriorityRanker. Kept independent of JPA
 * entities so the ranking algorithm can be unit-tested in isolation.
 */
public class PriorityCandidate {
    public final Long personId;
    public final String personName;
    public final boolean lastScreeningFlaggedForReview;
    public final long daysSinceLastScreening;
    public final boolean hasOverdueFollowUp;
    public final boolean hasPendingFollowUp;
    public final boolean trendWorsening; // most recent screening more concerning than the one before it

    public PriorityCandidate(Long personId, String personName, boolean lastScreeningFlaggedForReview,
                              long daysSinceLastScreening, boolean hasOverdueFollowUp,
                              boolean hasPendingFollowUp, boolean trendWorsening) {
        this.personId = personId;
        this.personName = personName;
        this.lastScreeningFlaggedForReview = lastScreeningFlaggedForReview;
        this.daysSinceLastScreening = daysSinceLastScreening;
        this.hasOverdueFollowUp = hasOverdueFollowUp;
        this.hasPendingFollowUp = hasPendingFollowUp;
        this.trendWorsening = trendWorsening;
    }
}
