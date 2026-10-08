package com.powerschool.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateStudentRequest(

        @NotBlank(message = "Admission number is required")
        @Size(max = 50, message = "Admission number must not exceed 50 characters")
        String admissionNumber,

        @NotBlank(message = "Full name is required")
        @Size(max = 150, message = "Full name must not exceed 150 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        @Size(max = 150, message = "Email must not exceed 150 characters")
        String email,

        @NotNull(message = "Section is required")
        Long sectionId
) {
}
