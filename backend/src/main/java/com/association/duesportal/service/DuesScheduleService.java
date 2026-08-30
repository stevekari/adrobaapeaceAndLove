package com.association.duesportal.service;

import com.association.duesportal.dto.ScheduleProgressDTO;
import com.association.duesportal.model.DuesSchedule;
import com.association.duesportal.model.PaymentRecord;
import com.association.duesportal.repository.DuesScheduleRepository;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.repository.PaymentRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DuesScheduleService {

    private final DuesScheduleRepository duesScheduleRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final MemberRepository memberRepository;

    public DuesScheduleService(DuesScheduleRepository duesScheduleRepository,
                               PaymentRecordRepository paymentRecordRepository,
                               MemberRepository memberRepository) {
        this.duesScheduleRepository = duesScheduleRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.memberRepository = memberRepository;
    }

    public List<DuesSchedule> getAllSchedules() {
        ensureDefaultSchedules();
        return duesScheduleRepository.findAllByOrderByDueDateDesc();
    }

    public List<DuesSchedule> getActiveSchedules() {
        ensureDefaultSchedules();
        return duesScheduleRepository.findByActiveOrderByDueDateDesc(true);
    }

    private void ensureDefaultSchedules() {
        if (duesScheduleRepository.count() == 0) {
            DuesSchedule monthlyLevy = new DuesSchedule(
                    "Monthly Dues Levy",
                    new java.math.BigDecimal("50.00"),
                    "Monthly",
                    java.time.LocalDate.now().plusMonths(1),
                    "Regular monthly member welfare contributions, emergency support pool, and operational fund.",
                    true
            );

            DuesSchedule annualLevy = new DuesSchedule(
                    "Annual Dues Levy",
                    new java.math.BigDecimal("200.00"),
                    "Annual",
                    java.time.LocalDate.of(java.time.LocalDate.now().getYear(), 12, 31),
                    "Mandatory annual association membership levy supporting administration and governance.",
                    true
            );

            DuesSchedule donationLevy = new DuesSchedule(
                    "Donation Levy",
                    new java.math.BigDecimal("100.00"),
                    "One-Time",
                    java.time.LocalDate.of(java.time.LocalDate.now().getYear(), 12, 31),
                    "Voluntary community support, project developments, emergency funds, and member donations.",
                    true
            );

            duesScheduleRepository.saveAll(java.util.Arrays.asList(monthlyLevy, annualLevy, donationLevy));
        }
    }

    public Optional<DuesSchedule> getScheduleById(Long id) {
        return duesScheduleRepository.findById(id);
    }

    public DuesSchedule createSchedule(DuesSchedule schedule) {
        return duesScheduleRepository.save(schedule);
    }

    public DuesSchedule updateSchedule(Long id, DuesSchedule scheduleDetails) {
        DuesSchedule schedule = duesScheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dues schedule not found with id: " + id));

        schedule.setTitle(scheduleDetails.getTitle());
        schedule.setAmount(scheduleDetails.getAmount());
        schedule.setFrequency(scheduleDetails.getFrequency());
        schedule.setDueDate(scheduleDetails.getDueDate());
        schedule.setDescription(scheduleDetails.getDescription());
        schedule.setActive(scheduleDetails.isActive());

        return duesScheduleRepository.save(schedule);
    }

    public void deleteSchedule(Long id) {
        if (!duesScheduleRepository.existsById(id)) {
            throw new IllegalArgumentException("Dues schedule not found with id: " + id);
        }
        duesScheduleRepository.deleteById(id);
    }

    public List<ScheduleProgressDTO> getScheduleProgressList() {
        long totalMembers = memberRepository.countByStatus("ACTIVE");
        if (totalMembers == 0) {
            totalMembers = memberRepository.count();
        }

        final long memberCount = totalMembers;

        return duesScheduleRepository.findAllByOrderByDueDateDesc().stream().map(schedule -> {
            ScheduleProgressDTO dto = new ScheduleProgressDTO();
            dto.setId(schedule.getId());
            dto.setTitle(schedule.getTitle());
            dto.setAmountPerMember(schedule.getAmount());
            dto.setFrequency(schedule.getFrequency());
            dto.setDueDate(schedule.getDueDate());
            dto.setActive(schedule.isActive());

            BigDecimal collected = paymentRecordRepository.calculateTotalPaidForSchedule(schedule.getId());
            if (collected == null) collected = BigDecimal.ZERO;
            dto.setTotalCollected(collected);

            BigDecimal target = schedule.getAmount().multiply(BigDecimal.valueOf(Math.max(1, memberCount)));
            dto.setTargetAmount(target);

            List<PaymentRecord> payments = paymentRecordRepository.findByScheduleIdOrderByPaymentDateDesc(schedule.getId());
            long paidCount = payments.stream()
                    .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                    .map(p -> p.getMember().getId())
                    .distinct()
                    .count();
            dto.setPaidMembersCount(paidCount);
            dto.setTotalMembersCount(memberCount);

            double pct = target.compareTo(BigDecimal.ZERO) > 0
                    ? collected.divide(target, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                    : 0.0;
            dto.setPercentage(Math.min(100.0, Math.round(pct * 10.0) / 10.0));

            return dto;
        }).collect(Collectors.toList());
    }
}

