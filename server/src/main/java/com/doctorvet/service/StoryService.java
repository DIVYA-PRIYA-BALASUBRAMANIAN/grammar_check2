package com.doctorvet.service;

import com.doctorvet.model.Story;
import com.doctorvet.repository.StoryRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StoryService {

    private final StoryRepository storyRepo;
    private final DoctorProfileRepository doctorRepo;

    public StoryService(StoryRepository storyRepo, DoctorProfileRepository doctorRepo) {
        this.storyRepo = storyRepo;
        this.doctorRepo = doctorRepo;
    }

    public List<Story> getActiveStories() {
        List<Story> stories = storyRepo.findByExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now());
        for (Story s : stories) {
            if (s.getDoctorId() != null) {
                doctorRepo.findById(s.getDoctorId()).ifPresent(doc -> {
                    if (doc.getAvatar() != null && !doc.getAvatar().isBlank()) {
                        s.setAvatar(doc.getAvatar());
                    }
                });
            } else if (s.getDoctorName() != null && !s.getDoctorName().isBlank()) {
                final String docName = s.getDoctorName().toLowerCase().replace("dr.", "").trim();
                doctorRepo.findAll().stream()
                        .filter(d -> d.getName() != null && d.getName().toLowerCase().replace("dr.", "").trim().equals(docName))
                        .findFirst()
                        .ifPresent(doc -> {
                            if (doc.getAvatar() != null && !doc.getAvatar().isBlank()) {
                                s.setAvatar(doc.getAvatar());
                            }
                        });
            }
        }
        return stories;
    }

    @Transactional
    public Story createStory(Story story) {
        if (story.getDoctorId() != null) {
            doctorRepo.findById(story.getDoctorId()).ifPresent(doc -> {
                if (doc.getAvatar() != null && !doc.getAvatar().isBlank()) {
                    story.setAvatar(doc.getAvatar());
                }
            });
        }
        if (story.getCreatedAt() == null) {
            story.setCreatedAt(LocalDateTime.now());
        }
        if (story.getExpiresAt() == null) {
            story.setExpiresAt(LocalDateTime.now().plusHours(24));
        }
        return storyRepo.save(story);
    }
}
