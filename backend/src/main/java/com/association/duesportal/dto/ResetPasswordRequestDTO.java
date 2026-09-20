package com.association.duesportal.dto;

public class ResetPasswordRequestDTO {

    private String email;
    private String resetCode;
    private String newPassword;

    public ResetPasswordRequestDTO() {
    }

    public ResetPasswordRequestDTO(String email, String resetCode, String newPassword) {
        this.email = email;
        this.resetCode = resetCode;
        this.newPassword = newPassword;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getResetCode() {
        return resetCode;
    }

    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

