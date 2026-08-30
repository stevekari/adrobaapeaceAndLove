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
        // 1. Dues Schedule Categories Seeding

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
