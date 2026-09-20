package com.association.duesportal.controller;

import com.association.duesportal.dto.ChatMessageDTO;
import com.association.duesportal.dto.ChatMessageRequestDTO;
import com.association.duesportal.service.ChatMessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(@RequestParam(defaultValue = "GENERAL") String channel) {
        return ResponseEntity.ok(chatMessageService.getMessagesByChannel(channel));
    }

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageRequestDTO request) {
        try {
            ChatMessageDTO created = chatMessageService.sendMessage(request);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/messages/{id}")
    public ResponseEntity<?> editMessage(@PathVariable Long id, @RequestBody com.association.duesportal.dto.ChatMessageEditRequestDTO request) {
        try {
            ChatMessageDTO updated = chatMessageService.editMessage(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long id,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(required = false) String requesterEmail,
            @RequestParam(required = false) String requesterRole) {
        try {
            ChatMessageDTO deleted = chatMessageService.deleteMessage(id, requesterId, requesterEmail, requesterRole);
            return ResponseEntity.ok(deleted);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/messages/{id}/permanent")
    public ResponseEntity<?> permanentDeleteMessage(@PathVariable Long id) {
        try {
            chatMessageService.permanentDeleteMessage(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

