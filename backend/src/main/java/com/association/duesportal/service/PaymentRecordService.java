package com.association.duesportal.service;

import com.association.duesportal.dto.PaymentRequestDTO;
import com.association.duesportal.model.DuesSchedule;
import com.association.duesportal.model.Member;
import com.association.duesportal.model.Notification;
import com.association.duesportal.model.PaymentRecord;
import com.association.duesportal.repository.DuesScheduleRepository;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.repository.NotificationRepository;
import com.association.duesportal.repository.PaymentRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class PaymentRecordService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final MemberRepository memberRepository;
    private final DuesScheduleRepository duesScheduleRepository;
    private final NotificationRepository notificationRepository;

    public PaymentRecordService(PaymentRecordRepository paymentRecordRepository,
                                MemberRepository memberRepository,
                                DuesScheduleRepository duesScheduleRepository,
                                NotificationRepository notificationRepository) {
        this.paymentRecordRepository = paymentRecordRepository;
        this.memberRepository = memberRepository;
        this.duesScheduleRepository = duesScheduleRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<PaymentRecord> getAllPayments() {
        return paymentRecordRepository.findAllByOrderByPaymentDateDesc();
    }

    public List<PaymentRecord> getRecentPayments() {
        return paymentRecordRepository.findTop10ByOrderByPaymentDateDesc();
    }

    public Optional<PaymentRecord> getPaymentById(Long id) {
        return paymentRecordRepository.findById(id);
    }

    public Optional<PaymentRecord> getPaymentByReceiptNumber(String receiptNumber) {
        return paymentRecordRepository.findByReceiptNumber(receiptNumber);
    }

    public List<PaymentRecord> getPaymentsByMember(Long memberId) {
        return paymentRecordRepository.findByMemberIdOrderByPaymentDateDesc(memberId);
    }

    public List<PaymentRecord> getPaymentsBySchedule(Long scheduleId) {
        return paymentRecordRepository.findByScheduleIdOrderByPaymentDateDesc(scheduleId);
    }

    public List<PaymentRecord> searchPayments(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return paymentRecordRepository.findAllByOrderByPaymentDateDesc();
        }
        return paymentRecordRepository.searchPayments(keyword.trim());
    }

    public PaymentRecord recordPayment(PaymentRequestDTO request) {
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + request.getMemberId()));

        DuesSchedule schedule = null;
        if (request.getScheduleId() != null) {
            schedule = duesScheduleRepository.findById(request.getScheduleId()).orElse(null);
        }

        if (schedule == null && request.getDuesPurpose() != null && !request.getDuesPurpose().trim().isEmpty()) {
            String title = request.getDuesPurpose().trim();
            schedule = duesScheduleRepository.findAll().stream()
                    .filter(s -> s.getTitle().equalsIgnoreCase(title))
                    .findFirst()
                    .orElse(null);
        }

        if (schedule == null) {
            String title = (request.getDuesPurpose() != null && !request.getDuesPurpose().trim().isEmpty())
                    ? request.getDuesPurpose().trim()
                    : "Monthly Dues Levy";

            String frequency = title.toLowerCase().contains("annual") ? "Annual"
                    : title.toLowerCase().contains("donation") ? "One-Time"
                    : "Monthly";

            schedule = duesScheduleRepository.save(new DuesSchedule(
                    title,
                    request.getAmountPaid() != null ? request.getAmountPaid() : new java.math.BigDecimal("50.00"),
                    frequency,
                    java.time.LocalDate.now().plusMonths(1),
                    "Standard contribution levy: " + title,
                    true
            ));
        }

        String receiptNumber = generateUniqueReceiptNumber();
        LocalDateTime paymentTime = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDateTime.now();

        PaymentRecord record = new PaymentRecord(
                member,
                schedule,
                request.getAmountPaid(),
                paymentTime,
                request.getPaymentMethod(),
                receiptNumber,
                request.getStatus() != null ? request.getStatus() : "PAID",
                request.getNotes()
        );

        PaymentRecord saved = paymentRecordRepository.save(record);

        // Generate Real Notification
        if ("PENDING".equalsIgnoreCase(saved.getStatus())) {
            Notification notification = new Notification(
                    null,
                    "⏳ New Dues Payment Awaiting Admin Confirmation: " + receiptNumber,
                    member.getFullName() + " submitted GHS " + request.getAmountPaid() + " for " + schedule.getTitle() + " (" + request.getPaymentMethod() + "). Verification Code: " + receiptNumber,
                    "PAYMENT",
                    "history"
            );
            notificationRepository.save(notification);
        } else {
            Notification notification = new Notification(
                    null,
                    "💳 Dues Payment Verified: " + receiptNumber,
                    member.getFullName() + " paid GHS " + request.getAmountPaid() + " for " + schedule.getTitle() + " (" + request.getPaymentMethod() + ")",
                    "PAYMENT",
                    "history"
            );
            notificationRepository.save(notification);
        }

        return saved;
    }

    public PaymentRecord updatePaymentStatus(Long id, String status) {
        PaymentRecord record = paymentRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found with id: " + id));
        record.setStatus(status);
        PaymentRecord saved = paymentRecordRepository.save(record);

        if ("PAID".equalsIgnoreCase(status)) {
            Notification notification = new Notification(
                    null,
                    "✅ Dues Payment Confirmed & Approved: " + record.getReceiptNumber(),
                    "Administrator confirmed payment of GHS " + record.getAmountPaid() + " from " + record.getMember().getFullName() + " for " + record.getSchedule().getTitle() + ". Verified Receipt generated!",
                    "PAYMENT",
                    "history"
            );
            notificationRepository.save(notification);
        }

        return saved;
    }

    public void deletePayment(Long id) {
        if (!paymentRecordRepository.existsById(id)) {
            throw new IllegalArgumentException("Payment record not found with id: " + id);
        }
        paymentRecordRepository.deleteById(id);
    }

    private String generateUniqueReceiptNumber() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");
        String datePrefix = LocalDateTime.now().format(dtf);
        String receiptNumber;
        do {
            int randomSuffix = ThreadLocalRandom.current().nextInt(1000, 9999);
            receiptNumber = "REC-" + datePrefix + "-" + randomSuffix;
        } while (paymentRecordRepository.findByReceiptNumber(receiptNumber).isPresent());

        return receiptNumber;
    }
}
