package com.association.duesportal.service;

import com.association.duesportal.dto.ChatMessageDTO;
import com.association.duesportal.dto.ChatMessageRequestDTO;
import com.association.duesportal.model.ChatMessage;
import com.association.duesportal.model.Member;
import com.association.duesportal.model.Notification;
import com.association.duesportal.repository.ChatMessageRepository;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;
    private final NotificationRepository notificationRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository, 
                              MemberRepository memberRepository,
                              NotificationRepository notificationRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.memberRepository = memberRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<ChatMessageDTO> getMessagesByChannel(String channel) {
        String targetChannel = (channel != null && !channel.trim().isEmpty()) ? channel.trim().toUpperCase() : "GENERAL";
        return chatMessageRepository.findByChannelOrderByCreatedAtAsc(targetChannel)
                .stream()
                .map(ChatMessageDTO::new)
                .collect(Collectors.toList());
    }

    public ChatMessageDTO sendMessage(ChatMessageRequestDTO request) {
        Member sender = null;

        if (request.getSenderId() != null) {
            sender = memberRepository.findById(request.getSenderId()).orElse(null);
        }

        if (sender == null && request.getSenderEmail() != null && !request.getSenderEmail().trim().isEmpty()) {
            sender = memberRepository.findByEmailIgnoreCase(request.getSenderEmail().trim()).orElse(null);
        }

        if (sender == null && request.getMemberCode() != null && !request.getMemberCode().trim().isEmpty()) {
            sender = memberRepository.findByMemberCodeIgnoreCase(request.getMemberCode().trim()).orElse(null);
        }

        if (sender == null) {
            // Fallback to finding first active member or admin in database
            sender = memberRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No registered member accounts found in system."));
        }

        String channel = request.getChannel() != null && !request.getChannel().trim().isEmpty()
                ? request.getChannel().trim().toUpperCase()
                : "GENERAL";

        String content = request.getContent() != null ? request.getContent().trim() : "";
        String messageType = request.getMessageType() != null ? request.getMessageType().toUpperCase() : "TEXT";

        if (content.isEmpty() && (request.getAttachmentData() == null || request.getAttachmentData().trim().isEmpty())) {
            throw new IllegalArgumentException("Message content or attachment cannot be empty.");
        }

        ChatMessage message = new ChatMessage(sender, channel, content, messageType, request.getAttachmentData());

        // WhatsApp Reply Support
        if (request.getReplyToId() != null) {
            message.setReplyToId(request.getReplyToId());
            if (request.getReplyToSenderName() != null && !request.getReplyToSenderName().trim().isEmpty()) {
                message.setReplyToSenderName(request.getReplyToSenderName().trim());
            }
            if (request.getReplyToContent() != null && !request.getReplyToContent().trim().isEmpty()) {
                message.setReplyToContent(request.getReplyToContent().trim());
            }
            if (request.getReplyToMessageType() != null && !request.getReplyToMessageType().trim().isEmpty()) {
                message.setReplyToMessageType(request.getReplyToMessageType().trim());
            }

            // If metadata was not supplied in request, look up from referenced message
            if (message.getReplyToSenderName() == null || message.getReplyToContent() == null) {
                chatMessageRepository.findById(request.getReplyToId()).ifPresent(repliedMsg -> {
                    if (message.getReplyToSenderName() == null && repliedMsg.getSender() != null) {
                        message.setReplyToSenderName(repliedMsg.getSender().getFullName());
                    }
                    if (message.getReplyToContent() == null) {
                        message.setReplyToContent(repliedMsg.getContent());
                    }
                    if (message.getReplyToMessageType() == null) {
                        message.setReplyToMessageType(repliedMsg.getMessageType());
                    }
                });
            }
        }

        ChatMessage saved = chatMessageRepository.save(message);

        // Generate Real Notification for the Association
        String snippet = content.length() > 60 ? content.substring(0, 57) + "..." : content;
        if ("VOICE".equalsIgnoreCase(messageType)) snippet = "🎙️ Sent a voice note";
        if ("IMAGE".equalsIgnoreCase(messageType)) snippet = "📸 Shared a photo/receipt attachment";

        Notification notification = new Notification(
                null, // broadcast to members/admins
                "💬 " + sender.getFullName() + " in #" + channel.toLowerCase(),
                snippet,
                "CHAT",
                "chat"
        );
        notificationRepository.save(notification);

        return new ChatMessageDTO(saved);
    }

    public ChatMessageDTO editMessage(Long messageId, com.association.duesportal.dto.ChatMessageEditRequestDTO request) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found with ID: " + messageId));

        if (Boolean.TRUE.equals(message.getIsDeleted())) {
            throw new IllegalArgumentException("Cannot edit a deleted message.");
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Edited message content cannot be empty.");
        }

        message.setContent(request.getContent().trim());
        message.setIsEdited(true);
        message.setEditedAt(java.time.LocalDateTime.now());

        ChatMessage updated = chatMessageRepository.save(message);
        return new ChatMessageDTO(updated);
    }

    public ChatMessageDTO deleteMessage(Long messageId, Long requesterId, String requesterEmail, String requesterRole) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found with ID: " + messageId));

        // Strict Ownership & Permission Validation
        boolean isAdminOrTreasurer = requesterRole != null && 
                ("ADMIN".equalsIgnoreCase(requesterRole.trim()) || "TREASURER".equalsIgnoreCase(requesterRole.trim()));

        if (!isAdminOrTreasurer && (requesterId != null || requesterEmail != null)) {
            boolean isOwner = false;
            if (message.getSender() != null) {
                if (requesterId != null && message.getSender().getId().equals(requesterId)) {
                    isOwner = true;
                } else if (requesterEmail != null && message.getSender().getEmail() != null &&
                        message.getSender().getEmail().equalsIgnoreCase(requesterEmail.trim())) {
                    isOwner = true;
                }
            }

            if (!isOwner) {
                throw new IllegalArgumentException("Permission Denied: You can only delete messages that you posted.");
            }
        }

        message.setIsDeleted(true);
        message.setDeletedAt(java.time.LocalDateTime.now());
        message.setContent("🚫 This message was deleted");
        message.setAttachmentData(null);

        ChatMessage updated = chatMessageRepository.save(message);
        return new ChatMessageDTO(updated);
    }

    public ChatMessageDTO deleteMessage(Long messageId) {
        return deleteMessage(messageId, null, null, null);
    }

    public void permanentDeleteMessage(Long messageId) {
        if (!chatMessageRepository.existsById(messageId)) {
            throw new IllegalArgumentException("Message not found with ID: " + messageId);
        }
        chatMessageRepository.deleteById(messageId);
    }

    public long getTotalMessageCount() {
        return chatMessageRepository.count();
    }
}
