package com.dementiascreen.controller;

import com.dementiascreen.dto.PersonRequest;
import com.dementiascreen.dto.PersonResponse;
import com.dementiascreen.service.HistoryAnalysisService;
import com.dementiascreen.service.PersonService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/persons")
public class PersonController {

    private final PersonService personService;
    private final HistoryAnalysisService historyAnalysisService;

    public PersonController(PersonService personService, HistoryAnalysisService historyAnalysisService) {
        this.personService = personService;
        this.historyAnalysisService = historyAnalysisService;
    }

    @PostMapping
    public PersonResponse register(@Valid @RequestBody PersonRequest request) {
        return personService.register(request);
    }

    @GetMapping
    public List<PersonResponse> list(@RequestParam(required = false) String q) {
        return (q == null || q.isBlank()) ? personService.listAll() : personService.search(q);
    }

    @GetMapping("/{id}")
    public PersonResponse getById(@PathVariable Long id) {
        return personService.getById(id);
    }

    @GetMapping("/{id}/history")
    public List<Map<String, Object>> history(@PathVariable Long id) {
        return historyAnalysisService.getTimeline(id);
    }
}
