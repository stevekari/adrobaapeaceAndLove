package com.association.duesportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class GoogleLoginRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String firstName;
    private String lastName;
    private String photoUrl;
    private String googleUid;

    public GoogleLoginRequestDTO() {
    }

    public GoogleLoginRequestDTO(String email, String firstName, String lastName, String photoUrl, String googleUid) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.photoUrl = photoUrl;
        this.googleUid = googleUid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getGoogleUid() {
        return googleUid;
    }

    public void setGoogleUid(String googleUid) {
        this.googleUid = googleUid;
    }
}

