package com.powerschool.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FeePaymentRequestDto {
    private Long feeRecordId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String referenceNumber;

    // Getters and Setters
    public Long getFeeRecordId() { return feeRecordId; }
    public void setFeeRecordId(Long feeRecordId) { this.feeRecordId = feeRecordId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
}
