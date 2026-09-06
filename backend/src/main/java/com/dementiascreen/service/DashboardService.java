package com.dementiascreen.service;

import com.dementiascreen.dto.DashboardStatsResponse;
import com.dementiascreen.entity.FollowUp;
import com.dementiascreen.entity.Screening;
import com.dementiascreen.repository.FollowUpRepository;
import com.dementiascreen.repository.PersonRepository;
import com.dementiascreen.repository.ScreeningHistoryRepository;
import com.dementiascreen.repository.ScreeningRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final PersonRepository personRepository;
    private final ScreeningRepository screeningRepository;
    private final ScreeningHistoryRepository screeningHistoryRepository;
    private final FollowUpRepository followUpRepository;

    public DashboardService(PersonRepository personRepository, ScreeningRepository screeningRepository,
                             ScreeningHistoryRepository screeningHistoryRepository,
                             FollowUpRepository followUpRepository,
                             com.dementiascreen.security.AccessGuard accessGuard) {
        this.personRepository = personRepository;
        this.screeningRepository = screeningRepository;
        this.screeningHistoryRepository = screeningHistoryRepository;
        this.followUpRepository = followUpRepository;
        this.accessGuard = accessGuard;
    }

    private final com.dementiascreen.security.AccessGuard accessGuard;

    public DashboardStatsResponse getStats() {
        // Scoped to the authenticated specialist's own patients (admins see all).
        com.dementiascreen.entity.User currentUser = accessGuard.currentUser();
        boolean admin = accessGuard.isAdmin(currentUser);
        List<com.dementiascreen.entity.Person> myPeople = personRepository.findAll().stream()
                .filter(p -> admin || currentUser.getId().equals(p.getRegisteredBy()))
                .collect(java.util.stream.Collectors.toList());

        long totalPeople = myPeople.size();
        long completed = myPeople.stream()
                .flatMap(p -> screeningRepository.findByPersonIdOrderByStartedAtDesc(p.getId()).stream())
                .filter(s -> s.getStatus() == Screening.Status.COMPLETED)
                .count();
        long pendingFollowUps = followUpRepository.findAll().stream()
                .filter(f -> admin || currentUser.getId().equals(f.getCreatedBy()))
                .filter(f -> f.getStatus() == FollowUp.Status.PENDING || f.getStatus() == FollowUp.Status.OVERDUE)
                .count();

        long needingReview = myPeople.stream()
                .filter(p -> {
                    var history = screeningHistoryRepository.findByPersonIdOrderByRecordedAtAsc(p.getId());
                    return !history.isEmpty() && history.get(history.size() - 1).getOverallStatus().name().equals("REVIEW_RECOMMENDED");
                }).count();

        return DashboardStatsResponse.builder()
                .totalPeopleScreened(totalPeople)
                .peopleNeedingReview(needingReview)
                .pendingFollowUps(pendingFollowUps)
                .completedScreenings(completed)
                .build();
    }
}
