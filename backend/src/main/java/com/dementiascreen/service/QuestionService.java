package com.dementiascreen.service;

import com.dementiascreen.entity.Question;
import com.dementiascreen.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<Question> getBySection(String sectionCode) {
        return questionRepository.findBySection_CodeOrderByOrderIndexAsc(sectionCode);
    }
}
