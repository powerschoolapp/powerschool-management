
package com.powerschool.backend.controller;

import com.powerschool.backend.dto.CreateTeacherRequest;
import com.powerschool.backend.dto.TeacherResponse;
import com.powerschool.backend.dto.UpdateTeacherRequest;
import com.powerschool.backend.service.AdminTeacherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/teachers")
public class AdminTeacherController {

    private final AdminTeacherService adminTeacherService;

    public AdminTeacherController(
            AdminTeacherService adminTeacherService
    ) {
        this.adminTeacherService = adminTeacherService;
    }

    @GetMapping
    public ResponseEntity<List<TeacherResponse>> getAllTeachers() {
        return ResponseEntity.ok(
                adminTeacherService.getAllTeachers()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherResponse> getTeacher(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminTeacherService.getTeacher(id)
        );
    }

    @PostMapping
    public ResponseEntity<TeacherResponse> createTeacher(
            @Valid @RequestBody CreateTeacherRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminTeacherService.createTeacher(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherResponse> updateTeacher(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTeacherRequest request
    ) {
        return ResponseEntity.ok(
                adminTeacherService.updateTeacher(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TeacherResponse> setTeacherStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(
                adminTeacherService.setTeacherStatus(id, active)
        );
    }
}
