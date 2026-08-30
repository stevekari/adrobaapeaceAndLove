package com.association.duesportal.config;

import com.association.duesportal.model.*;
import com.association.duesportal.repository.*;
import com.association.duesportal.util.PasswordUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final DuesScheduleRepository duesScheduleRepository;

    public DataInitializer(MemberRepository memberRepository, DuesScheduleRepository duesScheduleRepository) {
        this.memberRepository = memberRepository;
        this.duesScheduleRepository = duesScheduleRepository;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Primary Admin if no members exist
        if (memberRepository.count() == 0) {
            Member admin = new Member(
                    "Stephen", "Karikari", "stephen.karikari@association.org", "+233 24 123 4567",
                    "14 Independence Avenue, Airport Residential", "Accra", null, "Senior IT Director",
                    LocalDate.of(2023, 1, 15), "ACTIVE", "ADMIN",
                    "ADM-1001", PasswordUtil.hashPassword("admin123"), true
            );
            memberRepository.save(admin);
        }

        // 2. Seed Standard Dues Purpose Categories if none exist
        if (duesScheduleRepository.count() == 0) {
            DuesSchedule monthlyLevy = new DuesSchedule(
                    "Monthly Dues Levy",
                    new BigDecimal("50.00"),
                    "Monthly",
                    LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1),
                    "Regular monthly member welfare contributions, emergency support pool, and operational fund.",
                    true
            );

            DuesSchedule annualLevy = new DuesSchedule(
                    "Annual Dues Levy",
                    new BigDecimal("200.00"),
                    "Annual",
                    LocalDate.of(LocalDate.now().getYear(), 12, 31),
                    "Mandatory annual association membership levy supporting administration, governance, and annual conventions.",
                    true
            );

            DuesSchedule donationLevy = new DuesSchedule(
                    "Donation Levy",
                    new BigDecimal("100.00"),
                    "One-Time",
                    LocalDate.of(LocalDate.now().getYear(), 12, 31),
                    "Voluntary community support, project developments, emergency funds, and member donations.",
                    true
            );

            duesScheduleRepository.saveAll(Arrays.asList(monthlyLevy, annualLevy, donationLevy));
        }
    }
}
