package com.dementiascreen.service;

import com.dementiascreen.dsa.PriorityCandidate;
import com.dementiascreen.dsa.PriorityRanker;
import com.dementiascreen.dsa.RankedPerson;
import com.dementiascreen.dto.PriorityItemDto;
import com.dementiascreen.entity.FollowUp;
import com.dementiascreen.entity.Person;
import com.dementiascreen.entity.ScreeningHistory;
import com.dementiascreen.repository.FollowUpRepository;
import com.dementiascreen.repository.PersonRepository;
import com.dementiascreen.repository.ScreeningHistoryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Wraps the transparent, rule-based PriorityRanker (see dsa package) with
 * real data pulled from the database. This ranking is an operational
 * workload-prioritization tool only — it does not predict or diagnose
 * dementia.
 */
@Service
public class FollowUpPriorityService {

    private final PersonRepository personRepository;
    private final ScreeningHistoryRepository screeningHistoryRepository;
    private final FollowUpRepository followUpRepository;
    private final PriorityRanker priorityRanker = new PriorityRanker();

    public FollowUpPriorityService(PersonRepository personRepository,
                                    ScreeningHistoryRepository screeningHistoryRepository,
                                    FollowUpRepository followUpRepository,
                                    com.dementiascreen.security.AccessGuard accessGuard) {
        this.personRepository = personRepository;
        this.screeningHistoryRepository = screeningHistoryRepository;
        this.followUpRepository = followUpRepository;
        this.accessGuard = accessGuard;
    }

    private final com.dementiascreen.security.AccessGuard accessGuard;

    public List<PriorityItemDto> getPriorityList() {
        // Scoped to the authenticated specialist's own patients (IDOR protection).
        com.dementiascreen.entity.User currentUser = accessGuard.currentUser();
        boolean admin = accessGuard.isAdmin(currentUser);
        List<Person> people = personRepository.findAll().stream()
                .filter(p -> admin || currentUser.getId().equals(p.getRegisteredBy()))
                .collect(Collectors.toList());
        List<PriorityCandidate> candidates = new ArrayList<>();

        for (Person person : people) {
            // ArrayList, chronologically ordered — cheap to append to and to
            // walk sequentially, matching how a progress timeline is built.
            List<ScreeningHistory> history = screeningHistoryRepository.findByPersonIdOrderByRecordedAtAsc(person.getId());
            List<FollowUp> followUps = followUpRepository.findByPersonId(person.getId());

            if (history.isEmpty()) {
                continue; // no screening yet -> nothing to prioritize
            }

            ScreeningHistory latest = history.get(history.size() - 1);
            long daysSince = ChronoUnit.DAYS.between(latest.getRecordedAt(), LocalDateTime.now());

            boolean hasOverdue = followUps.stream().anyMatch(f -> f.getStatus() == FollowUp.Status.OVERDUE);
            boolean hasPending = followUps.stream().anyMatch(f -> f.getStatus() == FollowUp.Status.PENDING);

            boolean trendWorsening = false;
            if (history.size() >= 2) {
                BigDecimal latestAd8 = history.get(history.size() - 1).getAd8Score();
                BigDecimal prevAd8 = history.get(history.size() - 2).getAd8Score();
                if (latestAd8 != null && prevAd8 != null) {
                    trendWorsening = latestAd8.compareTo(prevAd8) > 0;
                }
            }

            candidates.add(new PriorityCandidate(
                    person.getId(),
                    person.getFullName(),
                    latest.getOverallStatus() == ScreeningHistory.OverallStatus.REVIEW_RECOMMENDED,
                    daysSince,
                    hasOverdue,
                    hasPending,
                    trendWorsening
            ));
        }

        List<RankedPerson> ranked = priorityRanker.rank(candidates);

        return ranked.stream().map(r -> {
            List<ScreeningHistory> h = screeningHistoryRepository.findByPersonIdOrderByRecordedAtAsc(r.personId);
            ScreeningHistory latest = h.get(h.size() - 1);
            return PriorityItemDto.builder()
                    .personId(r.personId)
                    .personName(r.personName)
                    .priorityLevel(r.level)
                    .priorityScore(r.score)
                    .reasons(r.reasons)
                    .lastScreeningStatus(latest.getOverallStatus().name())
                    .lastScreeningDate(latest.getRecordedAt().toLocalDate().toString())
                    .build();
        }).collect(Collectors.toList());
    }
}
