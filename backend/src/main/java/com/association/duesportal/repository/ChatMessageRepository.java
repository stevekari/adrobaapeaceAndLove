package com.association.duesportal.repository;

import com.association.duesportal.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChannelOrderByCreatedAtAsc(String channel);

    List<ChatMessage> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    List<ChatMessage> findTop50ByChannelOrderByCreatedAtDesc(String channel);

    @Modifying
    @Transactional
    void deleteBySenderId(Long senderId);
}
