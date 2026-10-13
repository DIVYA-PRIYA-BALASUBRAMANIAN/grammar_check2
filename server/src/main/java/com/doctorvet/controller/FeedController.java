package com.doctorvet.controller;

import com.doctorvet.model.Post;
import com.doctorvet.repository.PostRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feed")
@CrossOrigin(originPatterns = "*")
public class FeedController {

    private final PostRepository repository;

    public FeedController(PostRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Post> getFeedPosts(@RequestParam(required = false) String type) {
        if (type != null && !type.isBlank() && !type.equalsIgnoreCase("all")) {
            return repository.findByPostType(type);
        }
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/posts")
    public Post createPost(@RequestBody Post post) {
        return repository.save(post);
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Post> likePost(@PathVariable Long id) {
        return repository.findById(id)
                .map(p -> {
                    p.setLikes(p.getLikes() + 1);
                    return ResponseEntity.ok(repository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
