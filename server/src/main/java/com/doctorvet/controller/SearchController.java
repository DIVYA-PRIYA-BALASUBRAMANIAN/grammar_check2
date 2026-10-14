package com.doctorvet.controller;

import com.doctorvet.service.UnifiedSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@CrossOrigin(originPatterns = "*")
public class SearchController {

    private final UnifiedSearchService searchService;

    public SearchController(UnifiedSearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<UnifiedSearchService.SearchResult> search(@RequestParam(value = "q", required = false, defaultValue = "") String query) {
        return ResponseEntity.ok(searchService.search(query));
    }
}
