package com.association.duesportal.controller;

import com.association.duesportal.dto.*;
import com.association.duesportal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        try {
            AuthResponseDTO response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequestDTO googleRequest) {
        try {
            AuthResponseDTO response = authService.googleLogin(googleRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            boolean isNotRegistered = e.getMessage() != null && e.getMessage().startsWith("NO_ACCOUNT_FOUND");
            return ResponseEntity.status(isNotRegistered ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "registered", !isNotRegistered,
                            "email", googleRequest.getEmail(),
                            "firstName", googleRequest.getFirstName() != null ? googleRequest.getFirstName() : "",
                            "lastName", googleRequest.getLastName() != null ? googleRequest.getLastName() : "",
                            "photoUrl", googleRequest.getPhotoUrl() != null ? googleRequest.getPhotoUrl() : ""
                    ));
        }
    }

    @GetMapping("/admin-status")
    public ResponseEntity<Map<String, Object>> getAdminStatus() {
        boolean hasAdmin = authService.isAdminRegistered();
        return ResponseEntity.ok(Map.of(
                "hasAdmin", hasAdmin,
                "message", hasAdmin
                        ? "An Admin account is already registered for Peace & Love, Adroabaa. Only one Admin is permitted."
                        : "No Admin is registered yet. You may proceed with Admin setup."
        ));
    }

    @PostMapping("/reset-admin-account")
    public ResponseEntity<?> resetAdminAccount() {
        authService.resetAdminAccount();
        return ResponseEntity.ok(Map.of("success", true, "message", "Admin accounts cleared. You can now register a fresh Admin."));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody AdminRegisterRequestDTO adminRequest) {
        try {
            AuthResponseDTO response = authService.registerAdmin(adminRequest);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify-code/{code}")
    public ResponseEntity<MemberCodeVerifyDTO> verifyCode(@PathVariable String code) {
        MemberCodeVerifyDTO result = authService.verifyMemberCode(code);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register-member")
    public ResponseEntity<?> registerMemberWithCode(@Valid @RequestBody MemberRegisterWithCodeDTO memberRequest) {
        try {
            AuthResponseDTO response = authService.registerMemberWithCode(memberRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        try {
            Map<String, Object> result = authService.forgotPassword(request);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        try {
            AuthResponseDTO response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

