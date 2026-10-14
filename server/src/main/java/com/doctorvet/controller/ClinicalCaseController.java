package com.doctorvet.controller;

import com.doctorvet.model.ClinicalCase;
import com.doctorvet.service.ClinicalCaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cases")
@CrossOrigin(originPatterns = "*")
public class ClinicalCaseController {

    private final ClinicalCaseService caseService;

    public ClinicalCaseController(ClinicalCaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping
    public List<ClinicalCase> getAllCases(@RequestParam(required = false) String species) {
        return caseService.getAllCases(species);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClinicalCase> getCaseById(@PathVariable Long id) {
        return caseService.getCaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ClinicalCase createCase(@RequestBody ClinicalCase clinicalCase) {
        return caseService.createCase(clinicalCase);
    }
}
