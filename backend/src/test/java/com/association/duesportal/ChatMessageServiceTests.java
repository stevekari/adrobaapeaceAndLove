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

    @Test
    void testReplyChatMessage() {
        Member member = memberRepository.findAll().get(0);
        ChatMessageRequestDTO originalReq = new ChatMessageRequestDTO(
                member.getId(),
                "GENERAL",
                "Original question about dues schedule",
                "TEXT",
                null
        );
        ChatMessageDTO original = chatMessageService.sendMessage(originalReq);

        ChatMessageRequestDTO replyReq = new ChatMessageRequestDTO(
                member.getId(),
                "GENERAL",
                "Here is the answer to your question",
                "TEXT",
                null
        );
        replyReq.setReplyToId(original.getId());
        replyReq.setReplyToSenderName(original.getSenderName());
        replyReq.setReplyToContent(original.getContent());

        ChatMessageDTO reply = chatMessageService.sendMessage(replyReq);
        assertNotNull(reply);
        assertEquals(original.getId(), reply.getReplyToId());
        assertEquals(original.getSenderName(), reply.getReplyToSenderName());
        assertEquals("Original question about dues schedule", reply.getReplyToContent());
    }

    @Test
    void testEditChatMessage() {
        Member member = memberRepository.findAll().get(0);
        ChatMessageRequestDTO req = new ChatMessageRequestDTO(
                member.getId(),
                "GENERAL",
                "Message before edit",
                "TEXT",
                null
        );
        ChatMessageDTO original = chatMessageService.sendMessage(req);

        com.association.duesportal.dto.ChatMessageEditRequestDTO editReq = 
                new com.association.duesportal.dto.ChatMessageEditRequestDTO("Message after edit updated", member.getId(), member.getEmail(), member.getRole());

        ChatMessageDTO edited = chatMessageService.editMessage(original.getId(), editReq);
        assertNotNull(edited);
        assertEquals("Message after edit updated", edited.getContent());
        assertTrue(edited.getIsEdited());
        assertNotNull(edited.getEditedAt());
    }

    @Test
    void testDeleteChatMessage() {
        Member member = memberRepository.findAll().get(0);
        ChatMessageRequestDTO req = new ChatMessageRequestDTO(
                member.getId(),
                "GENERAL",
                "Message to be deleted",
                "TEXT",
                null
        );
        ChatMessageDTO created = chatMessageService.sendMessage(req);

        ChatMessageDTO deleted = chatMessageService.deleteMessage(created.getId());
        assertNotNull(deleted);
        assertTrue(deleted.getIsDeleted());
        assertTrue(deleted.getContent().contains("deleted"));
        assertNull(deleted.getAttachmentData());
    }
}
