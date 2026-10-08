package com.powerschool.backend.repository;

import com.powerschool.backend.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolClassRepository
        extends JpaRepository<SchoolClass, Long> {

    long countBy();

    boolean existsByName(String name);
}
