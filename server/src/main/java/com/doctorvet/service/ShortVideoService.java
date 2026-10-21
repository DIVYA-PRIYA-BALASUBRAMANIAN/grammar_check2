package com.doctorvet.service;

import com.doctorvet.model.Comment;
import com.doctorvet.model.ShortVideo;
import com.doctorvet.repository.CommentRepository;
import com.doctorvet.repository.ShortVideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShortVideoService {

    private final ShortVideoRepository videoRepo;
    private final CommentRepository commentRepo;

    public ShortVideoService(ShortVideoRepository videoRepo, CommentRepository commentRepo) {
        this.videoRepo = videoRepo;
        this.commentRepo = commentRepo;
    }

    public List<ShortVideo> getAllVideos() {
        return videoRepo.findAll();
    }

    @Transactional
    public ShortVideo createVideo(ShortVideo video) {
        if (video.getViews() == null || video.getViews().isBlank()) {
            video.setViews("1");
        }
        if (video.getViewsCount() == 0) {
            video.setViewsCount(1);
        }
        return videoRepo.save(video);
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

