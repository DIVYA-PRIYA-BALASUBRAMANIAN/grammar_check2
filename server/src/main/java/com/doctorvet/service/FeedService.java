package com.doctorvet.service;

import com.doctorvet.model.*;
import com.doctorvet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class FeedService {

    private final PostRepository postRepo;
    private final CommentRepository commentRepo;
    private final PostLikeRepository likeRepo;
    private final SavedPostRepository savedRepo;
    private final ReportRepository reportRepo;
    private final NotificationRepository notificationRepo;

    public FeedService(PostRepository postRepo,
            CommentRepository commentRepo,
            PostLikeRepository likeRepo,
            SavedPostRepository savedRepo,
            ReportRepository reportRepo,
            NotificationRepository notificationRepo) {
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.likeRepo = likeRepo;
        this.savedRepo = savedRepo;
        this.reportRepo = reportRepo;
        this.notificationRepo = notificationRepo;
    }

    public List<Post> getFeedPosts(String type) {
        if (type != null && !type.isBlank() && !type.equalsIgnoreCase("all") && !type.equalsIgnoreCase("all posts")) {
            return postRepo.findByPostType(type);
        }
        return postRepo.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Post createPost(Post post) {
        return postRepo.save(post);
    }

    public Optional<Post> getPostById(Long id) {
        return postRepo.findById(id);
    }

    @Transactional
    public Optional<Post> updatePost(Long id, Map<String, String> body) {
        return postRepo.findById(id).map(p -> {
            if (body.containsKey("content"))
                p.setContent(body.get("content"));
            if (body.containsKey("imageUrl"))
                p.setImageUrl(body.get("imageUrl"));
            return postRepo.save(p);
        });
    }

    @Transactional
    public boolean deletePost(Long id) {
        if (postRepo.existsById(id)) {
            postRepo.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Optional<Map<String, Object>> toggleLike(Long postId, Long doctorId, String doctorName) {
        return postRepo.findById(postId).map(p -> {
            Optional<PostLike> existing = likeRepo.findByPostIdAndDoctorId(postId, doctorId);
            boolean liked;
            if (existing.isPresent()) {
                likeRepo.delete(existing.get());
                p.setLikes(Math.max(0, p.getLikes() - 1));
                liked = false;
            } else {
                likeRepo.save(new PostLike(postId, doctorId));
                p.setLikes(p.getLikes() + 1);
                liked = true;

                if (p.getAuthorId() != null && !p.getAuthorId().equals(doctorId)) {
                    notificationRepo.save(new Notification(
                            p.getAuthorId(),
                            doctorId,
                            doctorName,
                            null,
                            "POST_LIKE",
                            doctorName + " liked your clinical post.",
                            postId));
                }
            }
            Post saved = postRepo.save(p);
            Map<String, Object> res = new HashMap<>();
            res.put("post", saved);
            res.put("isLiked", liked);
            res.put("likes", saved.getLikes());
            return res;
        });
    }

    public List<Comment> getCommentsForPost(Long postId) {
        return commentRepo.findByPostIdOrderByCreatedAtAsc(postId);
    }

    @Transactional
    public Optional<Comment> addComment(Long postId, Long authorId, String authorName, String authorAvatar,
            String authorSpecialty, String content) {
        return postRepo.findById(postId).map(p -> {
            Comment comment = new Comment(postId, authorId, authorName, authorAvatar, authorSpecialty, content);
            Comment savedComment = commentRepo.save(comment);

            p.setCommentsCount(p.getCommentsCount() + 1);
            postRepo.save(p);

            if (p.getAuthorId() != null && (authorId == null || !p.getAuthorId().equals(authorId))) {
                String snippet = content.length() > 40 ? content.substring(0, 40) + "..." : content;
                notificationRepo.save(new Notification(
                        p.getAuthorId(),
                        authorId != null ? authorId : 0L,
                        authorName,
                        authorAvatar,
                        "POST_COMMENT",
                        authorName + " commented on your post: \"" + snippet + "\"",
                        postId));
            }

            return savedComment;
        });
    }

    @Transactional
    public boolean toggleBookmark(Long postId, Long doctorId) {
        Optional<SavedPost> existing = savedRepo.findByPostIdAndDoctorId(postId, doctorId);
        if (existing.isPresent()) {
            savedRepo.delete(existing.get());
            return false;
        } else {
            savedRepo.save(new SavedPost(postId, doctorId));
            return true;
        }
    }

    public List<Post> getSavedPosts(Long doctorId) {
        List<SavedPost> savedList = savedRepo.findByDoctorIdOrderBySavedAtDesc(doctorId);
        List<Long> postIds = savedList.stream()
                .filter(sp -> sp != null && sp.getPostId() != null)
                .map(sp -> sp.getPostId())
                .toList();
        return postRepo.findAllById(postIds);
    }

    @Transactional
    public void reportPost(Long postId, Long reporterId, String reason) {
        reportRepo.save(new Report(reporterId, postId, reason));
    }

    @Transactional
    public boolean deleteComment(Long postId, Long commentId, Long doctorId) {
        return commentRepo.findById(commentId).map(comment -> {
            if (comment.getAuthorId() != null && doctorId != null && !comment.getAuthorId().equals(doctorId)) {
                return false;
            }
            commentRepo.delete(comment);
            postRepo.findById(postId).ifPresent(p -> {
                p.setCommentsCount(Math.max(0, p.getCommentsCount() - 1));
                postRepo.save(p);
            });
            return true;
        }).orElse(false);
    }

    @Transactional
    public Optional<Comment> editComment(Long commentId, Long doctorId, String newContent) {
        return commentRepo.findById(commentId).map(comment -> {
            if (comment.getAuthorId() != null && doctorId != null && !comment.getAuthorId().equals(doctorId)) {
                return comment;
            }
            comment.setContent(newContent);
            return commentRepo.save(comment);
        });
    }

    @Transactional
    public Optional<Map<String, Object>> recordShare(Long postId) {
        return postRepo.findById(postId).map(post -> {
            post.setShares(post.getShares() + 1);
            Post saved = postRepo.save(post);
            Map<String, Object> res = new HashMap<>();
            res.put("postId", saved.getId());
            res.put("shares", saved.getShares());
            return res;
        });
    }
}
