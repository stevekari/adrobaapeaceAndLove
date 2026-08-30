package com.association.duesportal.dto;

import com.association.duesportal.model.Member;
import com.association.duesportal.model.PaymentRecord;
import java.math.BigDecimal;
import java.util.List;

public class MemberDuesSummaryDTO {
    private Member member;
    private BigDecimal totalPaid;
    private long totalTransactions;
    private String duesStatus; // UP_TO_DATE, PENDING_DUES, OVERDUE
    private List<PaymentRecord> paymentHistory;

    public MemberDuesSummaryDTO() {}

    public MemberDuesSummaryDTO(Member member, BigDecimal totalPaid, long totalTransactions, String duesStatus, List<PaymentRecord> paymentHistory) {
        this.member = member;
        this.totalPaid = totalPaid;
        this.totalTransactions = totalTransactions;
        this.duesStatus = duesStatus;
        this.paymentHistory = paymentHistory;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public String getDuesStatus() {
        return duesStatus;
    }

    public void setDuesStatus(String duesStatus) {
        this.duesStatus = duesStatus;
    }

    public List<PaymentRecord> getPaymentHistory() {
        return paymentHistory;
    }

    public void setPaymentHistory(List<PaymentRecord> paymentHistory) {
        this.paymentHistory = paymentHistory;
    }
}

