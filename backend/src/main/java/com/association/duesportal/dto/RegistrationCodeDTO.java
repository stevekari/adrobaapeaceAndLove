package com.association.duesportal.dto;

import com.association.duesportal.model.RegistrationCode;
import java.time.LocalDateTime;

public class RegistrationCodeDTO {

    private Long id;
    private String code;
    private String role;
    private String status;
    private String notes;
    private Long preAssignedMemberId;
    private String preAssignedMemberName;
    private String preAssignedMemberEmail;
    private Long redeemedByMemberId;
    private String redeemedByMemberName;
    private LocalDateTime createdAt;
    private LocalDateTime redeemedAt;

    public RegistrationCodeDTO() {
    }

    public RegistrationCodeDTO(RegistrationCode rc) {
        this.id = rc.getId();
        this.code = rc.getCode();
        this.role = rc.getRole();
        this.status = rc.getStatus();
        this.notes = rc.getNotes();
        this.createdAt = rc.getCreatedAt();
        this.redeemedAt = rc.getRedeemedAt();

        if (rc.getPreAssignedMember() != null) {
            this.preAssignedMemberId = rc.getPreAssignedMember().getId();
            this.preAssignedMemberName = rc.getPreAssignedMember().getFullName();
            this.preAssignedMemberEmail = rc.getPreAssignedMember().getEmail();
        }

        if (rc.getRedeemedBy() != null) {
            this.redeemedByMemberId = rc.getRedeemedBy().getId();
            this.redeemedByMemberName = rc.getRedeemedBy().getFullName();
        }
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getPreAssignedMemberId() {
        return preAssignedMemberId;
    }

    public void setPreAssignedMemberId(Long preAssignedMemberId) {
        this.preAssignedMemberId = preAssignedMemberId;
    }

    public String getPreAssignedMemberName() {
        return preAssignedMemberName;
    }

    public void setPreAssignedMemberName(String preAssignedMemberName) {
        this.preAssignedMemberName = preAssignedMemberName;
    }

    public String getPreAssignedMemberEmail() {
        return preAssignedMemberEmail;
    }

    public void setPreAssignedMemberEmail(String preAssignedMemberEmail) {
        this.preAssignedMemberEmail = preAssignedMemberEmail;
    }

    public Long getRedeemedByMemberId() {
        return redeemedByMemberId;
    }

    public void setRedeemedByMemberId(Long redeemedByMemberId) {
        this.redeemedByMemberId = redeemedByMemberId;
    }

    public String getRedeemedByMemberName() {
        return redeemedByMemberName;
    }

    public void setRedeemedByMemberName(String redeemedByMemberName) {
        this.redeemedByMemberName = redeemedByMemberName;
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

