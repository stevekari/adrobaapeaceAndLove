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

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        try {
            chatMessageService.deleteMessage(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

