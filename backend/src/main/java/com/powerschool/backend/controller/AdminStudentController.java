package com.powerschool.backend.controller;

import com.powerschool.backend.dto.CreateStudentRequest;
import com.powerschool.backend.dto.StudentResponse;
import com.powerschool.backend.dto.UpdateStudentRequest;
import com.powerschool.backend.service.AdminStudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    public AdminStudentController(
            AdminStudentService adminStudentService
    ) {
        this.adminStudentService = adminStudentService;
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        return ResponseEntity.ok(
                adminStudentService.getAllStudents()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudent(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminStudentService.getStudent(id)
        );
    }

    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(
            @Valid @RequestBody CreateStudentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminStudentService.createStudent(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentRequest request
    ) {
        return ResponseEntity.ok(
                adminStudentService.updateStudent(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StudentResponse> setStudentStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(
                adminStudentService.setStudentStatus(id, active)
        );
    }
}
