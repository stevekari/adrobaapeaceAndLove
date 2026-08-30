package com.association.duesportal.dto;

import com.association.duesportal.model.Announcement;
import com.association.duesportal.model.PaymentRecord;
import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsDTO {
    private BigDecimal totalCollected;
    private long activeMembersCount;
    private long totalMembersCount;
    private long pendingPaymentsCount;
    private long totalSchedulesCount;
    private double collectionRate;
    private List<PaymentRecord> recentPayments;
    private List<Announcement> recentAnnouncements;
    private List<ScheduleProgressDTO> schedules;

    public DashboardStatsDTO() {}

    public BigDecimal getTotalCollected() {
        return totalCollected;
    }

    public void setTotalCollected(BigDecimal totalCollected) {
        this.totalCollected = totalCollected;
    }

    public long getActiveMembersCount() {
        return activeMembersCount;
    }

    public void setActiveMembersCount(long activeMembersCount) {
        this.activeMembersCount = activeMembersCount;
    }

    public long getTotalMembersCount() {
        return totalMembersCount;
    }

    public void setTotalMembersCount(long totalMembersCount) {
        this.totalMembersCount = totalMembersCount;
    }

    public long getPendingPaymentsCount() {
        return pendingPaymentsCount;
    }

    public void setPendingPaymentsCount(long pendingPaymentsCount) {
        this.pendingPaymentsCount = pendingPaymentsCount;
    }

    public long getTotalSchedulesCount() {
        return totalSchedulesCount;
    }

    public void setTotalSchedulesCount(long totalSchedulesCount) {
        this.totalSchedulesCount = totalSchedulesCount;
    }

    public double getCollectionRate() {
        return collectionRate;
    }

    public void setCollectionRate(double collectionRate) {
        this.collectionRate = collectionRate;
    }

    public List<PaymentRecord> getRecentPayments() {
        return recentPayments;
    }

    public void setRecentPayments(List<PaymentRecord> recentPayments) {
        this.recentPayments = recentPayments;
    }

    public List<Announcement> getRecentAnnouncements() {
        return recentAnnouncements;
    }

    public void setRecentAnnouncements(List<Announcement> recentAnnouncements) {
        this.recentAnnouncements = recentAnnouncements;
    }

    public List<ScheduleProgressDTO> getSchedules() {
        return schedules;
    }

    public void setSchedules(List<ScheduleProgressDTO> schedules) {
        this.schedules = schedules;
    }
}

