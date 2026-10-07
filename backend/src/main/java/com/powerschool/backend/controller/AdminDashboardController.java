package com.powerschool.backend.controller;

import com.powerschool.backend.dto.AdminDashboardSummaryResponse;
import com.powerschool.backend.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(
            AdminDashboardService adminDashboardService) {

        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AdminDashboardSummaryResponse>
    getDashboardSummary() {

        return ResponseEntity.ok(
                adminDashboardService.getDashboardSummary()
        );
    }
}