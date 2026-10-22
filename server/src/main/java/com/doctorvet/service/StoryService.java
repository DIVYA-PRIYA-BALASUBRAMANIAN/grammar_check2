package com.doctorvet.service;

import com.doctorvet.model.Notification;
import com.doctorvet.model.Story;
import com.doctorvet.model.StoryLike;
import com.doctorvet.model.StoryView;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.NotificationRepository;
import com.doctorvet.repository.StoryLikeRepository;
import com.doctorvet.repository.StoryRepository;
import com.doctorvet.repository.StoryViewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StoryService {

    private final StoryRepository storyRepo;
    private final StoryLikeRepository storyLikeRepo;
    private final StoryViewRepository storyViewRepo;
    private final DoctorProfileRepository doctorRepo;
    private final NotificationRepository notificationRepo;

    public StoryService(
            StoryRepository storyRepo,
            StoryLikeRepository storyLikeRepo,
            StoryViewRepository storyViewRepo,
            DoctorProfileRepository doctorRepo,
            NotificationRepository notificationRepo) {
        this.storyRepo = storyRepo;
        this.storyLikeRepo = storyLikeRepo;
        this.storyViewRepo = storyViewRepo;
        this.doctorRepo = doctorRepo;
        this.notificationRepo = notificationRepo;
    }

    public List<Story> getActiveStories(Long currentDoctorId) {
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

            if (currentDoctorId != null) {
                boolean liked = storyLikeRepo.existsByStoryIdAndDoctorId(s.getId(), currentDoctorId);
                s.setIsLiked(liked);
            }

            // Sync total views count
            long viewCount = storyViewRepo.countByStoryId(s.getId());
            if (viewCount > 0) {
                s.setViews((int) viewCount);
            }
        }
        return stories;
    }

    public List<Story> getActiveStories() {
        return getActiveStories(null);
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
        if (story.getLikes() == null) {
            story.setLikes(0);
        }
        if (story.getShares() == null) {
            story.setShares(0);
        }
        if (story.getViews() == null) {
            story.setViews(0);
        }
        return storyRepo.save(story);
    }

    @Transactional
    public Optional<Map<String, Object>> toggleLike(Long storyId, Long doctorId, String doctorName) {
        return storyRepo.findById(storyId).map(story -> {
            boolean liked;
            if (doctorId != null) {
                Optional<StoryLike> existing = storyLikeRepo.findByStoryIdAndDoctorId(storyId, doctorId);
                if (existing.isPresent()) {
                    storyLikeRepo.delete(existing.get());
                    story.setLikes(Math.max(0, story.getLikes() - 1));
                    liked = false;
                } else {
                    storyLikeRepo.save(new StoryLike(storyId, doctorId));
                    story.setLikes(story.getLikes() + 1);
                    liked = true;

                    if (story.getDoctorId() != null && !story.getDoctorId().equals(doctorId)) {
                        String name = (doctorName != null && !doctorName.isBlank()) ? doctorName : "A veterinarian";
                        String senderAvatar = null;
                        var doc = doctorRepo.findById(doctorId);
                        if (doc.isPresent()) {
                            senderAvatar = doc.get().getAvatar();
                        }
                        notificationRepo.save(new Notification(
                                story.getDoctorId(),
                                doctorId,
                                name,
                                senderAvatar,
                                "STORY_LIKE",
                                name + " liked your 24h story.",
                                storyId
                        ));
                    }
                }
            } else {
                story.setLikes(story.getLikes() + 1);
                liked = true;
            }
            Story saved = storyRepo.save(story);
            saved.setIsLiked(liked);

            Map<String, Object> res = new HashMap<>();
            res.put("story", saved);
            res.put("isLiked", liked);
            res.put("likes", saved.getLikes());
            return res;
        });
    }

    @Transactional
    public Optional<Map<String, Object>> recordShare(Long storyId) {
        return storyRepo.findById(storyId).map(story -> {
            story.setShares(story.getShares() + 1);
            Story saved = storyRepo.save(story);

            Map<String, Object> res = new HashMap<>();
            res.put("story", saved);
            res.put("shares", saved.getShares());
            return res;
        });
    }

    @Transactional
    public Optional<Map<String, Object>> recordView(
            Long storyId,
            Long viewerDoctorId,
            String viewerDoctorName,
            String viewerDoctorAvatar,
            String viewerSpecialty) {
        return storyRepo.findById(storyId).map(story -> {
            if (viewerDoctorId != null) {
                if (!storyViewRepo.existsByStoryIdAndViewerDoctorId(storyId, viewerDoctorId)) {
                    storyViewRepo.save(new StoryView(
                            storyId,
                            viewerDoctorId,
                            viewerDoctorName != null ? viewerDoctorName : "Dr. Colleague",
                            viewerDoctorAvatar,
                            viewerSpecialty != null ? viewerSpecialty : "Veterinary Practitioner"
                    ));
                    story.setViews(story.getViews() + 1);
                    storyRepo.save(story);
                }
            }
            long totalViews = storyViewRepo.countByStoryId(storyId);
            Map<String, Object> res = new HashMap<>();
            res.put("storyId", storyId);
            res.put("views", (int) totalViews);
            return res;
        });
    }

    public List<StoryView> getStoryViewers(Long storyId) {
        return storyViewRepo.findByStoryIdOrderByViewedAtDesc(storyId);
    }
}
