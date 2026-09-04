package com.dementiascreen.service;

import com.dementiascreen.entity.Screening;
import com.dementiascreen.entity.ScreeningHistory;
import com.dementiascreen.repository.FollowUpRepository;
import com.dementiascreen.repository.ScreeningHistoryRepository;
import com.dementiascreen.repository.ScreeningRepository;
import org.springframework.stereotype.Service;

import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Privacy-conscious aggregate analytics — deliberately returns counts and
 * averages only, never per-person medical detail.
 */
@Service
public class AnalyticsService {

    private final ScreeningRepository screeningRepository;
    private final ScreeningHistoryRepository screeningHistoryRepository;
    private final FollowUpRepository followUpRepository;

    public AnalyticsService(ScreeningRepository screeningRepository,
                             ScreeningHistoryRepository screeningHistoryRepository,
                             FollowUpRepository followUpRepository) {
        this.screeningRepository = screeningRepository;
        this.screeningHistoryRepository = screeningHistoryRepository;
        this.followUpRepository = followUpRepository;
    }

    public Map<String, Object> getAnalytics() {
        List<Screening> screenings = screeningRepository.findAll();
        List<ScreeningHistory> history = screeningHistoryRepository.findAll();

        long total = screenings.size();
        long completed = screenings.stream().filter(s -> s.getStatus() == Screening.Status.COMPLETED).count();

        double avgDurationSeconds = screenings.stream()
                .filter(s -> s.getDurationSeconds() != null)
                .mapToInt(Screening::getDurationSeconds)
                .average().orElse(0);

        Map<String, Long> byMonth = new LinkedHashMap<>();
        for (Screening s : screenings) {
            if (s.getStartedAt() == null) continue;
            String key = s.getStartedAt().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " " + s.getStartedAt().getYear();
            byMonth.merge(key, 1L, Long::sum);
        }

        Map<String, Long> resultDistribution = new LinkedHashMap<>();
        resultDistribution.put("LOW_CONCERN", history.stream()
                .filter(h -> h.getOverallStatus() == ScreeningHistory.OverallStatus.LOW_CONCERN).count());
        resultDistribution.put("REVIEW_RECOMMENDED", history.stream()
                .filter(h -> h.getOverallStatus() == ScreeningHistory.OverallStatus.REVIEW_RECOMMENDED).count());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalScreenings", total);
        result.put("completedScreenings", completed);
        result.put("pendingFollowUps", followUpRepository.countByStatus(
                com.dementiascreen.entity.FollowUp.Status.PENDING));
        result.put("screeningsByMonth", byMonth);
        result.put("resultDistribution", resultDistribution);
        result.put("averageCompletionSeconds", Math.round(avgDurationSeconds));
        return result;
    }
}
