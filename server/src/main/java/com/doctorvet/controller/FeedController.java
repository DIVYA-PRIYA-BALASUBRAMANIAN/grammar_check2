package com.doctorvet.controller;

import com.doctorvet.model.*;
import com.doctorvet.service.FeedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/feed")
@CrossOrigin(originPatterns = "*")
public class FeedController {

    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping
    public List<Post> getFeedPosts(@RequestParam(required = false) String type) {
        return feedService.getFeedPosts(type);
    }

    @PostMapping("/posts")
    public Post createPost(@RequestBody Post post) {
        return feedService.createPost(post);
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return feedService.updatePost(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        if (feedService.deletePost(id)) {
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLikePost(@PathVariable Long id,
            @RequestParam(required = false, defaultValue = "1") Long doctorId,
            @RequestParam(required = false, defaultValue = "Dr. You") String doctorName) {
        return feedService.toggleLike(id, doctorId, doctorName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/posts/{id}/comments")
    public List<Comment> getPostComments(@PathVariable Long id) {
        return feedService.getCommentsForPost(id);
    }

    public record AddCommentDto(Long authorId, String authorName, String authorAvatar, String authorSpecialty,
            String content) {
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody AddCommentDto dto) {
        return feedService
                .addComment(id, dto.authorId(), dto.authorName(), dto.authorAvatar(), dto.authorSpecialty(),
                        dto.content())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/posts/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long id, @RequestParam Long doctorId) {
        boolean bookmarked = feedService.toggleBookmark(id, doctorId);
        return ResponseEntity.ok(Map.of("postId", id, "isBookmarked", bookmarked));
    }

    @GetMapping("/posts/saved")
    public List<Post> getSavedPosts(@RequestParam Long doctorId) {
        return feedService.getSavedPosts(doctorId);
    }

    @PostMapping("/posts/{id}/report")
    public ResponseEntity<?> reportPost(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long reporterId = Long.valueOf(body.getOrDefault("reporterId", 1).toString());
        String reason = body.getOrDefault("reason", "Inappropriate content").toString();
        feedService.reportPost(id, reporterId, reason);
        return ResponseEntity
                .ok(Map.of("message", "Post reported to moderators. Thank you for keeping the community safe."));
    }

    @DeleteMapping("/posts/{id}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @RequestParam(required = false) Long doctorId) {
        if (feedService.deleteComment(id, commentId, doctorId)) {
            return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Unable to delete comment"));
    }

    @PutMapping("/posts/{id}/comments/{commentId}")
    public ResponseEntity<?> editComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @RequestParam(required = false) Long doctorId,
            @RequestBody Map<String, String> body) {
        String newContent = body.getOrDefault("content", "");
        return feedService.editComment(commentId, doctorId, newContent)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/posts/{id}/share")
    public ResponseEntity<?> recordSharePost(@PathVariable Long id) {
        return feedService.recordShare(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
