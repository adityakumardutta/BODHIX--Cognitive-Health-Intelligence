package com.dementiascreen.service;

import com.dementiascreen.dto.DashboardStatsResponse;
import com.dementiascreen.entity.FollowUp;
import com.dementiascreen.entity.Screening;
import com.dementiascreen.repository.FollowUpRepository;
import com.dementiascreen.repository.PersonRepository;
import com.dementiascreen.repository.ScreeningHistoryRepository;
import com.dementiascreen.repository.ScreeningRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final PersonRepository personRepository;
    private final ScreeningRepository screeningRepository;
    private final ScreeningHistoryRepository screeningHistoryRepository;
    private final FollowUpRepository followUpRepository;

    public DashboardService(PersonRepository personRepository, ScreeningRepository screeningRepository,
                             ScreeningHistoryRepository screeningHistoryRepository,
                             FollowUpRepository followUpRepository) {
        this.personRepository = personRepository;
        this.screeningRepository = screeningRepository;
        this.screeningHistoryRepository = screeningHistoryRepository;
        this.followUpRepository = followUpRepository;
    }

    public DashboardStatsResponse getStats() {
        long totalPeople = personRepository.count();
        long completed = screeningRepository.countByStatus(Screening.Status.COMPLETED);
        long pendingFollowUps = followUpRepository.countByStatus(FollowUp.Status.PENDING)
                + followUpRepository.countByStatus(FollowUp.Status.OVERDUE);

        long needingReview = personRepository.findAll().stream()
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
