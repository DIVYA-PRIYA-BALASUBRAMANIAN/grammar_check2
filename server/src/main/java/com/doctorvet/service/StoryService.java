package com.doctorvet.service;

import com.doctorvet.model.Story;
import com.doctorvet.repository.StoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StoryService {

    private final StoryRepository storyRepo;

    public StoryService(StoryRepository storyRepo) {
        this.storyRepo = storyRepo;
    }

    public List<Story> getActiveStories() {
        return storyRepo.findByExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now());
    }

    @Transactional
    public Story createStory(Story story) {
        if (story.getCreatedAt() == null) {
            story.setCreatedAt(LocalDateTime.now());
        }
        if (story.getExpiresAt() == null) {
            story.setExpiresAt(LocalDateTime.now().plusHours(24));
        }
        return storyRepo.save(story);
    }
}
