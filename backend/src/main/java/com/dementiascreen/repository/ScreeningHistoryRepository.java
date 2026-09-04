package com.dementiascreen.repository;

import com.dementiascreen.entity.ScreeningHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreeningHistoryRepository extends JpaRepository<ScreeningHistory, Long> {
    List<ScreeningHistory> findByPersonIdOrderByRecordedAtAsc(Long personId);
}
