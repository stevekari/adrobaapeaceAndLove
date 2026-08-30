package com.association.duesportal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ScheduleProgressDTO {
    private Long id;
    private String title;
    private BigDecimal amountPerMember;
    private String frequency;
    private LocalDate dueDate;
    private BigDecimal totalCollected;
    private BigDecimal targetAmount;
    private long paidMembersCount;
    private long totalMembersCount;
    private double percentage;
    private boolean active;

    public ScheduleProgressDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getAmountPerMember() {
        return amountPerMember;
    }

    public void setAmountPerMember(BigDecimal amountPerMember) {
        this.amountPerMember = amountPerMember;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getTotalCollected() {
        return totalCollected;
    }

    public void setTotalCollected(BigDecimal totalCollected) {
        this.totalCollected = totalCollected;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public long getPaidMembersCount() {
        return paidMembersCount;
    }

    public void setPaidMembersCount(long paidMembersCount) {
        this.paidMembersCount = paidMembersCount;
    }

    public long getTotalMembersCount() {
        return totalMembersCount;
    }

    public void setTotalMembersCount(long totalMembersCount) {
        this.totalMembersCount = totalMembersCount;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}

