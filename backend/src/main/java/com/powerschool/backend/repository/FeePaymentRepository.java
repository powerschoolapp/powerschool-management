package com.powerschool.backend.repository;

import com.powerschool.backend.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
}

