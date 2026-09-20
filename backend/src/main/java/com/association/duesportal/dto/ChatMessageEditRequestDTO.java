package com.association.duesportal.dto;

public class ChatMessageEditRequestDTO {

    private String content;
    private Long senderId;
    private String senderEmail;
    private String userRole;

    public ChatMessageEditRequestDTO() {
    }

    public ChatMessageEditRequestDTO(String content) {
        this.content = content;
    }

    public ChatMessageEditRequestDTO(String content, Long senderId, String senderEmail, String userRole) {
        this.content = content;
        this.senderId = senderId;
        this.senderEmail = senderEmail;
        this.userRole = userRole;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
}

