package com.association.duesportal.repository;

import com.association.duesportal.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {

    Optional<PaymentRecord> findByReceiptNumber(String receiptNumber);

    List<PaymentRecord> findByMemberId(Long memberId);

    List<PaymentRecord> findByMemberIdOrderByPaymentDateDesc(Long memberId);

    List<PaymentRecord> findByScheduleIdOrderByPaymentDateDesc(Long scheduleId);

    @Modifying
    @Transactional
    void deleteByMemberId(Long memberId);

    List<PaymentRecord> findAllByOrderByPaymentDateDesc();

    List<PaymentRecord> findTop10ByOrderByPaymentDateDesc();

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM PaymentRecord p WHERE p.status = 'PAID'")
    BigDecimal calculateTotalPaid();

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM PaymentRecord p WHERE p.schedule.id = :scheduleId AND p.status = 'PAID'")
    BigDecimal calculateTotalPaidForSchedule(@Param("scheduleId") Long scheduleId);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM PaymentRecord p WHERE p.member.id = :memberId AND p.status = 'PAID'")
    BigDecimal calculateTotalPaidByMember(@Param("memberId") Long memberId);

    long countByStatus(String status);

    @Query("SELECT p FROM PaymentRecord p WHERE " +
           "LOWER(p.receiptNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.member.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.member.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.schedule.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.paymentMethod) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PaymentRecord> searchPayments(@Param("keyword") String keyword);
}
