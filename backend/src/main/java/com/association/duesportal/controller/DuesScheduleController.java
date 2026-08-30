package com.association.duesportal.controller;

import com.association.duesportal.dto.ScheduleProgressDTO;
import com.association.duesportal.model.DuesSchedule;
import com.association.duesportal.service.DuesScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dues-schedules")
public class DuesScheduleController {

    private final DuesScheduleService duesScheduleService;

    public DuesScheduleController(DuesScheduleService duesScheduleService) {
        this.duesScheduleService = duesScheduleService;
    }

    @GetMapping
    public ResponseEntity<List<DuesSchedule>> getAllSchedules(@RequestParam(required = false) Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(duesScheduleService.getActiveSchedules());
        }
        return ResponseEntity.ok(duesScheduleService.getAllSchedules());
    }

    @GetMapping("/progress")
    public ResponseEntity<List<ScheduleProgressDTO>> getScheduleProgress() {
        return ResponseEntity.ok(duesScheduleService.getScheduleProgressList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DuesSchedule> getScheduleById(@PathVariable Long id) {
        return duesScheduleService.getScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DuesSchedule> createSchedule(@Valid @RequestBody DuesSchedule schedule) {
        DuesSchedule created = duesScheduleService.createSchedule(schedule);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DuesSchedule> updateSchedule(@PathVariable Long id, @Valid @RequestBody DuesSchedule schedule) {
        try {
            return ResponseEntity.ok(duesScheduleService.updateSchedule(id, schedule));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        try {
            duesScheduleService.deleteSchedule(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
