package com.powerschool.backend.dto;

import java.math.BigDecimal;

public class FeeSummaryResponseDto {
    private BigDecimal totalFees;
    private BigDecimal collectedFees;
    private BigDecimal pendingFees;
    private BigDecimal overdueFees;

    public FeeSummaryResponseDto(BigDecimal totalFees, BigDecimal collectedFees, BigDecimal pendingFees, BigDecimal overdueFees) {
        this.totalFees = totalFees;
        this.collectedFees = collectedFees;
        this.pendingFees = pendingFees;
        this.overdueFees = overdueFees;
    }

    // Getters and Setters
    public BigDecimal getTotalFees() { return totalFees; }
    public void setTotalFees(BigDecimal totalFees) { this.totalFees = totalFees; }

    public BigDecimal getCollectedFees() { return collectedFees; }
    public void setCollectedFees(BigDecimal collectedFees) { this.collectedFees = collectedFees; }

    public BigDecimal getPendingFees() { return pendingFees; }
    public void setPendingFees(BigDecimal pendingFees) { this.pendingFees = pendingFees; }

    public BigDecimal getOverdueFees() { return overdueFees; }
    public void setOverdueFees(BigDecimal overdueFees) { this.overdueFees = overdueFees; }
}
