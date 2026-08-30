package com.association.duesportal.service;

import com.association.duesportal.model.Announcement;
import com.association.duesportal.model.Member;
import com.association.duesportal.repository.AnnouncementRepository;
import com.association.duesportal.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final MemberRepository memberRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository, MemberRepository memberRepository) {
        this.announcementRepository = announcementRepository;
        this.memberRepository = memberRepository;
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByPinnedDescCreatedAtDesc();
    }

    public List<Announcement> getRecentAnnouncements() {
        return announcementRepository.findTop5ByOrderByPinnedDescCreatedAtDesc();
    }

    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }

    public Announcement createAnnouncement(Announcement announcement, Long authorId) {
        if (authorId != null) {
            Optional<Member> author = memberRepository.findById(authorId);
            author.ifPresent(announcement::setAuthor);
        }
        if (announcement.getCreatedAt() == null) {
            announcement.setCreatedAt(LocalDateTime.now());
        }
        return announcementRepository.save(announcement);
    }

    public Announcement updateAnnouncement(Long id, Announcement details) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found with id: " + id));

        announcement.setTitle(details.getTitle());
        announcement.setContent(details.getContent());
        announcement.setPriority(details.getPriority());
        announcement.setPinned(details.isPinned());

        return announcementRepository.save(announcement);
    }

    public void deleteAnnouncement(Long id) {
        if (!announcementRepository.existsById(id)) {
            throw new IllegalArgumentException("Announcement not found with id: " + id);
        }
        announcementRepository.deleteById(id);
    }
}

