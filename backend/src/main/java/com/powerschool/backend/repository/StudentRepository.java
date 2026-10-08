package com.powerschool.backend.repository;

import com.powerschool.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    long countBy();

    boolean existsByAdmissionNumber(String admissionNumber);

    boolean existsByEmail(String email);

    Optional<Student> findByAdmissionNumber(String admissionNumber);
}