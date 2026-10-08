package com.powerschool.backend.dto;

public record SectionResponse(
        Long id,
        String name,
        Long classId,
        String className,
        String gradeLevel
) {
}
