package com.association.duesportal.repository;

import com.association.duesportal.model.DuesSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DuesScheduleRepository extends JpaRepository<DuesSchedule, Long> {

    List<DuesSchedule> findByActiveOrderByDueDateDesc(boolean active);

    List<DuesSchedule> findAllByOrderByDueDateDesc();
}

