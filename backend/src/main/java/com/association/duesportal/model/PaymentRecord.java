package com.association.duesportal.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_records")
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Member is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @NotNull(message = "Dues schedule is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "schedule_id", nullable = false)
    private DuesSchedule schedule;

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @NotBlank(message = "Payment method is required")
    @Column(nullable = false)
    private String paymentMethod; // Mobile Money, Credit Card, Bank Transfer, Cash, Cheque

    @NotBlank(message = "Receipt number is required")
    @Column(nullable = false, unique = true)
    private String receiptNumber;

    @Column(nullable = false)
    private String status = "PAID"; // PAID, PENDING, REVERSED

    @Column(length = 500)
    private String notes;

    public PaymentRecord() {
        this.paymentDate = LocalDateTime.now();
    }

    public PaymentRecord(Member member, DuesSchedule schedule, BigDecimal amountPaid, LocalDateTime paymentDate, String paymentMethod, String receiptNumber, String status, String notes) {
        this.member = member;
        this.schedule = schedule;
        this.amountPaid = amountPaid;
        this.paymentDate = paymentDate != null ? paymentDate : LocalDateTime.now();
        this.paymentMethod = paymentMethod;
        this.receiptNumber = receiptNumber;
        this.status = status != null ? status : "PAID";
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public DuesSchedule getSchedule() {
        return schedule;
    }

    public void setSchedule(DuesSchedule schedule) {
        this.schedule = schedule;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

