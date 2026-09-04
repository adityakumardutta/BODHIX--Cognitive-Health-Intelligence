package com.dementiascreen.repository;

import com.dementiascreen.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByScreeningId(Long screeningId);
}
