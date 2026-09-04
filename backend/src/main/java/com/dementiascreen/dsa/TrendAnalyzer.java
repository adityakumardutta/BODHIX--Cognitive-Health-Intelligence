package com.dementiascreen.dsa;

import java.math.BigDecimal;
import java.util.List;

/**
 * Compares a person's screening-history records (kept as an ArrayList,
 * ordered chronologically — cheap to append and to walk sequentially, which
 * is exactly how a progress timeline is built and read) to decide whether
 * the two most recent AD8 results indicate a worsening trend.
 *
 * This is a simple directional comparison, NOT a medical prediction.
 */
public class TrendAnalyzer {

    public boolean isWorsening(List<BigDecimal> chronologicalAd8Scores) {
        if (chronologicalAd8Scores == null || chronologicalAd8Scores.size() < 2) {
            return false;
        }
        int last = chronologicalAd8Scores.size() - 1;
        BigDecimal latest = chronologicalAd8Scores.get(last);
        BigDecimal previous = chronologicalAd8Scores.get(last - 1);
        // AD8: higher score is more concerning.
        return latest.compareTo(previous) > 0;
    }
}
