package com.doctorvet.controller;

import com.doctorvet.model.Comment;
import com.doctorvet.model.ShortVideo;
import com.doctorvet.service.ShortVideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/videos")
@CrossOrigin(originPatterns = "*")
public class ShortVideoController {

    private final ShortVideoService videoService;

    public ShortVideoController(ShortVideoService videoService) {
        this.videoService = videoService;
    }

    public record AddCommentDto(Long authorId, String authorName, String authorAvatar, String authorSpecialty, String content) {}

    @GetMapping
    public List<ShortVideo> getAllVideos() {
        return videoService.getAllVideos();
    }

    @PostMapping
    public ShortVideo createVideo(@RequestBody ShortVideo video) {
        return videoService.createVideo(video);
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getVideoComments(@PathVariable Long id) {
        return videoService.getVideoComments(id);
    }

    @PostMapping("/{id}/comments")
    public Comment addVideoComment(@PathVariable Long id, @RequestBody AddCommentDto dto) {
        return videoService.addVideoComment(id, dto.authorId(), dto.authorName(), dto.authorAvatar(), dto.authorSpecialty(), dto.content());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        boolean deleted = videoService.deleteVideo(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Video deleted successfully", "id", id));
        }
        return ResponseEntity.notFound().build();
    }
}
