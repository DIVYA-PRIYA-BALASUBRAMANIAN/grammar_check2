package com.doctorvet.controller;

import com.doctorvet.model.ClinicalCase;
import com.doctorvet.repository.ClinicalCaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cases")
@CrossOrigin(originPatterns = "*")
public class ClinicalCaseController {

    private final ClinicalCaseRepository repository;

    public ClinicalCaseController(ClinicalCaseRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ClinicalCase> getAllCases(@RequestParam(required = false) String species) {
        if (species != null && !species.isBlank() && !species.equalsIgnoreCase("all")) {
            return repository.findBySpecies(species);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClinicalCase> getCaseById(@PathVariable Long id) {
        return repository.findById(id)
                .map(c -> {
                    c.setViews(c.getViews() + 1);
                    return ResponseEntity.ok(repository.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ClinicalCase createCase(@RequestBody ClinicalCase clinicalCase) {
        return repository.save(clinicalCase);
    }
}
