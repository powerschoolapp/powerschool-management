package com.powerschool.backend.repository;

import com.powerschool.backend.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, Long> {
}
