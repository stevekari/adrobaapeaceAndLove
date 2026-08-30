package com.association.duesportal.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastName;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String placeOfLiving; // Address / Street / Residence

    private String city; // City of residence

    private String occupation; // Profession / Occupation

    @Lob
    @Column(columnDefinition = "TEXT")
    private String profilePhoto; // Base64 profile photo or URL

    @Column(nullable = false, unique = true)
    private String memberCode;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false)
    private Boolean isPasswordSet = false;

    @Column(nullable = false)
    private LocalDate joinDate;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED

    @Column(nullable = false)
    private String role = "MEMBER"; // ADMIN, TREASURER, MEMBER

    public Member() {
        this.joinDate = LocalDate.now();
        this.isPasswordSet = false;
    }

    public Member(String firstName, String lastName, String email, String phone, LocalDate joinDate, String status, String role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.joinDate = joinDate != null ? joinDate : LocalDate.now();
        this.status = status != null ? status : "ACTIVE";
        this.role = role != null ? role : "MEMBER";
        this.isPasswordSet = false;
    }

    public Member(String firstName, String lastName, String email, String phone, 
                  String placeOfLiving, String city, String profilePhoto, String occupation,
                  LocalDate joinDate, String status, String role, 
                  String memberCode, String password, Boolean isPasswordSet) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.placeOfLiving = placeOfLiving;
        this.city = city;
        this.profilePhoto = profilePhoto;
        this.occupation = occupation;
        this.joinDate = joinDate != null ? joinDate : LocalDate.now();
        this.status = status != null ? status : "ACTIVE";
        this.role = role != null ? role : "MEMBER";
        this.memberCode = memberCode;
        this.password = password;
        this.isPasswordSet = isPasswordSet != null ? isPasswordSet : false;
    }

    // Getters and Setters
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

    public Boolean getIsPasswordSet() {
        return isPasswordSet != null && isPasswordSet;
    }

    public void setIsPasswordSet(Boolean passwordSet) {
        this.isPasswordSet = passwordSet;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDate joinDate) {
        this.joinDate = joinDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
