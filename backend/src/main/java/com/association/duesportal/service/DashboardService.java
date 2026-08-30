package com.association.duesportal.service;

import com.association.duesportal.dto.DashboardStatsDTO;
import com.association.duesportal.dto.ScheduleProgressDTO;
import com.association.duesportal.model.Announcement;
import com.association.duesportal.model.PaymentRecord;
import com.association.duesportal.repository.AnnouncementRepository;
import com.association.duesportal.repository.DuesScheduleRepository;
import com.association.duesportal.repository.MemberRepository;
import com.association.duesportal.repository.PaymentRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final MemberRepository memberRepository;
    private final DuesScheduleRepository duesScheduleRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final AnnouncementRepository announcementRepository;
    private final DuesScheduleService duesScheduleService;

    public DashboardService(MemberRepository memberRepository,
                            DuesScheduleRepository duesScheduleRepository,
                            PaymentRecordRepository paymentRecordRepository,
                            AnnouncementRepository announcementRepository,
                            DuesScheduleService duesScheduleService) {
        this.memberRepository = memberRepository;
        this.duesScheduleRepository = duesScheduleRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.announcementRepository = announcementRepository;
        this.duesScheduleService = duesScheduleService;
    }

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        BigDecimal totalCollected = paymentRecordRepository.calculateTotalPaid();
        stats.setTotalCollected(totalCollected != null ? totalCollected : BigDecimal.ZERO);

        long activeMembers = memberRepository.countByStatus("ACTIVE");
        long totalMembers = memberRepository.count();
        stats.setActiveMembersCount(activeMembers > 0 ? activeMembers : totalMembers);
        stats.setTotalMembersCount(totalMembers);

        stats.setPendingPaymentsCount(paymentRecordRepository.countByStatus("PENDING"));
        stats.setTotalSchedulesCount(duesScheduleRepository.count());

        List<ScheduleProgressDTO> schedules = duesScheduleService.getScheduleProgressList();
        stats.setSchedules(schedules);

        // Overall collection rate calculation
        BigDecimal totalTarget = schedules.stream()
                .filter(ScheduleProgressDTO::isActive)
                .map(ScheduleProgressDTO::getTargetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalTarget.compareTo(BigDecimal.ZERO) > 0) {
            double rate = stats.getTotalCollected().divide(totalTarget, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            stats.setCollectionRate(Math.min(100.0, Math.round(rate * 10.0) / 10.0));
        } else {
            stats.setCollectionRate(0.0);
        }

        List<PaymentRecord> recentPayments = paymentRecordRepository.findTop10ByOrderByPaymentDateDesc();
        stats.setRecentPayments(recentPayments);

        List<Announcement> recentAnnouncements = announcementRepository.findTop5ByOrderByPinnedDescCreatedAtDesc();
        stats.setRecentAnnouncements(recentAnnouncements);

        return stats;
    }
}

