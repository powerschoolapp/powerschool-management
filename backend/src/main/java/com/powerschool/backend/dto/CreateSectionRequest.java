package com.powerschool.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSectionRequest(

        @NotBlank(message = "Section name is required")
        @Size(max = 50, message = "Section name must not exceed 50 characters")
        String name,

        @NotNull(message = "Class is required")
        Long classId
) {
}
