package com.powerschool.backend.service;

import com.powerschool.backend.dto.CreateStudentRequest;
import com.powerschool.backend.dto.StudentResponse;
import com.powerschool.backend.dto.UpdateStudentRequest;
import com.powerschool.backend.entity.Section;
import com.powerschool.backend.entity.Student;
import com.powerschool.backend.entity.UserAccount;
import com.powerschool.backend.entity.UserRole;
import com.powerschool.backend.repository.SectionRepository;
import com.powerschool.backend.repository.StudentRepository;
import com.powerschool.backend.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminStudentService {

    private final StudentRepository studentRepository;
    private final SectionRepository sectionRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminStudentService(
            StudentRepository studentRepository,
            SectionRepository sectionRepository,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.studentRepository = studentRepository;
        this.sectionRepository = sectionRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudent(Long id) {
        Student student = findStudent(id);
        return toResponse(student);
    }

    @Transactional
    public StudentResponse createStudent(CreateStudentRequest request) {

        String admissionNumber = request.admissionNumber().trim();
        String email = request.email().trim().toLowerCase();
        String username = request.username().trim();

        if (studentRepository.existsByAdmissionNumber(admissionNumber)) {
            throw new IllegalArgumentException(
                    "A student with this admission number already exists."
            );
        }

        if (studentRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "A student with this email already exists."
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

        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Selected section does not exist.")
                );

        UserAccount userAccount = new UserAccount();

        userAccount.setUsername(username);
        userAccount.setPasswordHash(
                passwordEncoder.encode(request.password())
        );
        userAccount.setFullName(request.fullName().trim());
        userAccount.setEmail(email);
        userAccount.setRole(UserRole.STUDENT);
        userAccount.setEnabled(true);

        UserAccount savedUserAccount = userAccountRepository.save(userAccount);

        Student student = new Student(
                admissionNumber,
                request.fullName().trim(),
                email,
                section,
                savedUserAccount
        );

        Student savedStudent = studentRepository.save(student);

        return toResponse(savedStudent);
    }

    @Transactional
    public StudentResponse updateStudent(
            Long id,
            UpdateStudentRequest request
    ) {

        Student student = findStudent(id);

        String admissionNumber = request.admissionNumber().trim();
        String email = request.email().trim().toLowerCase();

        studentRepository.findByAdmissionNumber(admissionNumber)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "A student with this admission number already exists."
                    );
                });

        if (!student.getEmail().equalsIgnoreCase(email)
                && studentRepository.existsByEmail(email)) {

            throw new IllegalArgumentException(
                    "A student with this email already exists."
            );
        }

        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Selected section does not exist.")
                );

        student.setAdmissionNumber(admissionNumber);
        student.setFullName(request.fullName().trim());
        student.setEmail(email);
        student.setSection(section);

        UserAccount userAccount = student.getUserAccount();

        if (userAccount != null) {
            userAccount.setFullName(request.fullName().trim());
            userAccount.setEmail(email);
            userAccountRepository.save(userAccount);
        }

        Student updatedStudent = studentRepository.save(student);

        return toResponse(updatedStudent);
    }

    @Transactional
    public StudentResponse setStudentStatus(Long id, boolean active) {

        Student student = findStudent(id);

        UserAccount userAccount = student.getUserAccount();

        if (userAccount == null) {
            throw new IllegalArgumentException(
                    "Student account is not properly linked."
            );
        }

        userAccount.setEnabled(active);
        userAccountRepository.save(userAccount);

        return toResponse(student);
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found.")
                );
    }

    private StudentResponse toResponse(Student student) {

        Section section = student.getSection();

        Long classId = section.getSchoolClass().getId();
        String className = section.getSchoolClass().getName();

        UserAccount userAccount = student.getUserAccount();

        String username = userAccount != null
                ? userAccount.getUsername()
                : null;

        boolean active = userAccount != null && userAccount.isEnabled();

        return new StudentResponse(
                student.getId(),
                student.getAdmissionNumber(),
                student.getFullName(),
                student.getEmail(),
                section.getId(),
                section.getName(),
                classId,
                className,
                username,
                active
        );
    }
}
