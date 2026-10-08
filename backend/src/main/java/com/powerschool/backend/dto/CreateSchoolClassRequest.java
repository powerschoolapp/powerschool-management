package com.powerschool.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSchoolClassRequest(

        @NotBlank(message = "Class name is required")
        @Size(max = 100, message = "Class name must not exceed 100 characters")
        String name,

        @NotBlank(message = "Grade level is required")
        @Size(max = 50, message = "Grade level must not exceed 50 characters")
        String gradeLevel
) {
}
