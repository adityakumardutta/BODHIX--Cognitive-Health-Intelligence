package com.dementiascreen.controller;

import com.dementiascreen.dto.FollowUpRequest;
import com.dementiascreen.dto.FollowUpResponse;
import com.dementiascreen.dto.PriorityItemDto;
import com.dementiascreen.service.FollowUpPriorityService;
import com.dementiascreen.service.FollowUpService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/followups")
public class FollowUpController {

    private final FollowUpService followUpService;
    private final FollowUpPriorityService priorityService;

    public FollowUpController(FollowUpService followUpService, FollowUpPriorityService priorityService) {
        this.followUpService = followUpService;
        this.priorityService = priorityService;
    }

    @PostMapping
    public FollowUpResponse create(@Valid @RequestBody FollowUpRequest request) {
        return followUpService.create(request);
    }

    @GetMapping
    public List<FollowUpResponse> list() {
        return followUpService.listAll();
    }

    @PatchMapping("/{id}/status")
    public FollowUpResponse updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return followUpService.updateStatus(id, body.get("status"));
    }

    @GetMapping("/priority")
    public List<PriorityItemDto> priorityList() {
        return priorityService.getPriorityList();
    }
}
