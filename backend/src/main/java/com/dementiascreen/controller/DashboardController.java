package com.dementiascreen.controller;

import com.dementiascreen.dto.DashboardStatsResponse;
import com.dementiascreen.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/statistics")
    public DashboardStatsResponse statistics() {
        return dashboardService.getStats();
    }
}
