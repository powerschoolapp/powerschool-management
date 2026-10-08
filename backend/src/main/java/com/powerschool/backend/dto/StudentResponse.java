package com.powerschool.backend.dto;

public record StudentResponse(
        Long id,
        String admissionNumber,
        String fullName,
        String email,
        Long sectionId,
        String sectionName,
        Long classId,
        String className,
        String username,
        boolean active
) {
}
