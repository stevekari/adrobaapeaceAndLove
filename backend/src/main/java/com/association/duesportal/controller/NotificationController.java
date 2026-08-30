package com.association.duesportal.controller;

import com.association.duesportal.dto.NotificationDTO;
import com.association.duesportal.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(@RequestParam(required = false) Long memberId) {
        return ResponseEntity.ok(notificationService.getNotificationsForMember(memberId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam(required = false) Long memberId) {
        long count = notificationService.getUnreadCount(memberId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@RequestParam(required = false) Long memberId) {
        notificationService.markAllAsRead(memberId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
