package com.powerschool.backend.controller;

import com.powerschool.backend.dto.FeePaymentRequestDto;
import com.powerschool.backend.dto.FeeSummaryResponseDto;
import com.powerschool.backend.entity.FeePayment;
import com.powerschool.backend.entity.FeeRecord;
import com.powerschool.backend.service.FeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/fees")
public class AdminFeeController {

    private final FeeService feeService;

    public AdminFeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping
    public ResponseEntity<List<FeeRecord>> getAllFeeRecords() {
        return ResponseEntity.ok(feeService.getAllFeeRecords());
    }

    @GetMapping("/summary")
    public ResponseEntity<FeeSummaryResponseDto> getFeeSummary() {
        return ResponseEntity.ok(feeService.getFeeSummary());
    }

    @PostMapping("/payments")
    public ResponseEntity<FeePayment> recordPayment(@RequestBody FeePaymentRequestDto requestDto) {
        FeePayment payment = feeService.recordPayment(requestDto);
        return ResponseEntity.ok(payment);
    }
}
