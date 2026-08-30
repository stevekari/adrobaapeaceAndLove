package com.association.duesportal.controller;

import com.association.duesportal.dto.MemberDuesSummaryDTO;
import com.association.duesportal.model.Member;
import com.association.duesportal.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ResponseEntity<List<Member>> getMembers(@RequestParam(required = false) String query) {
        if (query != null && !query.trim().isEmpty()) {
            return ResponseEntity.ok(memberService.searchMembers(query));
        }
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    @GetMapping("/summaries")
    public ResponseEntity<List<MemberDuesSummaryDTO>> getMemberSummaries() {
        return ResponseEntity.ok(memberService.getAllMemberSummaries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Member> getMemberByCode(@PathVariable String code) {
        return memberService.getMemberByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<MemberDuesSummaryDTO> getMemberSummary(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(memberService.getMemberSummary(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Member> createMember(@Valid @RequestBody Member member) {
        Member created = memberService.createMember(member);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @Valid @RequestBody Member member) {
        try {
            return ResponseEntity.ok(memberService.updateMember(id, member));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/clean-slate")
    public ResponseEntity<List<Member>> cleanSlate(@RequestParam(required = false) Long preserveAdminId) {
        List<Member> remaining = memberService.cleanSlate(preserveAdminId);
        return ResponseEntity.ok(remaining);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        try {
            memberService.deleteMember(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
