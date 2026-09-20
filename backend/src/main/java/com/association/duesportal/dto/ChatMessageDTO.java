package com.association.duesportal.dto;

import com.association.duesportal.model.ChatMessage;
import com.association.duesportal.model.Member;

import java.time.LocalDateTime;

public class ChatMessageDTO {

    private Long id;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String senderMemberCode;
    private String channel;
    private String content;
    private String messageType;
    private String attachmentData;
    private Long replyToId;
    private String replyToSenderName;
    private String replyToContent;
    private String replyToMessageType;
    private Boolean isEdited;
    private LocalDateTime editedAt;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;

    public ChatMessageDTO() {
    }

    public ChatMessageDTO(ChatMessage msg) {
        this.id = msg.getId();
        this.channel = msg.getChannel();
        this.content = msg.getContent();
        this.messageType = msg.getMessageType();
        this.attachmentData = msg.getAttachmentData();
        this.replyToId = msg.getReplyToId();
        this.replyToSenderName = msg.getReplyToSenderName();
        this.replyToContent = msg.getReplyToContent();
        this.replyToMessageType = msg.getReplyToMessageType();
        this.isEdited = msg.getIsEdited();
        this.editedAt = msg.getEditedAt();
        this.isDeleted = msg.getIsDeleted();
        this.deletedAt = msg.getDeletedAt();
        this.createdAt = msg.getCreatedAt();

        Member sender = msg.getSender();
        if (sender != null) {
            this.senderId = sender.getId();
            this.senderName = sender.getFullName();
            this.senderRole = sender.getRole();
            this.senderMemberCode = sender.getMemberCode();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public String getSenderMemberCode() {
        return senderMemberCode;
    }

    public void setSenderMemberCode(String senderMemberCode) {
        this.senderMemberCode = senderMemberCode;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getAttachmentData() {
        return attachmentData;
    }

    public void setAttachmentData(String attachmentData) {
        this.attachmentData = attachmentData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getReplyToId() {
        return replyToId;
    }

    public void setReplyToId(Long replyToId) {
        this.replyToId = replyToId;
    }

    public String getReplyToSenderName() {
        return replyToSenderName;
    }

    public void setReplyToSenderName(String replyToSenderName) {
        this.replyToSenderName = replyToSenderName;
    }

    public String getReplyToContent() {
        return replyToContent;
    }

    public void setReplyToContent(String replyToContent) {
        this.replyToContent = replyToContent;
    }

    public String getReplyToMessageType() {
        return replyToMessageType;
    }

    public void setReplyToMessageType(String replyToMessageType) {
        this.replyToMessageType = replyToMessageType;
    }

    public Boolean getIsEdited() {
        return isEdited;
    }

    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }

    public LocalDateTime getEditedAt() {
        return editedAt;
    }

    public void setEditedAt(LocalDateTime editedAt) {
        this.editedAt = editedAt;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}

