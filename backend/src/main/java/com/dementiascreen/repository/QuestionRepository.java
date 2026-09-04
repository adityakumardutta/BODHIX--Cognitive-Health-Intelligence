package com.dementiascreen.repository;

import com.dementiascreen.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findBySection_IdOrderByOrderIndexAsc(Long sectionId);
    List<Question> findBySection_CodeOrderByOrderIndexAsc(String sectionCode);
}
