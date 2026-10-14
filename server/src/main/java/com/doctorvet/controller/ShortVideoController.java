package com.doctorvet.controller;

import com.doctorvet.model.ShortVideo;
import com.doctorvet.service.ShortVideoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/videos")
@CrossOrigin(originPatterns = "*")
public class ShortVideoController {

    private final ShortVideoService videoService;

    public ShortVideoController(ShortVideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    public List<ShortVideo> getAllVideos() {
        return videoService.getAllVideos();
    }

    @PostMapping
    public ShortVideo createVideo(@RequestBody ShortVideo video) {
        return videoService.createVideo(video);
    }

    @GetMapping("/{id}/comments")
    public List<com.doctorvet.model.Comment> getVideoComments(@PathVariable Long id) {
        return videoService.getVideoComments(id);
    }

    @PostMapping("/{id}/comments")
    public com.doctorvet.model.Comment addVideoComment(@PathVariable Long id, @RequestBody FeedController.AddCommentDto dto) {
        return videoService.addVideoComment(id, dto.authorId(), dto.authorName(), dto.authorAvatar(), dto.authorSpecialty(), dto.content());
    }
}
