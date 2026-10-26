package com.doctorvet.controller;

import com.doctorvet.model.Story;
import com.doctorvet.model.StoryView;
import com.doctorvet.service.StoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stories")
@CrossOrigin(originPatterns = "*")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping
    public ResponseEntity<List<Story>> getActiveStories(@RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(storyService.getActiveStories(doctorId));
    }

    @PostMapping
    public ResponseEntity<Story> createStory(@RequestBody Story story) {
        return ResponseEntity.ok(storyService.createStory(story));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLikeStory(
            @PathVariable Long id,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String doctorName) {
        return storyService.toggleLike(id, doctorId, doctorName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> recordShareStory(@PathVariable Long id) {
        return storyService.recordShare(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> recordView(
            @PathVariable Long id,
            @RequestParam(required = false) Long viewerDoctorId,
            @RequestParam(required = false) String viewerDoctorName,
            @RequestParam(required = false) String viewerDoctorAvatar,
            @RequestParam(required = false) String viewerSpecialty) {
        return storyService.recordView(id, viewerDoctorId, viewerDoctorName, viewerDoctorAvatar, viewerSpecialty)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/viewers")
    public ResponseEntity<List<StoryView>> getStoryViewers(@PathVariable Long id) {
        return ResponseEntity.ok(storyService.getStoryViewers(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable Long id) {
        boolean deleted = storyService.deleteStory(id);
        if (deleted) {
            return ResponseEntity.ok().body(java.util.Map.of("success", true, "message", "Story deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
