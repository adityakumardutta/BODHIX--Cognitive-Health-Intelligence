package com.dementiascreen.service;

import com.dementiascreen.entity.ScreeningHistory;
import com.dementiascreen.repository.ScreeningHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Builds the person-level progress timeline (Screen 10) from
 * screening_history rows, which are stored as a chronological ArrayList.
 */
@Service
public class HistoryAnalysisService {

    private final ScreeningHistoryRepository screeningHistoryRepository;

    public HistoryAnalysisService(ScreeningHistoryRepository screeningHistoryRepository) {
        this.screeningHistoryRepository = screeningHistoryRepository;
    }

    public List<Map<String, Object>> getTimeline(Long personId) {
        List<ScreeningHistory> history = screeningHistoryRepository.findByPersonIdOrderByRecordedAtAsc(personId);
        return history.stream().map(h -> Map.<String, Object>of(
                "screeningId", h.getScreeningId(),
                "date", h.getRecordedAt().toLocalDate().toString(),
                "overallStatus", h.getOverallStatus().name(),
                "ad8Score", h.getAd8Score(),
                "rudasScore", h.getRudasScore(),
                "pfaqScore", h.getPfaqScore()
        )).collect(Collectors.toList());
    }
}
