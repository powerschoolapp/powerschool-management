
package com.powerschool.backend.service;

import com.powerschool.backend.dto.CreateTeacherRequest;
import com.powerschool.backend.dto.TeacherResponse;
import com.powerschool.backend.dto.UpdateTeacherRequest;
import com.powerschool.backend.entity.Teacher;
import com.powerschool.backend.entity.UserAccount;
import com.powerschool.backend.entity.UserRole;
import com.powerschool.backend.repository.TeacherRepository;
import com.powerschool.backend.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AdminTeacherService {

    private final TeacherRepository teacherRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminTeacherService(
            TeacherRepository teacherRepository,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.teacherRepository = teacherRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TeacherResponse getTeacher(Long id) {
        return toResponse(findTeacher(id));
    }

    @Transactional
    public TeacherResponse createTeacher(CreateTeacherRequest request) {

        String employeeId = request.employeeId().trim();
        String fullName = request.fullName().trim();
        String email = normalizeEmail(request.email());
        String username = request.username().trim();

        if (teacherRepository.existsByEmployeeId(employeeId)) {
            throw new IllegalArgumentException(
                    "A teacher with this employee ID already exists."
            );
        }

        if (teacherRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "A teacher with this email already exists."
            );
        }

        if (userAccountRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(
                    "This username is already in use."
            );
        }

        if (userAccountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "This email is already associated with an account."
            );
        }

        UserAccount account = new UserAccount();
        account.setUsername(username);
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.setFullName(fullName);
        account.setEmail(email);
        account.setRole(UserRole.TEACHER);
        account.setEnabled(true);

        UserAccount savedAccount = userAccountRepository.save(account);

        Teacher teacher = new Teacher(
                employeeId,
                fullName,
                email,
                savedAccount
        );

        Teacher savedTeacher = teacherRepository.save(teacher);

        return toResponse(savedTeacher);
    }

    @Transactional
    public TeacherResponse updateTeacher(
            Long id,
            UpdateTeacherRequest request
    ) {
        Teacher teacher = findTeacher(id);

        String employeeId = request.employeeId().trim();
        String fullName = request.fullName().trim();
        String email = normalizeEmail(request.email());

        teacherRepository.findByEmployeeId(employeeId)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "A teacher with this employee ID already exists."
                    );
                });

        if (!teacher.getEmail().equalsIgnoreCase(email)
                && teacherRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "A teacher with this email already exists."
            );
        }

        UserAccount account = teacher.getUserAccount();

        if (!teacher.getEmail().equalsIgnoreCase(email)
                && userAccountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "This email is already associated with another account."
            );
        }

        teacher.setEmployeeId(employeeId);
        teacher.setFullName(fullName);
        teacher.setEmail(email);

        if (account != null) {
            account.setFullName(fullName);
            account.setEmail(email);
            userAccountRepository.save(account);
        }

        return toResponse(teacherRepository.save(teacher));
    }

    @Transactional
    public TeacherResponse setTeacherStatus(Long id, boolean active) {
        Teacher teacher = findTeacher(id);
        UserAccount account = teacher.getUserAccount();

        if (account == null) {
            throw new IllegalArgumentException(
                    "This teacher has no linked login account."
            );
        }

        account.setEnabled(active);
        userAccountRepository.save(account);

        return toResponse(teacher);
    }

    private Teacher findTeacher(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Teacher not found.")
                );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private TeacherResponse toResponse(Teacher teacher) {
        UserAccount account = teacher.getUserAccount();

        return new TeacherResponse(
                teacher.getId(),
                teacher.getEmployeeId(),
                teacher.getFullName(),
                teacher.getEmail(),
                account != null ? account.getUsername() : null,
                account != null && account.isEnabled()
        );
    }
}

