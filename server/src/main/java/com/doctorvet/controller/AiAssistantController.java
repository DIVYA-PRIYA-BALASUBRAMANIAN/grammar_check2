package com.doctorvet.controller;

import com.doctorvet.service.AiAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai-assist")
@CrossOrigin(originPatterns = "*")
public class AiAssistantController {

    private final AiAssistantService aiService;

    public AiAssistantController(AiAssistantService aiService) {
        this.aiService = aiService;
    }

    public record AiRequest(String species, String symptoms, String vitals) {}

    @PostMapping("/diagnose")
    public ResponseEntity<AiAssistantService.AiResponse> generateDifferential(@RequestBody AiRequest request) {
        String species = request != null ? request.species() : "Canine";
        String symptoms = request != null ? request.symptoms() : "";
        String vitals = request != null ? request.vitals() : "";

        return ResponseEntity.ok(aiService.generateDifferential(species, symptoms, vitals));
    }
}
