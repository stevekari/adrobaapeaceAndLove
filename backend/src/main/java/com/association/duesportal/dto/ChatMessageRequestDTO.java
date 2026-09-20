package com.association.duesportal.dto;

public class ChatMessageRequestDTO {

    private Long senderId;

    private String senderEmail;

    private String memberCode;

    private String channel = "GENERAL"; // GENERAL, SUPPORT, WELFARE

    private String content;

    private String messageType = "TEXT"; // TEXT, QUICK_PHRASE, VOICE, IMAGE

    private String attachmentData; // Optional base64 audio/image data

    // WhatsApp Reply Support
    private Long replyToId;
    private String replyToSenderName;
    private String replyToContent;
    private String replyToMessageType;

    public ChatMessageRequestDTO() {
    }

    public ChatMessageRequestDTO(Long senderId, String channel, String content, String messageType, String attachmentData) {
        this.senderId = senderId;
        this.channel = channel != null ? channel : "GENERAL";
        this.content = content;
        this.messageType = messageType != null ? messageType : "TEXT";
        this.attachmentData = attachmentData;
    }

    public ChatMessageRequestDTO(Long senderId, String senderEmail, String memberCode, String channel, String content, String messageType, String attachmentData) {
        this.senderId = senderId;
        this.senderEmail = senderEmail;
        this.memberCode = memberCode;
        this.channel = channel != null ? channel : "GENERAL";
        this.content = content;
        this.messageType = messageType != null ? messageType : "TEXT";
        this.attachmentData = attachmentData;
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

    public String getMemberCode() {
        return memberCode;
    }

    public void setMemberCode(String memberCode) {
        this.memberCode = memberCode;
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

