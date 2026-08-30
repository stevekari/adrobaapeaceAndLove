package com.association.duesportal.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "registration_codes")
public class RegistrationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Code is required")
    @Column(nullable = false, unique = true)
    private String code; // e.g. MEM-2026-8812, ASSOC-4412

    @Column(nullable = false)
    private String role = "MEMBER"; // MEMBER, TREASURER, ADMIN

    @Column(nullable = false)
    private String status = "AVAILABLE"; // AVAILABLE, REDEEMED, REVOKED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pre_assigned_member_id")
    private Member preAssignedMember; // Optional: if pre-assigned to a specific member

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "redeemed_by_member_id")
    private Member redeemedBy; // Populated when redeemed

    private String notes; // e.g. "2026 Q3 Membership Drive", "Executive Secretariat Invitation"

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime redeemedAt;

    public RegistrationCode() {
        this.createdAt = LocalDateTime.now();
        this.status = "AVAILABLE";
    }

    public RegistrationCode(String code, String role, String notes, Member preAssignedMember) {
        this.code = code;
        this.role = role != null ? role : "MEMBER";
        this.notes = notes;
        this.preAssignedMember = preAssignedMember;
        this.status = "AVAILABLE";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Member getPreAssignedMember() {
        return preAssignedMember;
    }

    public void setPreAssignedMember(Member preAssignedMember) {
        this.preAssignedMember = preAssignedMember;
    }

    public Member getRedeemedBy() {
        return redeemedBy;
    }

    public void setRedeemedBy(Member redeemedBy) {
        this.redeemedBy = redeemedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getRedeemedAt() {
        return redeemedAt;
    }

    public void setRedeemedAt(LocalDateTime redeemedAt) {
        this.redeemedAt = redeemedAt;
    }
}

