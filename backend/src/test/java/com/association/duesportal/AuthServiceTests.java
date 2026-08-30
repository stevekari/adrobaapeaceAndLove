package com.association.duesportal;

import com.association.duesportal.dto.*;
import com.association.duesportal.model.Member;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.service.AuthService;
import com.association.duesportal.util.PasswordUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AuthServiceTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private MemberRepository memberRepository;

    @Test
    void testAdminLoginWithEmail() {
        LoginRequestDTO req = new LoginRequestDTO("stephen.karikari@association.org", "admin123");
        AuthResponseDTO res = authService.login(req);
        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("Stephen", res.getFirstName());
        assertEquals("ADMIN", res.getRole());
    }

    @Test
    void testLoginWithMemberCode() {
        // Create active test member
        Member member = new Member(
                "Kwame", "Boateng", "kwame.test." + System.currentTimeMillis() + "@association.org",
                "+233 50 112 2334", "Ahodwo", "Kumasi", null, "Engineer",
                LocalDate.now(), "ACTIVE", "MEMBER",
                "MEM-TEST-" + (System.currentTimeMillis() % 10000),
                PasswordUtil.hashPassword("member123"), true
        );
        member = memberRepository.save(member);

        LoginRequestDTO req = new LoginRequestDTO(member.getMemberCode(), "member123");
        AuthResponseDTO res = authService.login(req);
        assertNotNull(res);
        assertEquals("Kwame", res.getFirstName());
        assertEquals("MEMBER", res.getRole());
    }

    @Test
    void testRegisterAdmin() {
        AdminRegisterRequestDTO req = new AdminRegisterRequestDTO(
                "Test", "Executive", "test.exec." + System.currentTimeMillis() + "@association.org", "+233 24 999 0000",
                "secret123", "ADMIN", null
        );
        AuthResponseDTO res = authService.registerAdmin(req);
        assertNotNull(res);
        assertNotNull(res.getMemberCode());
        assertTrue(res.getMemberCode().startsWith("ADM-"));
        assertEquals("Test", res.getFirstName());
        assertEquals("ADMIN", res.getRole());
    }

    @Test
    void testVerifyMemberCodeAndSetPassword() {
        // Create unactivated test member
        String code = "MEM-ACT-" + (System.currentTimeMillis() % 10000);
        Member member = new Member(
                "Abena", "Osei", "abena.test." + System.currentTimeMillis() + "@association.org",
                "+233 55 443 3221", "Plot 45", "Takoradi", null, "Healthcare",
                LocalDate.now(), "ACTIVE", "MEMBER",
                code, null, false
        );
        memberRepository.save(member);

        // Verify code
        MemberCodeVerifyDTO verify = authService.verifyMemberCode(code);
        assertTrue(verify.isValid());
        assertEquals("Abena", verify.getFirstName());
        assertFalse(verify.isPasswordSet());

        // Register with code & set password
        MemberRegisterWithCodeDTO reg = new MemberRegisterWithCodeDTO(code, "abenaPass123", null);
        AuthResponseDTO res = authService.registerMemberWithCode(reg);
        assertNotNull(res);
        assertTrue(res.getIsPasswordSet());

        // Test logging in with newly created password
        LoginRequestDTO loginReq = new LoginRequestDTO(code, "abenaPass123");
        AuthResponseDTO loginRes = authService.login(loginReq);
        assertEquals("Abena", loginRes.getFirstName());
    }

    @Autowired
    private com.association.duesportal.service.MemberService memberService;

    @Autowired
    private com.association.duesportal.repository.AnnouncementRepository announcementRepository;

    @Test
    void testDeleteMemberWithAnnouncementsAndDependencies() {
        Member testAuthor = new Member(
                "Author", "Member", "author." + System.currentTimeMillis() + "@association.org",
                "+233 24 000 1122", "Airport Hills", "Accra", null, "Author",
                LocalDate.now(), "ACTIVE", "ADMIN", "ADM-AUTH-" + (System.currentTimeMillis() % 10000),
                PasswordUtil.hashPassword("pass123"), true
        );
        final Member savedAuthor = memberRepository.save(testAuthor);

        com.association.duesportal.model.Announcement announcement = new com.association.duesportal.model.Announcement(
                "General Meeting", "Meeting content", java.time.LocalDateTime.now(), savedAuthor, "HIGH", false
        );
        announcementRepository.save(announcement);

        // Delete the member - should safely reassign announcement and delete member without FK error!
        assertDoesNotThrow(() -> memberService.deleteMember(savedAuthor.getId()));
        assertFalse(memberRepository.existsById(savedAuthor.getId()));
    }
}
