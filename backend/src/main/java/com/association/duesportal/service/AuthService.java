package com.association.duesportal.service;

import com.association.duesportal.dto.*;
import com.association.duesportal.model.Member;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.util.CodeGeneratorUtil;
import com.association.duesportal.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final MemberRepository memberRepository;

    public AuthService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        if (request.getIdentifier() == null || request.getIdentifier().trim().isEmpty()) {
            throw new IllegalArgumentException("Email or Member Code is required.");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        String identifier = request.getIdentifier().trim();
        Member member = memberRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Invalid login credentials. Please check your email or member code."));

        if (Boolean.FALSE.equals(member.getIsPasswordSet()) || member.getPassword() == null) {
            throw new IllegalArgumentException("Account password has not been created yet. Please activate your account using your Member Code: " + member.getMemberCode());
        }

        if (!PasswordUtil.verifyPassword(request.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("Invalid login credentials. Please check your password.");
        }

        if ("SUSPENDED".equalsIgnoreCase(member.getStatus())) {
            throw new IllegalArgumentException("This account is currently suspended. Please contact the association secretariat.");
        }

        String token = "sess-" + UUID.randomUUID().toString();
        return new AuthResponseDTO(token, member, "Login successful. Welcome back, " + member.getFirstName() + "!");
    }

    public AuthResponseDTO googleLogin(GoogleLoginRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Google account email is required.");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        Member member = memberRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("NO_ACCOUNT_FOUND: No registered member found with Google email (" + email + "). Please activate your account with your Member Registration Code."));

        if ("SUSPENDED".equalsIgnoreCase(member.getStatus())) {
            throw new IllegalArgumentException("This account is currently suspended. Please contact the association secretariat.");
        }

        // Auto-fill profile photo if member doesn't have one
        if ((member.getProfilePhoto() == null || member.getProfilePhoto().trim().isEmpty()) 
                && request.getPhotoUrl() != null && !request.getPhotoUrl().trim().isEmpty()) {
            member.setProfilePhoto(request.getPhotoUrl().trim());
            memberRepository.save(member);
        }

        String token = "sess-" + UUID.randomUUID().toString();
        return new AuthResponseDTO(token, member, "Signed in successfully with Google. Welcome back, " + member.getFirstName() + "!");
    }

    public boolean isAdminRegistered() {
        return memberRepository.countByRole("ADMIN") > 0;
    }

    public AuthResponseDTO registerAdmin(AdminRegisterRequestDTO request) {
        if (memberRepository.countByRole("ADMIN") > 0) {
            throw new IllegalArgumentException("An Admin account is already registered and active for Peace & Love, Adroabaa. Only one Admin is permitted. Please contact the administrator for access.");
        }

        if (memberRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new IllegalArgumentException("A member or admin is already registered with email: " + request.getEmail().trim());
        }

        String role = "ADMIN";
        String prefix = "ADM";
        String memberCode = generateUniqueCode(prefix);
        String hashedPassword = PasswordUtil.hashPassword(request.getPassword());

        Member admin = new Member();
        admin.setFirstName(request.getFirstName().trim());
        admin.setLastName(request.getLastName().trim());
        admin.setEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));
        admin.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        admin.setRole(role);
        admin.setStatus("ACTIVE");
        admin.setJoinDate(LocalDate.now());
        admin.setMemberCode(memberCode);
        admin.setPassword(hashedPassword);
        admin.setIsPasswordSet(true);

        Member saved = memberRepository.save(admin);
        String token = "sess-" + UUID.randomUUID().toString();
        return new AuthResponseDTO(token, saved, "Admin registration successful! Member Code: " + memberCode);
    }

    public MemberCodeVerifyDTO verifyMemberCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return MemberCodeVerifyDTO.invalid("Please enter your Member Registration Code.");
        }

        String cleanCode = code.trim().toUpperCase(Locale.ROOT);
        return memberRepository.findByMemberCodeIgnoreCase(cleanCode)
                .map(m -> {
                    if (Boolean.TRUE.equals(m.getIsPasswordSet())) {
                        return new MemberCodeVerifyDTO(
                                false,
                                m.getId(),
                                m.getMemberCode(),
                                m.getFirstName(),
                                m.getLastName(),
                                m.getEmail(),
                                m.getPhone(),
                                m.getRole(),
                                true,
                                "This registration code has already been redeemed and activated for " + m.getFullName() + ". Each code is strictly single-use and cannot be used for another person."
                        );
                    }
                    return new MemberCodeVerifyDTO(
                            true,
                            m.getId(),
                            m.getMemberCode(),
                            m.getFirstName(),
                            m.getLastName(),
                            m.getEmail(),
                            m.getPhone(),
                            m.getRole(),
                            false,
                            "Member verified! Please create your private password below to activate your account."
                    );
                })
                .orElseGet(() -> MemberCodeVerifyDTO.invalid("No member account found with code \"" + cleanCode + "\". Please check the code or contact your association administrator."));
    }

    public AuthResponseDTO registerMemberWithCode(MemberRegisterWithCodeDTO request) {
        if (request.getMemberCode() == null || request.getMemberCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Member code is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        String cleanCode = request.getMemberCode().trim().toUpperCase(Locale.ROOT);
        Member member = memberRepository.findByMemberCodeIgnoreCase(cleanCode)
                .orElseThrow(() -> new IllegalArgumentException("No member record found for code: " + cleanCode));

        if (Boolean.TRUE.equals(member.getIsPasswordSet())) {
            throw new IllegalArgumentException("This registration code has already been used and activated by " + member.getFullName() + ". Each code is strictly unique and cannot be reused for a different person.");
        }

        String hashedPassword = PasswordUtil.hashPassword(request.getPassword());
        member.setPassword(hashedPassword);
        member.setIsPasswordSet(true);

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            member.setPhone(request.getPhone().trim());
        }

        Member updated = memberRepository.save(member);
        String token = "sess-" + UUID.randomUUID().toString();
        return new AuthResponseDTO(token, updated, "Registration complete! Password created successfully. Welcome to the portal, " + updated.getFirstName() + "!");
    }

    public java.util.Map<String, Object> forgotPassword(ForgotPasswordRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address or Member Code is required.");
        }

        String identifier = request.getEmail().trim();
        Member member = memberRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new IllegalArgumentException("No registered account found with email or member code: " + identifier));

        if ("SUSPENDED".equalsIgnoreCase(member.getStatus())) {
            throw new IllegalArgumentException("This account is currently suspended. Please contact the association secretariat.");
        }

        // Generate a secure 6-digit numeric reset OTP code
        String resetCode = String.format("%06d", (int) (100000 + Math.random() * 900000));
        member.setResetToken(resetCode);
        member.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        memberRepository.save(member);

        String email = member.getEmail();
        String maskedEmail = maskEmail(email);

        System.out.println("====================================================");
        System.out.println("📧 [SIMULATED EMAIL DISPATCH] Password Reset Code");
        System.out.println("To: " + email + " (" + member.getFullName() + ")");
        System.out.println("Reset OTP Code: " + resetCode);
        System.out.println("Valid For: 15 minutes");
        System.out.println("====================================================");

        return java.util.Map.of(
                "success", true,
                "message", "A 6-digit password reset code has been sent to " + maskedEmail + ". It expires in 15 minutes.",
                "email", member.getEmail(),
                "maskedEmail", maskedEmail,
                "memberName", member.getFullName(),
                "resetCode", resetCode
        );
    }

    public AuthResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address or Member Code is required.");
        }
        if (request.getResetCode() == null || request.getResetCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Reset code is required.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        String identifier = request.getEmail().trim();
        Member member = memberRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new IllegalArgumentException("No account found for: " + identifier));

        String inputCode = request.getResetCode().trim();
        if (member.getResetToken() == null || !member.getResetToken().equalsIgnoreCase(inputCode)) {
            throw new IllegalArgumentException("Invalid password reset code. Please check the code or request a new one.");
        }

        if (member.getResetTokenExpiry() == null || member.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("This password reset code has expired. Please request a new code.");
        }

        String hashedPassword = PasswordUtil.hashPassword(request.getNewPassword());
        member.setPassword(hashedPassword);
        member.setIsPasswordSet(true);
        member.setResetToken(null);
        member.setResetTokenExpiry(null);

        Member saved = memberRepository.save(member);
        String token = "sess-" + UUID.randomUUID().toString();
        return new AuthResponseDTO(token, saved, "Password has been successfully reset! Welcome back, " + saved.getFirstName() + ".");
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email != null ? email : "";
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name + "***@" + domain;
        }
        return name.substring(0, 2) + "***" + name.substring(name.length() - 1) + "@" + domain;
    }

    public String generateUniqueCode(String prefix) {
        String code;
        int attempts = 0;
        do {
            code = CodeGeneratorUtil.generateSpecialCode(prefix);
            attempts++;
            if (attempts > 50) {
                code = prefix + "-" + java.time.Year.now().getValue() + "-" + (System.currentTimeMillis() % 100000);
                break;
            }
        } while (memberRepository.existsByMemberCodeIgnoreCase(code));
        return code;
    }
}
