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

    @Autowired
    private com.association.duesportal.service.RegistrationCodeService registrationCodeService;

    @Test
    void testAdminLoginWithEmail() {
        Member admin = memberRepository.findByEmailIgnoreCase("stephen.karikari@association.org").orElseGet(() -> {
            Member m = new Member(
                    "Stephen", "Karikari", "stephen.karikari@association.org", "+233 24 123 4567",
                    "14 Independence Avenue", "Accra", null, "IT Director",
                    LocalDate.now(), "ACTIVE", "ADMIN",
                    "ADM-1001", PasswordUtil.hashPassword("admin123"), true
            );
            return memberRepository.save(m);
        });

        LoginRequestDTO req = new LoginRequestDTO(admin.getEmail(), "admin123");
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
    void testMultipleAdminRegistrationAllowed() {
        // Reset admin accounts first to test founder admin vs subsequent admin
        authService.resetAdminAccount();

        // 1. Initial Founder Admin registers freely without a passkey
        String email1 = "primary.admin." + System.currentTimeMillis() + "@association.org";
        AdminRegisterRequestDTO primaryReq = new AdminRegisterRequestDTO(
                "Primary", "Admin", email1, "+233 24 111 2222",
                "admin123", "ADMIN", null
        );
        AuthResponseDTO res1 = authService.registerAdmin(primaryReq);
        assertNotNull(res1);
        assertEquals("ADMIN", res1.getRole());

        // 2. An unauthorized second person trying to register as admin WITHOUT a code fails
        String email2 = "second.admin." + System.currentTimeMillis() + "@association.org";
        AdminRegisterRequestDTO secondReqNoCode = new AdminRegisterRequestDTO(
                "Second", "Admin", email2, "+233 24 999 0000",
                "secret123", "ADMIN", null
        );
        IllegalArgumentException exNoCode = assertThrows(IllegalArgumentException.class, () -> {
            authService.registerAdmin(secondReqNoCode);
        });
        assertTrue(exNoCode.getMessage().contains("Admin Registration Code"));

        // 3. Primary admin generates an official ADMIN registration code
        var generatedList = registrationCodeService.generateCodes(new GenerateCodeRequestDTO(
                "ADM", "ADMIN", 1, "Invite Second Executive", null
        ));
        String adminPasscode = generatedList.get(0).getCode();

        // 4. Second admin registers WITH the authorized code -> succeeds!
        AdminRegisterRequestDTO secondReqWithCode = new AdminRegisterRequestDTO(
                "Second", "Admin", email2, "+233 24 999 0000",
                "secret123", "ADMIN", adminPasscode
        );
        AuthResponseDTO res2 = authService.registerAdmin(secondReqWithCode);
        assertNotNull(res2);
        assertEquals("ADMIN", res2.getRole());
        assertEquals("Second", res2.getFirstName());

        // 5. Trying to reuse the already REDEEMED code throws an error
        String email3 = "third.admin." + System.currentTimeMillis() + "@association.org";
        AdminRegisterRequestDTO thirdReqReusedCode = new AdminRegisterRequestDTO(
                "Third", "Admin", email3, "+233 24 888 7777",
                "secret123", "ADMIN", adminPasscode
        );
        IllegalArgumentException exReused = assertThrows(IllegalArgumentException.class, () -> {
            authService.registerAdmin(thirdReqReusedCode);
        });
        assertTrue(exReused.getMessage().contains("already been redeemed"));
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

    @Test
    void testGoogleLoginSuccess() {
        String googleEmail = "google.member." + System.currentTimeMillis() + "@gmail.com";
        Member member = new Member(
                "Kofi", "Google", googleEmail, "+233 24 555 6677",
                "East Legon", "Accra", "https://lh3.googleusercontent.com/a/test-photo", "Consultant",
                LocalDate.now(), "ACTIVE", "MEMBER",
                "MEM-GGL-" + (System.currentTimeMillis() % 10000),
                PasswordUtil.hashPassword("secretPass123"), true
        );
        memberRepository.save(member);

        GoogleLoginRequestDTO req = new GoogleLoginRequestDTO(
                googleEmail, "Kofi", "Google", "https://lh3.googleusercontent.com/a/test-photo", "google-uid-12345"
        );

        AuthResponseDTO res = authService.googleLogin(req);
        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("Kofi", res.getFirstName());
        assertEquals(googleEmail, res.getEmail());
    }

    @Test
    void testGoogleLoginUnregisteredThrowsNoAccountFound() {
        String unregisteredEmail = "unregistered." + System.currentTimeMillis() + "@gmail.com";
        GoogleLoginRequestDTO req = new GoogleLoginRequestDTO(
                unregisteredEmail, "New", "User", null, "google-uid-99999"
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.googleLogin(req);
        });

        assertTrue(ex.getMessage().contains("NO_ACCOUNT_FOUND"));
    }

    @Test
    void testForgotPasswordAndResetPasswordFlow() {
        String email = "reset.member." + System.currentTimeMillis() + "@association.org";
        String memberCode = "MEM-RST-" + (System.currentTimeMillis() % 10000);
        Member member = new Member(
                "Ama", "Darko", email, "+233 24 888 9900",
                "Ridge", "Cape Coast", null, "Accountant",
                LocalDate.now(), "ACTIVE", "MEMBER",
                memberCode, PasswordUtil.hashPassword("oldPassword123"), true
        );
        memberRepository.save(member);

        // 1. Request password reset using email
        ForgotPasswordRequestDTO forgotReq = new ForgotPasswordRequestDTO(email);
        java.util.Map<String, Object> forgotRes = authService.forgotPassword(forgotReq);
        assertNotNull(forgotRes);
        assertEquals(true, forgotRes.get("success"));
        assertNotNull(forgotRes.get("resetCode"));
        String resetCode = (String) forgotRes.get("resetCode");
        assertEquals(6, resetCode.length());

        // 2. Attempt reset with invalid code -> should fail
        ResetPasswordRequestDTO badResetReq = new ResetPasswordRequestDTO(email, "000000", "newSecret456");
        assertThrows(IllegalArgumentException.class, () -> {
            authService.resetPassword(badResetReq);
        });

        // 3. Reset with valid code
        ResetPasswordRequestDTO goodResetReq = new ResetPasswordRequestDTO(email, resetCode, "newSecret456");
        AuthResponseDTO resetRes = authService.resetPassword(goodResetReq);
        assertNotNull(resetRes);
        assertEquals("Ama", resetRes.getFirstName());

        // 4. Verify login succeeds with new password
        LoginRequestDTO loginReq = new LoginRequestDTO(email, "newSecret456");
        AuthResponseDTO loginRes = authService.login(loginReq);
        assertNotNull(loginRes);
        assertEquals("Ama", loginRes.getFirstName());
    }
}
