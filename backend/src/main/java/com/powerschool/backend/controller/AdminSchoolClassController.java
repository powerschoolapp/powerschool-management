package com.powerschool.backend.controller;

import com.powerschool.backend.dto.CreateSchoolClassRequest;
import com.powerschool.backend.dto.SchoolClassResponse;
import com.powerschool.backend.service.AdminSchoolClassService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/classes")
public class AdminSchoolClassController {

    private final AdminSchoolClassService adminSchoolClassService;

    public AdminSchoolClassController(
            AdminSchoolClassService adminSchoolClassService
    ) {
        this.adminSchoolClassService = adminSchoolClassService;
    }

    @GetMapping
    public ResponseEntity<List<SchoolClassResponse>> getAllClasses() {
        return ResponseEntity.ok(
                adminSchoolClassService.getAllClasses()
        );
    }

    @PostMapping
    public ResponseEntity<SchoolClassResponse> createClass(
            @Valid @RequestBody CreateSchoolClassRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        adminSchoolClassService.createClass(request)
                );
    }
}
