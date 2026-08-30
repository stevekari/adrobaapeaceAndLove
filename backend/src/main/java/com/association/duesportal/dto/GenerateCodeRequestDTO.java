package com.association.duesportal.dto;

public class GenerateCodeRequestDTO {

    private String prefix = "MEM"; // e.g. MEM, ASSOC, TRS, ADM
    private String role = "MEMBER"; // MEMBER, TREASURER, ADMIN
    private Integer quantity = 1; // 1 to 20 codes at a time
    private String notes; // e.g. "2026 Q3 General Meeting Invitation"
    private Long preAssignedMemberId; // optional

    public GenerateCodeRequestDTO() {
    }

    public GenerateCodeRequestDTO(String prefix, String role, Integer quantity, String notes, Long preAssignedMemberId) {
        this.prefix = prefix != null ? prefix : "MEM";
        this.role = role != null ? role : "MEMBER";
        this.quantity = quantity != null ? quantity : 1;
        this.notes = notes;
        this.preAssignedMemberId = preAssignedMemberId;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
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
}

