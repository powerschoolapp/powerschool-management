package com.powerschool.backend.dto;

public record AdminDashboardSummaryResponse(
        long totalStudents,
        long totalTeachers,
        long totalClasses,
        long todayAttendance
) {
}
