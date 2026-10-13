package com.doctorvet.controller;

import com.doctorvet.model.ShortVideo;
import com.doctorvet.repository.ShortVideoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/videos")
@CrossOrigin(originPatterns = "*")
public class ShortVideoController {

    private final ShortVideoRepository repository;

    public ShortVideoController(ShortVideoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ShortVideo> getAllVideos() {
        return repository.findAll();
    }

    @PostMapping
    public ShortVideo createVideo(@RequestBody ShortVideo video) {
        return repository.save(video);
    }
}
