package com.association.duesportal;

import com.association.duesportal.dto.NotificationDTO;
import com.association.duesportal.model.Member;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.service.MemberService;
import com.association.duesportal.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class NotificationServiceTests {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MemberService memberService;

    @Test
    void testGetNotifications() {
        Member member = memberRepository.findAll().get(0);
        List<NotificationDTO> list = notificationService.getNotificationsForMember(member.getId());
        assertNotNull(list);
        assertFalse(list.isEmpty());
    }

    @Test
    void testCreateAndMarkNotificationRead() {
        Member member = memberRepository.findAll().get(0);
        NotificationDTO created = notificationService.createNotification(
                member,
                "Test Alert",
                "This is a test notification",
                "SYSTEM",
                "dashboard"
        );
        assertNotNull(created);
        assertEquals("Test Alert", created.getTitle());
        assertFalse(created.getIsRead());

        notificationService.markAsRead(created.getId());
        List<NotificationDTO> list = notificationService.getNotificationsForMember(member.getId());
        NotificationDTO found = list.stream().filter(n -> n.getId().equals(created.getId())).findFirst().orElse(null);
        assertNotNull(found);
        assertTrue(found.getIsRead());
    }

    @Test
    void testMemberProfileUpdate() {
        Member member = memberRepository.findAll().get(0);
        member.setCity("Kumasi Central");
        member.setPlaceOfLiving("Ahodwo Plot 99");
        member.setOccupation("Lead Software Architect");
        member.setProfilePhoto("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

        Member updated = memberService.updateMember(member.getId(), member);
        assertEquals("Kumasi Central", updated.getCity());
        assertEquals("Ahodwo Plot 99", updated.getPlaceOfLiving());
        assertEquals("Lead Software Architect", updated.getOccupation());
        assertNotNull(updated.getProfilePhoto());
    }
}

