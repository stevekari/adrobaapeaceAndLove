package com.association.duesportal.dto;

import com.association.duesportal.model.Notification;
import java.time.LocalDateTime;

public class NotificationDTO {

    private Long id;
    private Long recipientId;
    private String title;
    private String message;
    private String type;
    private String linkTab;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDTO() {
    }

    public NotificationDTO(Notification n) {
        this.id = n.getId();
        this.recipientId = n.getRecipient() != null ? n.getRecipient().getId() : null;
        this.title = n.getTitle();
        this.message = n.getMessage();
        this.type = n.getType();
        this.linkTab = n.getLinkTab();
        this.isRead = n.getIsRead();
        this.createdAt = n.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLinkTab() {
        return linkTab;
    }

    public void setLinkTab(String linkTab) {
        this.linkTab = linkTab;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

