package com.dementiascreen.repository;

import com.dementiascreen.entity.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByPersonId(Long personId);
    List<FollowUp> findByStatus(FollowUp.Status status);
    long countByStatus(FollowUp.Status status);
}
