package com.dementiascreen.repository;

import com.dementiascreen.entity.Screening;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreeningRepository extends JpaRepository<Screening, Long> {
    List<Screening> findByPersonIdOrderByStartedAtDesc(Long personId);
    List<Screening> findTop10ByOrderByStartedAtDesc();
    long countByStatus(Screening.Status status);
}
