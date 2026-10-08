package com.powerschool.backend.service;

import com.powerschool.backend.dto.CreateSchoolClassRequest;
import com.powerschool.backend.dto.SchoolClassResponse;
import com.powerschool.backend.entity.SchoolClass;
import com.powerschool.backend.repository.SchoolClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminSchoolClassService {

    private final SchoolClassRepository schoolClassRepository;

    public AdminSchoolClassService(
            SchoolClassRepository schoolClassRepository
    ) {
        this.schoolClassRepository = schoolClassRepository;
    }

    @Transactional(readOnly = true)
    public List<SchoolClassResponse> getAllClasses() {
        return schoolClassRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SchoolClassResponse createClass(
            CreateSchoolClassRequest request
    ) {

        String name = request.name().trim();
        String gradeLevel = request.gradeLevel().trim();

        if (schoolClassRepository.existsByName(name)) {
            throw new IllegalArgumentException(
                    "A class with this name already exists."
            );
        }

        SchoolClass schoolClass = new SchoolClass(
                name,
                gradeLevel
        );

        SchoolClass savedClass =
                schoolClassRepository.save(schoolClass);

        return toResponse(savedClass);
    }

    private SchoolClassResponse toResponse(
            SchoolClass schoolClass
    ) {
        return new SchoolClassResponse(
                schoolClass.getId(),
                schoolClass.getName(),
                schoolClass.getGradeLevel()
        );
    }
}
