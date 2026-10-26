package com.doctorvet.service;

import com.doctorvet.model.Comment;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Notification;
import com.doctorvet.model.ShortVideo;
import com.doctorvet.repository.CommentRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.NotificationRepository;
import com.doctorvet.repository.ShortVideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ShortVideoService {

    private final ShortVideoRepository videoRepo;
    private final CommentRepository commentRepo;
    private final NotificationRepository notificationRepo;
    private final DoctorProfileRepository doctorRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ShortVideoService(
            ShortVideoRepository videoRepo,
            CommentRepository commentRepo,
            NotificationRepository notificationRepo,
            DoctorProfileRepository doctorRepo,
            @Autowired(required = false) SimpMessagingTemplate messagingTemplate) {
        this.videoRepo = videoRepo;
        this.commentRepo = commentRepo;
        this.notificationRepo = notificationRepo;
        this.doctorRepo = doctorRepo;
        this.messagingTemplate = messagingTemplate;
    }

    public List<ShortVideo> getAllVideos() {
        List<ShortVideo> list = videoRepo.findAll();
        for (ShortVideo v : list) {
            if (v.getThumbnail() != null && (v.getThumbnail().contains("543a7dc6") || v.getThumbnail().contains("bcb16239") || v.getThumbnail().contains("43090d16"))) {
                v.setThumbnail(null);
                videoRepo.save(v);
            }
        }
        return list;
    }

    @Transactional
    public ShortVideo createVideo(ShortVideo video) {
        if (video.getViews() == null || video.getViews().isBlank()) {
            video.setViews("1");
        }
        if (video.getViewsCount() <= 0) {
            video.setViewsCount(1);
        }
        ShortVideo saved = videoRepo.save(video);

        try {
            String authorName = saved.getDoctorName() != null && !saved.getDoctorName().isBlank() ? saved.getDoctorName() : "A Doctor";
            String avatar = null;
            Long authorId = 0L;

            List<DoctorProfile> allDocs = doctorRepo.findAll();
            for (DoctorProfile doc : allDocs) {
                if (doc.getName() != null && (doc.getName().equalsIgnoreCase(authorName) || doc.getName().toLowerCase().contains(authorName.toLowerCase()))) {
                    avatar = doc.getAvatar();
                    authorId = doc.getId();
                    break;
                }
            }

            String notifMsg = authorName + " uploaded a new surgical reel: \"" + saved.getTitle() + "\"";

            for (DoctorProfile doc : allDocs) {
                if (!doc.getId().equals(authorId)) {
                    Notification notif = new Notification(
                            doc.getId(),
                            authorId,
                            authorName,
                            avatar,
                            "REEL_UPLOAD",
                            notifMsg,
                            saved.getId()
                    );
                    notificationRepo.save(notif);

                    if (messagingTemplate != null) {
                        try {
                            messagingTemplate.convertAndSend("/topic/user/" + doc.getId() + "/notifications", (Object) notif, (Map<String, Object>) null);
                        } catch (Exception ignored) {}
                    }
                }
            }

            if (messagingTemplate != null) {
                try {
                    messagingTemplate.convertAndSend("/topic/notifications", (Object) saved, (Map<String, Object>) null);
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            System.err.println("ShortVideoService notification error: " + e.getMessage());
        }

        return saved;
    }

    public List<Comment> getVideoComments(Long videoId) {
        return commentRepo.findByPostIdOrderByCreatedAtAsc(100000L + videoId);
    }

    @Transactional
    public Comment addVideoComment(Long videoId, Long authorId, String authorName, String authorAvatar, String authorSpecialty, String content) {
        Comment comment = new Comment(100000L + videoId, authorId, authorName, authorAvatar, authorSpecialty, content);
        return commentRepo.save(comment);
    }

    @Transactional
    public boolean deleteVideo(Long id) {
        if (videoRepo.existsById(id)) {
            // Also clean up any comments on this video
            List<Comment> comments = commentRepo.findByPostIdOrderByCreatedAtAsc(100000L + id);
            commentRepo.deleteAll(comments);
            videoRepo.deleteById(id);
            return true;
        }
        return false;
    }
}

