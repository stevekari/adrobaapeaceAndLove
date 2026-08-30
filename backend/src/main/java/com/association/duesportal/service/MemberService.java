package com.association.duesportal.service;

import com.association.duesportal.dto.MemberDuesSummaryDTO;
import com.association.duesportal.model.Announcement;
import com.association.duesportal.model.Member;
import com.association.duesportal.model.PaymentRecord;
import com.association.duesportal.repository.*;
import com.association.duesportal.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final DuesScheduleRepository duesScheduleRepository;
    private final RegistrationCodeRepository registrationCodeRepository;
    private final AnnouncementRepository announcementRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationRepository notificationRepository;
    private final Random random = new Random();

    public MemberService(MemberRepository memberRepository,
                          PaymentRecordRepository paymentRecordRepository,
                          DuesScheduleRepository duesScheduleRepository,
                          RegistrationCodeRepository registrationCodeRepository,
                          AnnouncementRepository announcementRepository,
                          ChatMessageRepository chatMessageRepository,
                          NotificationRepository notificationRepository) {
        this.memberRepository = memberRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.duesScheduleRepository = duesScheduleRepository;
        this.registrationCodeRepository = registrationCodeRepository;
        this.announcementRepository = announcementRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }

    public Optional<Member> getMemberByCode(String code) {
        return memberRepository.findByMemberCodeIgnoreCase(code);
    }

    public Member createMember(Member member) {
        if (memberRepository.existsByEmailIgnoreCase(member.getEmail())) {
            throw new IllegalArgumentException("A member with email " + member.getEmail() + " already exists.");
        }

        if (member.getMemberCode() == null || member.getMemberCode().trim().isEmpty()) {
            String rolePrefix = "ADMIN".equalsIgnoreCase(member.getRole()) ? "ADM" :
                                ("TREASURER".equalsIgnoreCase(member.getRole()) ? "TRS" : "MEM");
            member.setMemberCode(generateUniqueMemberCode(rolePrefix));
        }

        if (member.getPassword() != null && !member.getPassword().trim().isEmpty()) {
            member.setPassword(PasswordUtil.hashPassword(member.getPassword()));
            member.setIsPasswordSet(true);
        } else {
            member.setIsPasswordSet(false);
        }

        return memberRepository.save(member);
    }

    public Member updateMember(Long id, Member memberDetails) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + id));

        if (!member.getEmail().equalsIgnoreCase(memberDetails.getEmail()) &&
                memberRepository.existsByEmailIgnoreCase(memberDetails.getEmail())) {
            throw new IllegalArgumentException("Email " + memberDetails.getEmail() + " is already in use.");
        }

        member.setFirstName(memberDetails.getFirstName());
        member.setLastName(memberDetails.getLastName());
        member.setEmail(memberDetails.getEmail());
        member.setPhone(memberDetails.getPhone());
        member.setPlaceOfLiving(memberDetails.getPlaceOfLiving());
        member.setCity(memberDetails.getCity());
        member.setOccupation(memberDetails.getOccupation());
        if (memberDetails.getProfilePhoto() != null) {
            member.setProfilePhoto(memberDetails.getProfilePhoto());
        }
        member.setRole(memberDetails.getRole());
        member.setStatus(memberDetails.getStatus());
        if (memberDetails.getJoinDate() != null) {
            member.setJoinDate(memberDetails.getJoinDate());
        }
        if (memberDetails.getMemberCode() != null && !memberDetails.getMemberCode().trim().isEmpty()) {
            member.setMemberCode(memberDetails.getMemberCode().trim());
        }
        if (memberDetails.getPassword() != null && !memberDetails.getPassword().trim().isEmpty()) {
            member.setPassword(PasswordUtil.hashPassword(memberDetails.getPassword()));
            member.setIsPasswordSet(true);
        }

        return memberRepository.save(member);
    }

    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + id));

        // 1. Remove payments for this member
        paymentRecordRepository.deleteByMemberId(id);

        // 2. Remove registration codes referencing this member
        registrationCodeRepository.deleteByPreAssignedMemberId(id);
        registrationCodeRepository.deleteByRedeemedById(id);

        // 3. Remove chat messages sent by this member
        chatMessageRepository.deleteBySenderId(id);

        // 4. Remove notifications for this member
        notificationRepository.deleteByRecipientId(id);

        // 5. Reassign announcements created by this member to an active Admin (or remove author)
        Member fallbackAdmin = memberRepository.findAll().stream()
                .filter(m -> "ADMIN".equalsIgnoreCase(m.getRole()) && !m.getId().equals(id))
                .findFirst()
                .orElse(null);

        List<Announcement> announcements = announcementRepository.findAll();
        for (Announcement a : announcements) {
            if (a.getAuthor() != null && a.getAuthor().getId().equals(id)) {
                if (fallbackAdmin != null) {
                    a.setAuthor(fallbackAdmin);
                    announcementRepository.save(a);
                } else {
                    announcementRepository.delete(a);
                }
            }
        }

        // 6. Delete member
        memberRepository.delete(member);
    }

    public List<Member> cleanSlate(Long preserveAdminId) {
        // 1. Delete all payment records
        paymentRecordRepository.deleteAll();

        // 2. Delete all registration codes
        registrationCodeRepository.deleteAll();

        // 3. Delete all chat messages
        chatMessageRepository.deleteAll();

        // 4. Delete all notifications
        notificationRepository.deleteAll();

        // 5. Find the active admin to preserve
        Member admin = null;
        if (preserveAdminId != null) {
            admin = memberRepository.findById(preserveAdminId).orElse(null);
        }
        if (admin == null) {
            admin = memberRepository.findAll().stream()
                    .filter(m -> "ADMIN".equalsIgnoreCase(m.getRole()))
                    .findFirst()
                    .orElse(null);
        }

        // 6. Reassign announcements to this admin or delete them
        if (admin != null) {
            List<Announcement> announcements = announcementRepository.findAll();
            for (Announcement a : announcements) {
                a.setAuthor(admin);
                announcementRepository.save(a);
            }
        } else {
            announcementRepository.deleteAll();
        }

        // 7. Delete all other members
        List<Member> all = memberRepository.findAll();
        for (Member m : all) {
            if (admin != null && m.getId().equals(admin.getId())) {
                continue; // Keep the active admin
            }
            memberRepository.delete(m);
        }
        return memberRepository.findAll();
    }

    public List<Member> searchMembers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return memberRepository.findAll();
        }
        return memberRepository.searchMembers(query.trim());
    }

    public MemberDuesSummaryDTO getMemberSummary(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + id));

        List<PaymentRecord> payments = paymentRecordRepository.findByMemberIdOrderByPaymentDateDesc(id);
        BigDecimal totalPaid = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .map(PaymentRecord::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String duesStatus = totalPaid.compareTo(BigDecimal.ZERO) > 0 ? "UP_TO_DATE" : "PENDING_DUES";

        return new MemberDuesSummaryDTO(
                member,
                totalPaid,
                payments.size(),
                duesStatus,
                payments
        );
    }

    public List<MemberDuesSummaryDTO> getAllMemberSummaries() {
        return memberRepository.findAll().stream()
                .map(m -> getMemberSummary(m.getId()))
                .collect(Collectors.toList());
    }

    private String generateUniqueMemberCode(String prefix) {
        String code;
        int attempts = 0;
        do {
            code = com.association.duesportal.util.CodeGeneratorUtil.generateSpecialCode(prefix);
            attempts++;
            if (attempts > 50) {
                code = prefix + "-" + java.time.Year.now().getValue() + "-" + (System.currentTimeMillis() % 100000);
                break;
            }
        } while (memberRepository.findByMemberCodeIgnoreCase(code).isPresent());
        return code;
    }
}
