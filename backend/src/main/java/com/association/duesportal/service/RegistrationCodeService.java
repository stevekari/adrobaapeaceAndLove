package com.association.duesportal.service;

import com.association.duesportal.dto.AuthResponseDTO;
import com.association.duesportal.dto.GenerateCodeRequestDTO;
import com.association.duesportal.dto.RedeemCodeRequestDTO;
import com.association.duesportal.dto.RegistrationCodeDTO;
import com.association.duesportal.model.Member;
import com.association.duesportal.model.Notification;
import com.association.duesportal.model.RegistrationCode;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.repository.NotificationRepository;
import com.association.duesportal.repository.RegistrationCodeRepository;
import com.association.duesportal.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RegistrationCodeService {

    private final RegistrationCodeRepository registrationCodeRepository;
    private final MemberRepository memberRepository;
    private final NotificationRepository notificationRepository;
    private final Random random = new Random();

    public RegistrationCodeService(RegistrationCodeRepository registrationCodeRepository,
                                   MemberRepository memberRepository,
                                   NotificationRepository notificationRepository) {
        this.registrationCodeRepository = registrationCodeRepository;
        this.memberRepository = memberRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<RegistrationCodeDTO> getAllCodes() {
        return registrationCodeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(RegistrationCodeDTO::new)
                .collect(Collectors.toList());
    }

    public List<RegistrationCodeDTO> getCodesByStatus(String status) {
        if (status == null || "ALL".equalsIgnoreCase(status)) {
            return getAllCodes();
        }
        return registrationCodeRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase()).stream()
                .map(RegistrationCodeDTO::new)
                .collect(Collectors.toList());
    }

    public List<RegistrationCodeDTO> generateCodes(GenerateCodeRequestDTO request) {
        int count = request.getQuantity() != null ? Math.min(Math.max(1, request.getQuantity()), 50) : 1;
        String prefix = (request.getPrefix() != null && !request.getPrefix().trim().isEmpty())
                ? request.getPrefix().trim().toUpperCase()
                : "MEM";
        String role = (request.getRole() != null && !request.getRole().trim().isEmpty())
                ? request.getRole().trim().toUpperCase()
                : "MEMBER";

        Member preAssignedMember = null;
        if (request.getPreAssignedMemberId() != null) {
            preAssignedMember = memberRepository.findById(request.getPreAssignedMemberId()).orElse(null);
        }

        List<RegistrationCode> createdList = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String codeStr = generateUniqueCode(prefix);
            RegistrationCode rc = new RegistrationCode(
                    codeStr,
                    role,
                    request.getNotes(),
                    preAssignedMember
            );
            createdList.add(registrationCodeRepository.save(rc));

            // If pre-assigned to a member without a memberCode, sync memberCode
            if (preAssignedMember != null && (preAssignedMember.getMemberCode() == null || preAssignedMember.getMemberCode().isEmpty())) {
                preAssignedMember.setMemberCode(codeStr);
                memberRepository.save(preAssignedMember);
            }
        }

        // Send Admin Notification
        Notification notification = new Notification(
                null,
                "🔑 Association Registration Codes Generated",
                "Generated " + count + " official registration code(s) [" + prefix + "] for association member onboarding.",
                "MEMBER",
                "members"
        );
        notificationRepository.save(notification);

        return createdList.stream().map(RegistrationCodeDTO::new).collect(Collectors.toList());
    }

    public RegistrationCodeDTO verifyCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Registration code is required.");
        }
        String cleanCode = code.trim().toUpperCase();

        // 1. Check in RegistrationCodeRepository
        Optional<RegistrationCode> optCode = registrationCodeRepository.findByCodeIgnoreCase(cleanCode);
        if (optCode.isPresent()) {
            RegistrationCode rc = optCode.get();
            if ("REVOKED".equalsIgnoreCase(rc.getStatus())) {
                throw new IllegalArgumentException("This registration code has been revoked by association leadership. Please contact your website admin for a valid code.");
            }
            if ("REDEEMED".equalsIgnoreCase(rc.getStatus())) {
                String redeemedName = rc.getRedeemedBy() != null ? rc.getRedeemedBy().getFullName() : (rc.getPreAssignedMember() != null ? rc.getPreAssignedMember().getFullName() : "another member");
                throw new IllegalArgumentException("This registration code (" + cleanCode + ") has already been used and activated by " + redeemedName + ". Each code is strictly single-use and cannot be used again by a different person. Please contact your website admin for a new registration code.");
            }
            return new RegistrationCodeDTO(rc);
        }

        // 2. Check in MemberRepository (pre-seeded or directory member with memberCode)
        Optional<Member> optMember = memberRepository.findByMemberCodeIgnoreCase(cleanCode);
        if (optMember.isPresent()) {
            Member member = optMember.get();
            if (Boolean.TRUE.equals(member.getIsPasswordSet())) {
                throw new IllegalArgumentException("This member code (" + cleanCode + ") has already been registered and activated by " + member.getFullName() + ". It cannot be used again by anyone else. If this is your account, please sign in directly; otherwise, please contact your website admin for assistance.");
            }
            // Create corresponding RegistrationCode record for tracking
            RegistrationCode rc = new RegistrationCode(cleanCode, member.getRole(), "Member Directory Pre-Enrolled", member);
            RegistrationCode saved = registrationCodeRepository.save(rc);
            return new RegistrationCodeDTO(saved);
        }

        throw new IllegalArgumentException("Invalid registration code (" + cleanCode + "). Please check your code or contact your website admin.");
    }

    public AuthResponseDTO redeemCode(RedeemCodeRequestDTO request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Association registration code is required.");
        }
        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        String cleanCode = request.getCode().trim().toUpperCase();
        RegistrationCode regCode = registrationCodeRepository.findByCodeIgnoreCase(cleanCode)
                .orElseGet(() -> {
                    // Check if member exists in MemberRepository
                    Member member = memberRepository.findByMemberCodeIgnoreCase(cleanCode)
                            .orElseThrow(() -> new IllegalArgumentException("Invalid registration code (" + cleanCode + "). Please contact your website admin."));
                    return registrationCodeRepository.save(new RegistrationCode(cleanCode, member.getRole(), "Member Directory Enrolled", member));
                });

        if ("REDEEMED".equalsIgnoreCase(regCode.getStatus())) {
            String redeemedName = regCode.getRedeemedBy() != null ? regCode.getRedeemedBy().getFullName() : (regCode.getPreAssignedMember() != null ? regCode.getPreAssignedMember().getFullName() : "another person");
            throw new IllegalArgumentException("This registration code (" + cleanCode + ") has already been used and registered by " + redeemedName + ". It cannot be used again by a different person. Please contact your website admin for a new registration code.");
        }
        if ("REVOKED".equalsIgnoreCase(regCode.getStatus())) {
            throw new IllegalArgumentException("This registration code has been revoked by association leadership. Please contact your website admin.");
        }

        Member memberToActivate;

        if (regCode.getPreAssignedMember() != null) {
            // Activating pre-enrolled member
            memberToActivate = regCode.getPreAssignedMember();
            if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
                memberToActivate.setPhone(request.getPhone().trim());
            }
            if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
                memberToActivate.setCity(request.getCity().trim());
            }
            if (request.getPlaceOfLiving() != null && !request.getPlaceOfLiving().trim().isEmpty()) {
                memberToActivate.setPlaceOfLiving(request.getPlaceOfLiving().trim());
            }
            if (request.getOccupation() != null && !request.getOccupation().trim().isEmpty()) {
                memberToActivate.setOccupation(request.getOccupation().trim());
            }
        } else {
            // Registering via open association code
            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty() ||
                request.getLastName() == null || request.getLastName().trim().isEmpty()) {
                throw new IllegalArgumentException("First name and last name are required.");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email address is required.");
            }
            if (memberRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
                throw new IllegalArgumentException("An account with email " + request.getEmail() + " already exists.");
            }

            memberToActivate = new Member();
            memberToActivate.setFirstName(request.getFirstName().trim());
            memberToActivate.setLastName(request.getLastName().trim());
            memberToActivate.setEmail(request.getEmail().trim());
            memberToActivate.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
            memberToActivate.setPlaceOfLiving(request.getPlaceOfLiving() != null ? request.getPlaceOfLiving().trim() : "");
            memberToActivate.setCity(request.getCity() != null ? request.getCity().trim() : "");
            memberToActivate.setOccupation(request.getOccupation() != null ? request.getOccupation().trim() : "");
            memberToActivate.setMemberCode(cleanCode);
            memberToActivate.setRole(regCode.getRole() != null ? regCode.getRole() : "MEMBER");
            memberToActivate.setStatus("ACTIVE");
            memberToActivate.setJoinDate(LocalDate.now());
        }

        memberToActivate.setPassword(PasswordUtil.hashPassword(request.getPassword()));
        memberToActivate.setIsPasswordSet(true);
        Member savedMember = memberRepository.save(memberToActivate);

        // Mark code as REDEEMED
        regCode.setStatus("REDEEMED");
        regCode.setRedeemedBy(savedMember);
        regCode.setRedeemedAt(LocalDateTime.now());
        registrationCodeRepository.save(regCode);

        // Broadcast notification to association leadership
        Notification notification = new Notification(
                null,
                "🎉 New Member Joined: " + savedMember.getFullName(),
                savedMember.getFullName() + " (" + savedMember.getCity() + ") completed registration using code " + cleanCode + ".",
                "MEMBER",
                "members"
        );
        notificationRepository.save(notification);

        String token = "sess-" + UUID.randomUUID();
        return new AuthResponseDTO(token, savedMember, "Account successfully activated with Association Registration Code!");
    }

    public void revokeCode(Long id) {
        RegistrationCode rc = registrationCodeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Registration code not found: " + id));
        if ("REDEEMED".equalsIgnoreCase(rc.getStatus())) {
            throw new IllegalArgumentException("Cannot revoke an already redeemed code.");
        }
        rc.setStatus("REVOKED");
        registrationCodeRepository.save(rc);
    }

    private String generateUniqueCode(String prefix) {
        String code;
        int attempts = 0;
        do {
            code = com.association.duesportal.util.CodeGeneratorUtil.generateSpecialCode(prefix);
            attempts++;
            if (attempts > 50) {
                code = prefix + "-" + java.time.Year.now().getValue() + "-" + (System.currentTimeMillis() % 100000);
                break;
            }
        } while (registrationCodeRepository.existsByCodeIgnoreCase(code) || memberRepository.existsByMemberCodeIgnoreCase(code));
        return code;
    }
}

