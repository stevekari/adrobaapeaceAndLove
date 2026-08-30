package com.association.duesportal.dto;

import com.association.duesportal.model.Member;

public class AuthResponseDTO {

    private String token;
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String placeOfLiving;
    private String city;
    private String occupation;
    private String profilePhoto;
    private String role;
    private String status;
    private String memberCode;
    private Boolean isPasswordSet;
    private String message;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String token, Member member, String message) {
        this.token = token;
        this.id = member.getId();
        this.firstName = member.getFirstName();
        this.lastName = member.getLastName();
        this.email = member.getEmail();
        this.phone = member.getPhone();
        this.placeOfLiving = member.getPlaceOfLiving();
        this.city = member.getCity();
        this.occupation = member.getOccupation();
        this.profilePhoto = member.getProfilePhoto();
        this.role = member.getRole();
        this.status = member.getStatus();
        this.memberCode = member.getMemberCode();
        this.isPasswordSet = member.getIsPasswordSet();
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "").trim();
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

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
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

    public String getMemberCode() {
        return memberCode;
    }

    public void setMemberCode(String memberCode) {
        this.memberCode = memberCode;
    }

    public Boolean getIsPasswordSet() {
        return isPasswordSet;
    }

    public void setIsPasswordSet(Boolean passwordSet) {
        isPasswordSet = passwordSet;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
