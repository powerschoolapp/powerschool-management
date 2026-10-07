package com.powerschool.backend.service;

import com.powerschool.backend.dto.AdminDashboardSummaryResponse;
import com.powerschool.backend.entity.UserRole;
import com.powerschool.backend.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    private final UserAccountRepository userAccountRepository;

    public AdminDashboardService(
            UserAccountRepository userAccountRepository) {

        this.userAccountRepository = userAccountRepository;
    }

    public AdminDashboardSummaryResponse getDashboardSummary() {

        long totalStudents =
                userAccountRepository.countByRole(UserRole.STUDENT);

        long totalTeachers =
                userAccountRepository.countByRole(UserRole.TEACHER);

        /*
         * These will become real database values after
         * the Class/Section and Attendance entities
         * are implemented.
         */
        long totalClasses = 0;

        long todayAttendance = 0;

        return new AdminDashboardSummaryResponse(
                totalStudents,
                totalTeachers,
                totalClasses,
                todayAttendance
        );
    }
}
