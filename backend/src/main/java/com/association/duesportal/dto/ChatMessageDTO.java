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
    private LocalDateTime createdAt;

    public ChatMessageDTO() {
    }

    public ChatMessageDTO(ChatMessage msg) {
        this.id = msg.getId();
        this.channel = msg.getChannel();
        this.content = msg.getContent();
        this.messageType = msg.getMessageType();
        this.attachmentData = msg.getAttachmentData();
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
}

