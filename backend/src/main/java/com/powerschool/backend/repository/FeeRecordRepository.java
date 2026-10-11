package com.powerschool.backend.repository;

import com.powerschool.backend.entity.FeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRecordRepository extends JpaRepository<FeeRecord, Long> {
}
