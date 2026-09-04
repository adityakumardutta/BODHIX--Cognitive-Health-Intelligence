package com.dementiascreen.repository;

import com.dementiascreen.entity.AssessmentSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssessmentSectionRepository extends JpaRepository<AssessmentSection, Long> {
    Optional<AssessmentSection> findByCode(String code);
}
