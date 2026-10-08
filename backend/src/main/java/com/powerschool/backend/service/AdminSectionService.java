package com.powerschool.backend.service;

import com.powerschool.backend.dto.CreateSectionRequest;
import com.powerschool.backend.dto.SectionResponse;
import com.powerschool.backend.entity.SchoolClass;
import com.powerschool.backend.entity.Section;
import com.powerschool.backend.repository.SchoolClassRepository;
import com.powerschool.backend.repository.SectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminSectionService {

    private final SectionRepository sectionRepository;
    private final SchoolClassRepository schoolClassRepository;

    public AdminSectionService(
            SectionRepository sectionRepository,
            SchoolClassRepository schoolClassRepository
    ) {
        this.sectionRepository = sectionRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    @Transactional(readOnly = true)
    public List<SectionResponse> getAllSections() {
        return sectionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SectionResponse createSection(
            CreateSectionRequest request
    ) {

        String name = request.name().trim();

        SchoolClass schoolClass =
                schoolClassRepository.findById(request.classId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Selected class does not exist."
                                )
                        );

        boolean sectionExists =
                sectionRepository.findAll()
                        .stream()
                        .anyMatch(section ->
                                section.getName().equalsIgnoreCase(name)
                                        && section.getSchoolClass()
                                        .getId()
                                        .equals(schoolClass.getId())
                        );

        if (sectionExists) {
            throw new IllegalArgumentException(
                    "This section already exists in the selected class."
            );
        }

        Section section = new Section(
                name,
                schoolClass
        );

        Section savedSection =
                sectionRepository.save(section);

        return toResponse(savedSection);
    }

    private SectionResponse toResponse(
            Section section
    ) {

        SchoolClass schoolClass =
                section.getSchoolClass();

        return new SectionResponse(
                section.getId(),
                section.getName(),
                schoolClass.getId(),
                schoolClass.getName(),
                schoolClass.getGradeLevel()
        );
    }
}
