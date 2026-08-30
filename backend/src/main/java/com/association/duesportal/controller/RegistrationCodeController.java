package com.association.duesportal.controller;

import com.association.duesportal.dto.AuthResponseDTO;
import com.association.duesportal.dto.GenerateCodeRequestDTO;
import com.association.duesportal.dto.RedeemCodeRequestDTO;
import com.association.duesportal.dto.RegistrationCodeDTO;
import com.association.duesportal.service.RegistrationCodeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registration-codes")
public class RegistrationCodeController {

    private final RegistrationCodeService registrationCodeService;

    public RegistrationCodeController(RegistrationCodeService registrationCodeService) {
        this.registrationCodeService = registrationCodeService;
    }

    @GetMapping
    public ResponseEntity<List<RegistrationCodeDTO>> getAllCodes(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(registrationCodeService.getCodesByStatus(status));
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateCodes(@RequestBody GenerateCodeRequestDTO request) {
        try {
            List<RegistrationCodeDTO> created = registrationCodeService.generateCodes(request);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify/{code}")
    public ResponseEntity<?> verifyCode(@PathVariable String code) {
        try {
            RegistrationCodeDTO dto = registrationCodeService.verifyCode(code);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemCode(@Valid @RequestBody RedeemCodeRequestDTO request) {
        try {
            AuthResponseDTO authResponse = registrationCodeService.redeemCode(request);
            return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> revokeCode(@PathVariable Long id) {
        try {
            registrationCodeService.revokeCode(id);
            return ResponseEntity.ok(Map.of("message", "Registration code revoked successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

