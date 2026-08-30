package com.association.duesportal.service;

import com.association.duesportal.dto.NotificationDTO;
import com.association.duesportal.model.Member;
import com.association.duesportal.model.Notification;
import com.association.duesportal.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationDTO> getNotificationsForMember(Long memberId) {
        if (memberId == null) {
            return notificationRepository.findAll().stream()
                    .map(NotificationDTO::new)
                    .collect(Collectors.toList());
        }
        return notificationRepository.findNotificationsForMember(memberId).stream()
                .map(NotificationDTO::new)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long memberId) {
        if (memberId == null) {
            return notificationRepository.countUnreadForBroadcast();
        }
        return notificationRepository.countUnreadForMember(memberId);
    }

    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    public void markAllAsRead(Long memberId) {
        if (memberId != null) {
            notificationRepository.markAllAsReadForMember(memberId);
        } else {
            notificationRepository.markAllBroadcastAsRead();
        }
    }

    public NotificationDTO createNotification(Member recipient, String title, String message, String type, String linkTab) {
        Notification n = new Notification(recipient, title, message, type, linkTab);
        Notification saved = notificationRepository.save(n);
        return new NotificationDTO(saved);
    }
}
