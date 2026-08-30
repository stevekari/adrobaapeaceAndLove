package com.association.duesportal.dto;

import jakarta.validation.constraints.NotBlank;

public class RedeemCodeRequestDTO {

    @NotBlank(message = "Association code is required")
    private String code;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String placeOfLiving;
    private String city;
    private String occupation;

    @NotBlank(message = "Password is required")
    private String password;

    public RedeemCodeRequestDTO() {
    }

    public RedeemCodeRequestDTO(String code, String firstName, String lastName, String email, String phone, String placeOfLiving, String city, String occupation, String password) {
        this.code = code;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.placeOfLiving = placeOfLiving;
        this.city = city;
        this.occupation = occupation;
        this.password = password;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public String getPlaceOfLiving() {
        return placeOfLiving;
    }

    public void setPlaceOfLiving(String placeOfLiving) {
        this.placeOfLiving = placeOfLiving;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

