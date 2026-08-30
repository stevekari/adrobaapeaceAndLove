package com.association.duesportal.controller;

import com.association.duesportal.dto.PaymentRequestDTO;
import com.association.duesportal.model.PaymentRecord;
import com.association.duesportal.service.PaymentRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentRecordController {

    private final PaymentRecordService paymentRecordService;

    public PaymentRecordController(PaymentRecordService paymentRecordService) {
        this.paymentRecordService = paymentRecordService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentRecord>> getAllPayments(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(paymentRecordService.searchPayments(keyword));
        }
        return ResponseEntity.ok(paymentRecordService.getAllPayments());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<PaymentRecord>> getRecentPayments() {
        return ResponseEntity.ok(paymentRecordService.getRecentPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentRecord> getPaymentById(@PathVariable Long id) {
        return paymentRecordService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<PaymentRecord> getPaymentByReceiptNumber(@PathVariable String receiptNumber) {
        return paymentRecordService.getPaymentByReceiptNumber(receiptNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<PaymentRecord>> getPaymentsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(paymentRecordService.getPaymentsByMember(memberId));
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<PaymentRecord>> getPaymentsBySchedule(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(paymentRecordService.getPaymentsBySchedule(scheduleId));
    }

    @PostMapping
    public ResponseEntity<?> recordPayment(@Valid @RequestBody PaymentRequestDTO request) {
        try {
            PaymentRecord created = paymentRecordService.recordPayment(request);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field is required"));
        }
        try {
            PaymentRecord updated = paymentRecordService.updatePaymentStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        try {
            paymentRecordService.deletePayment(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
