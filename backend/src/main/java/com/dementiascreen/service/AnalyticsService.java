package com.dementiascreen.service;

import com.dementiascreen.entity.Person;
import com.dementiascreen.entity.Screening;
import com.dementiascreen.entity.ScreeningHistory;
import com.dementiascreen.entity.User;
import com.dementiascreen.repository.FollowUpRepository;
import com.dementiascreen.repository.PersonRepository;
import com.dementiascreen.repository.ScreeningHistoryRepository;
import com.dementiascreen.repository.ScreeningRepository;
import com.dementiascreen.security.AccessGuard;
import org.springframework.stereotype.Service;

import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Privacy-conscious aggregate analytics — deliberately returns counts and
 * averages only, never per-person medical detail.
 *
 * ALL data is scoped to the authenticated user's authorized records:
 * - Specialists see only their own patients' screenings
 * - Admins see all data (same as Dashboard scoping)
 */
@Service
public class AnalyticsService {

    private final ScreeningRepository screeningRepository;
    private final ScreeningHistoryRepository screeningHistoryRepository;
    private final FollowUpRepository followUpRepository;
    private final PersonRepository personRepository;
    private final AccessGuard accessGuard;

    public AnalyticsService(ScreeningRepository screeningRepository,
                             ScreeningHistoryRepository screeningHistoryRepository,
                             FollowUpRepository followUpRepository,
                             PersonRepository personRepository,
                             AccessGuard accessGuard) {
        this.screeningRepository = screeningRepository;
        this.screeningHistoryRepository = screeningHistoryRepository;
        this.followUpRepository = followUpRepository;
        this.personRepository = personRepository;
        this.accessGuard = accessGuard;
    }

    public Map<String, Object> getAnalytics() {
        // Get authenticated user and determine scope (same pattern as DashboardService)
        User currentUser = accessGuard.currentUser();
        boolean admin = accessGuard.isAdmin(currentUser);

        // Get the authenticated user's patients (or all patients for admin)
        List<Person> myPeople = personRepository.findAll().stream()
                .filter(p -> admin || currentUser.getId().equals(p.getRegisteredBy()))
                .collect(Collectors.toList());

        // Get person IDs owned by the authenticated user for filtering
        List<Long> myPersonIds = myPeople.stream().map(Person::getId).collect(Collectors.toList());

        // Filter screenings to only include those for the user's patients
        List<Screening> screenings = screeningRepository.findAll().stream()
                .filter(s -> myPersonIds.contains(s.getPersonId()))
                .collect(Collectors.toList());

        // Filter screening history to only include the user's patients
        List<ScreeningHistory> history = screeningHistoryRepository.findAll().stream()
                .filter(h -> myPersonIds.contains(h.getPersonId()))
                .collect(Collectors.toList());

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

        // Filter follow-ups to only include those created by the authenticated user
        long pendingFollowUps = followUpRepository.findAll().stream()
                .filter(f -> admin || currentUser.getId().equals(f.getCreatedBy()))
                .filter(f -> f.getStatus() == com.dementiascreen.entity.FollowUp.Status.PENDING)
                .count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalScreenings", total);
        result.put("completedScreenings", completed);
        result.put("pendingFollowUps", pendingFollowUps);
        result.put("screeningsByMonth", byMonth);
        result.put("resultDistribution", resultDistribution);
        result.put("averageCompletionSeconds", Math.round(avgDurationSeconds));
        return result;
    }
}
