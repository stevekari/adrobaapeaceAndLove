package com.association.duesportal.repository;

import com.association.duesportal.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE (n.recipient IS NULL OR n.recipient.id = :recipientId) ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForMember(@Param("recipientId") Long recipientId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipient IS NULL OR n.recipient.id = :recipientId) AND (n.isRead = false OR n.isRead IS NULL)")
    long countUnreadForMember(@Param("recipientId") Long recipientId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient IS NULL AND (n.isRead = false OR n.isRead IS NULL)")
    long countUnreadForBroadcast();

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE (n.recipient IS NULL OR n.recipient.id = :recipientId)")
    void markAllAsReadForMember(@Param("recipientId") Long recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient IS NULL")
    void markAllBroadcastAsRead();

    @Modifying
    @Transactional
    void deleteByRecipientId(Long recipientId);
}
