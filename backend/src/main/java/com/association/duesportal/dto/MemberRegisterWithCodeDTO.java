package com.association.duesportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MemberRegisterWithCodeDTO {

    @NotBlank(message = "Member code is required")
    private String memberCode;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String phone; // Optional phone update during registration

    public MemberRegisterWithCodeDTO() {
    }

    public MemberRegisterWithCodeDTO(String memberCode, String password, String phone) {
        this.memberCode = memberCode;
        this.password = password;
        this.phone = phone;
    }

    public String getMemberCode() {
        return memberCode;
    }

    public void setMemberCode(String memberCode) {
        this.memberCode = memberCode;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}

