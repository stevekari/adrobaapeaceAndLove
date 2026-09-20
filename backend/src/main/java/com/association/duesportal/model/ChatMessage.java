package com.association.duesportal.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;

    @NotBlank(message = "Channel is required")
    @Column(nullable = false)
    private String channel = "GENERAL"; // GENERAL, SUPPORT, WELFARE

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String messageType = "TEXT"; // TEXT, QUICK_PHRASE, VOICE, IMAGE

    @Lob
    @Column(columnDefinition = "TEXT")
    private String attachmentData; // Base64 audio or image data if attached

    // WhatsApp Reply Support
    @Column(name = "reply_to_id")
    private Long replyToId;

    @Column(name = "reply_to_sender_name")
    private String replyToSenderName;

    @Column(name = "reply_to_content", columnDefinition = "TEXT")
    private String replyToContent;

    @Column(name = "reply_to_message_type")
    private String replyToMessageType;

    // WhatsApp Edit Support
    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited = false;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    // WhatsApp Delete Support
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public ChatMessage() {
        this.createdAt = LocalDateTime.now();
        this.isEdited = false;
        this.isDeleted = false;
    }

    public ChatMessage(Member sender, String channel, String content, String messageType, String attachmentData) {
        this.sender = sender;
        this.channel = channel != null ? channel : "GENERAL";
        this.content = content;
        this.messageType = messageType != null ? messageType : "TEXT";
        this.attachmentData = attachmentData;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Member getSender() {
        return sender;
    }

    public void setSender(Member sender) {
        this.sender = sender;
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
        return isEdited != null && isEdited;
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
        return isDeleted != null && isDeleted;
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

