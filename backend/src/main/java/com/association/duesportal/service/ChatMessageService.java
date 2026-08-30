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
        if (request.getSenderId() == null) {
            throw new IllegalArgumentException("Sender ID is required.");
        }

        Member sender = memberRepository.findById(request.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + request.getSenderId()));

        String channel = request.getChannel() != null && !request.getChannel().trim().isEmpty()
                ? request.getChannel().trim().toUpperCase()
                : "GENERAL";

        String content = request.getContent() != null ? request.getContent().trim() : "";
        String messageType = request.getMessageType() != null ? request.getMessageType().toUpperCase() : "TEXT";

        if (content.isEmpty() && (request.getAttachmentData() == null || request.getAttachmentData().trim().isEmpty())) {
            throw new IllegalArgumentException("Message content or attachment cannot be empty.");
        }

        ChatMessage message = new ChatMessage(sender, channel, content, messageType, request.getAttachmentData());
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

    public void deleteMessage(Long messageId) {
        if (!chatMessageRepository.existsById(messageId)) {
            throw new IllegalArgumentException("Message not found with ID: " + messageId);
        }
        chatMessageRepository.deleteById(messageId);
    }

    public long getTotalMessageCount() {
        return chatMessageRepository.count();
    }
}
