package com.powerschool.backend.service;

import com.powerschool.backend.dto.FeePaymentRequestDto;
import com.powerschool.backend.dto.FeeSummaryResponseDto;
import com.powerschool.backend.entity.FeePayment;
import com.powerschool.backend.entity.FeeRecord;
import com.powerschool.backend.repository.FeePaymentRepository;
import com.powerschool.backend.repository.FeeRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class FeeService {

    private final FeeRecordRepository feeRecordRepository;
    private final FeePaymentRepository feePaymentRepository;

    public FeeService(FeeRecordRepository feeRecordRepository, FeePaymentRepository feePaymentRepository) {
        this.feeRecordRepository = feeRecordRepository;
        this.feePaymentRepository = feePaymentRepository;
    }

    public List<FeeRecord> getAllFeeRecords() {
        return feeRecordRepository.findAll();
    }

    public FeeSummaryResponseDto getFeeSummary() {
        List<FeeRecord> records = feeRecordRepository.findAll();
        BigDecimal totalFees = BigDecimal.ZERO;
        BigDecimal collectedFees = BigDecimal.ZERO;
        BigDecimal pendingFees = BigDecimal.ZERO;
        BigDecimal overdueFees = BigDecimal.ZERO;

        LocalDate today = LocalDate.now();

        for (FeeRecord record : records) {
            BigDecimal total = record.getTotalFee() != null ? record.getTotalFee() : BigDecimal.ZERO;
            BigDecimal paid = record.getPaidAmount() != null ? record.getPaidAmount() : BigDecimal.ZERO;
            BigDecimal balance = total.subtract(paid);

            totalFees = totalFees.add(total);
            collectedFees = collectedFees.add(paid);

            boolean isOverdue = record.getDueDate() != null && record.getDueDate().isBefore(today) && balance.compareTo(BigDecimal.ZERO) > 0;
            if (isOverdue) {
                overdueFees = overdueFees.add(balance);
            } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
                pendingFees = pendingFees.add(balance);
            }
        }

        return new FeeSummaryResponseDto(totalFees, collectedFees, pendingFees, overdueFees);
    }

    @Transactional
    public FeePayment recordPayment(FeePaymentRequestDto requestDto) {
        FeeRecord record = feeRecordRepository.findById(requestDto.getFeeRecordId())
                .orElseThrow(() -> new RuntimeException("Fee record not found with ID: " + requestDto.getFeeRecordId()));

        BigDecimal currentPaid = record.getPaidAmount() != null ? record.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal totalFee = record.getTotalFee() != null ? record.getTotalFee() : BigDecimal.ZERO;
        BigDecimal balance = totalFee.subtract(currentPaid);

        if (requestDto.getAmount().compareTo(balance) > 0) {
            throw new IllegalArgumentException("The payment cannot exceed the outstanding balance.");
        }

        // Create and save payment entity
        FeePayment payment = new FeePayment();
        payment.setFeeRecord(record);
        payment.setAmount(requestDto.getAmount());
        payment.setPaymentDate(requestDto.getPaymentDate() != null ? requestDto.getPaymentDate() : LocalDate.now());
        payment.setPaymentMethod(requestDto.getPaymentMethod());
        payment.setReferenceNumber(requestDto.getReferenceNumber());
        feePaymentRepository.save(payment);

        // Update fee record totals and status
        BigDecimal newPaid = currentPaid.add(requestDto.getAmount());
        record.setPaidAmount(newPaid);

        if (newPaid.compareTo(totalFee) >= 0) {
            record.setStatus("PAID");
        } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
            record.setStatus("PARTIAL");
        }

        feeRecordRepository.save(record);
        return payment;
    }
}
