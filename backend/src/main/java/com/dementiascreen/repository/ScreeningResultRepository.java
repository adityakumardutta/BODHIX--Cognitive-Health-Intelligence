package com.dementiascreen.repository;

import com.dementiascreen.entity.ScreeningResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreeningResultRepository extends JpaRepository<ScreeningResult, Long> {
    List<ScreeningResult> findByScreeningId(Long screeningId);
}
