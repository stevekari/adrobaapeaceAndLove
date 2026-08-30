package com.association.duesportal.dto;

import jakarta.validation.constraints.NotNull;

public class ChatMessageRequestDTO {

    @NotNull(message = "Sender ID is required")
    private Long senderId;

    private String channel = "GENERAL"; // GENERAL, SUPPORT, WELFARE

    private String content;

    private String messageType = "TEXT"; // TEXT, QUICK_PHRASE, VOICE, IMAGE

    private String attachmentData; // Optional base64 audio/image data

    public ChatMessageRequestDTO() {
    }

    public ChatMessageRequestDTO(Long senderId, String channel, String content, String messageType, String attachmentData) {
        this.senderId = senderId;
        this.channel = channel != null ? channel : "GENERAL";
        this.content = content;
        this.messageType = messageType != null ? messageType : "TEXT";
        this.attachmentData = attachmentData;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
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
}

