package com.association.duesportal.repository;

import com.association.duesportal.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findAllByOrderByPinnedDescCreatedAtDesc();

    List<Announcement> findTop5ByOrderByPinnedDescCreatedAtDesc();
}

