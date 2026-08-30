package com.association.duesportal;

import com.association.duesportal.dto.ChatMessageDTO;
import com.association.duesportal.dto.ChatMessageRequestDTO;
import com.association.duesportal.model.Member;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.service.ChatMessageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ChatMessageServiceTests {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private MemberRepository memberRepository;

    @Test
    void testGetMessagesByChannel() {
        Member member = memberRepository.findAll().get(0);
        chatMessageService.sendMessage(new ChatMessageRequestDTO(
                member.getId(),
                "GENERAL",
                "Testing channel retrieval",
                "TEXT",
                null
        ));

        List<ChatMessageDTO> generalMessages = chatMessageService.getMessagesByChannel("GENERAL");
        assertNotNull(generalMessages);
        assertFalse(generalMessages.isEmpty());
    }

    @Test
    void testSendChatMessage() {
        Member member = memberRepository.findAll().get(0);
        ChatMessageRequestDTO req = new ChatMessageRequestDTO(
                member.getId(),
                "GENERAL",
                "Hello test message from member",
                "TEXT",
                null
        );

        ChatMessageDTO result = chatMessageService.sendMessage(req);
        assertNotNull(result);
        assertEquals("GENERAL", result.getChannel());
        assertEquals("Hello test message from member", result.getContent());
        assertEquals(member.getFullName(), result.getSenderName());
    }

    @Test
    void testSendQuickPhraseMessage() {
        Member member = memberRepository.findAll().get(0);
        ChatMessageRequestDTO req = new ChatMessageRequestDTO(
                member.getId(),
                "SUPPORT",
                "💳 I just made a dues payment",
                "QUICK_PHRASE",
                null
        );

        ChatMessageDTO result = chatMessageService.sendMessage(req);
        assertNotNull(result);
        assertEquals("SUPPORT", result.getChannel());
        assertEquals("QUICK_PHRASE", result.getMessageType());
    }
}
