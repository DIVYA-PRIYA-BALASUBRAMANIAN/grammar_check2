package com.doctorvet.controller;

import com.doctorvet.model.Story;
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
    public ResponseEntity<List<Story>> getActiveStories() {
        return ResponseEntity.ok(storyService.getActiveStories());
    }

    @PostMapping
    public ResponseEntity<Story> createStory(@RequestBody Story story) {
        return ResponseEntity.ok(storyService.createStory(story));
    }
}
