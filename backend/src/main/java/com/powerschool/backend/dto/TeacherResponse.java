
package com.powerschool.backend.dto;

public record TeacherResponse(
        Long id,
        String employeeId,
        String fullName,
        String email,
        String username,
        boolean active
) {
}

