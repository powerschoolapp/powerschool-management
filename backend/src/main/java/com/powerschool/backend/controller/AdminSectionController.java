package com.powerschool.backend.controller;

import com.powerschool.backend.dto.CreateSectionRequest;
import com.powerschool.backend.dto.SectionResponse;
import com.powerschool.backend.service.AdminSectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sections")
public class AdminSectionController {

    private final AdminSectionService adminSectionService;

    public AdminSectionController(
            AdminSectionService adminSectionService
    ) {
        this.adminSectionService = adminSectionService;
    }

    @GetMapping
    public ResponseEntity<List<SectionResponse>> getAllSections() {
        return ResponseEntity.ok(
                adminSectionService.getAllSections()
        );
    }

    @PostMapping
    public ResponseEntity<SectionResponse> createSection(
            @Valid @RequestBody CreateSectionRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        adminSectionService.createSection(request)
                );
    }
}
