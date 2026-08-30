package com.association.duesportal.dto;

public class MemberCodeVerifyDTO {

    private boolean valid;
    private Long memberId;
    private String memberCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private boolean isPasswordSet;
    private String message;

    public MemberCodeVerifyDTO() {
    }

    public MemberCodeVerifyDTO(boolean valid, Long memberId, String memberCode, String firstName, String lastName, String email, String phone, String role, boolean isPasswordSet, String message) {
        this.valid = valid;
        this.memberId = memberId;
        this.memberCode = memberCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.isPasswordSet = isPasswordSet;
        this.message = message;
    }

    public static MemberCodeVerifyDTO invalid(String message) {
        MemberCodeVerifyDTO dto = new MemberCodeVerifyDTO();
        dto.setValid(false);
        dto.setMessage(message);
        return dto;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public String getMemberCode() {
        return memberCode;
    }

    public void setMemberCode(String memberCode) {
        this.memberCode = memberCode;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isPasswordSet() {
        return isPasswordSet;
    }

    public void setPasswordSet(boolean passwordSet) {
        isPasswordSet = passwordSet;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

