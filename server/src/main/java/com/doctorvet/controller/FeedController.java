package com.doctorvet.controller;

import com.doctorvet.model.*;
import com.doctorvet.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/feed")
@CrossOrigin(originPatterns = "*")
public class FeedController {

    private final PostRepository postRepo;
    private final CommentRepository commentRepo;
    private final PostLikeRepository likeRepo;
    private final SavedPostRepository savedRepo;
    private final ReportRepository reportRepo;
    private final NotificationRepository notificationRepo;

    public FeedController(PostRepository postRepo,
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

    @GetMapping
    public List<Post> getFeedPosts(@RequestParam(required = false) String type) {
        if (type != null && !type.isBlank() && !type.equalsIgnoreCase("all") && !type.equalsIgnoreCase("all posts")) {
            return postRepo.findByPostType(type);
        }
        return postRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/posts")
    public Post createPost(@RequestBody Post post) {
        return postRepo.save(post);
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return postRepo.findById(id).map(p -> {
            if (body.containsKey("content")) p.setContent(body.get("content"));
            if (body.containsKey("imageUrl")) p.setImageUrl(body.get("imageUrl"));
            return ResponseEntity.ok(postRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        if (postRepo.existsById(id)) {
            postRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLikePost(@PathVariable Long id, @RequestParam(required = false, defaultValue = "1") Long doctorId,
                                            @RequestParam(required = false, defaultValue = "Dr. You") String doctorName) {
        return postRepo.findById(id).map(p -> {
            Optional<PostLike> existing = likeRepo.findByPostIdAndDoctorId(id, doctorId);
            boolean liked;
            if (existing.isPresent()) {
                likeRepo.delete(existing.get());
                p.setLikes(Math.max(0, p.getLikes() - 1));
                liked = false;
            } else {
                likeRepo.save(new PostLike(id, doctorId));
                p.setLikes(p.getLikes() + 1);
                liked = true;

                // Send notification to author if author is someone else
                if (p.getAuthorId() != null && !p.getAuthorId().equals(doctorId)) {
                    notificationRepo.save(new Notification(
                            p.getAuthorId(),
                            doctorId,
                            doctorName,
                            null,
                            "POST_LIKE",
                            doctorName + " liked your post.",
                            id
                    ));
                }
            }
            Post saved = postRepo.save(p);
            return ResponseEntity.ok(Map.of("post", saved, "isLiked", liked, "likes", saved.getLikes()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/posts/{id}/comments")
    public List<Comment> getPostComments(@PathVariable Long id) {
        return commentRepo.findByPostIdOrderByCreatedAtAsc(id);
    }

    public record AddCommentDto(Long authorId, String authorName, String authorAvatar, String authorSpecialty, String content) {}

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody AddCommentDto dto) {
        return postRepo.findById(id).map(p -> {
            Comment comment = new Comment(
                    id,
                    dto.authorId(),
                    dto.authorName(),
                    dto.authorAvatar(),
                    dto.authorSpecialty(),
                    dto.content()
            );
            Comment savedComment = commentRepo.save(comment);

            // Update comments count on post
            p.setCommentsCount(p.getCommentsCount() + 1);
            postRepo.save(p);

            // Send notification to author
            if (p.getAuthorId() != null && (dto.authorId() == null || !p.getAuthorId().equals(dto.authorId()))) {
                notificationRepo.save(new Notification(
                        p.getAuthorId(),
                        dto.authorId() != null ? dto.authorId() : 0L,
                        dto.authorName(),
                        dto.authorAvatar(),
                        "POST_COMMENT",
                        dto.authorName() + " commented on your post: \"" + (dto.content().length() > 40 ? dto.content().substring(0, 40) + "..." : dto.content()) + "\"",
                        id
                ));
            }

            return ResponseEntity.ok(savedComment);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/posts/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long id, @RequestParam Long doctorId) {
        Optional<SavedPost> existing = savedRepo.findByPostIdAndDoctorId(id, doctorId);
        boolean saved;
        if (existing.isPresent()) {
            savedRepo.delete(existing.get());
            saved = false;
        } else {
            savedRepo.save(new SavedPost(id, doctorId));
            saved = true;
        }
        return ResponseEntity.ok(Map.of("postId", id, "isBookmarked", saved));
    }

    @GetMapping("/posts/saved")
    public List<Post> getSavedPosts(@RequestParam Long doctorId) {
        List<SavedPost> savedList = savedRepo.findByDoctorIdOrderBySavedAtDesc(doctorId);
        List<Long> postIds = savedList.stream().map(SavedPost::getPostId).toList();
        return postRepo.findAllById(postIds);
    }

    @PostMapping("/posts/{id}/report")
    public ResponseEntity<?> reportPost(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long reporterId = Long.valueOf(body.getOrDefault("reporterId", 1).toString());
        String reason = body.getOrDefault("reason", "Inappropriate content").toString();
        reportRepo.save(new Report(reporterId, id, reason));
        return ResponseEntity.ok(Map.of("message", "Post reported to moderators. Thank you for keeping the community safe."));
    }
}
