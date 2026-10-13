package com.doctorvet.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/ai-assist")
@CrossOrigin(originPatterns = "*")
public class AiAssistantController {

    public record AiRequest(String species, String symptoms, String vitals) {}

    public record Differential(String name, String likelihood, String reasoning) {}

    public record AiResponse(
            List<Differential> primaryDifferentials,
            List<String> recommendedDiagnostics,
            List<String> emergencyActionProtocol
    ) {}

    @PostMapping("/diagnose")
    public AiResponse generateDifferential(@RequestBody AiRequest request) {
        String sp = request.species() != null ? request.species() : "Canine";

        List<Differential> diffs = List.of(
                new Differential("Acute Gastric Dilatation-Volvulus (GDV)", "High (85%)", "Prominent tympany, non-productive retching, and tachycardia in deep-chested canine."),
                new Differential("Severe Acute Pancreatitis with Peritonitis", "Moderate (45%)", "Cranial abdominal splinting and tachycardia with acute inflammatory onset."),
                new Differential("Splenic Torsion / Rupture with Hemoperitoneum", "Moderate (40%)", "Pale mucous membranes, prolonged CRT, and weak pulses consistent with hypovolemia.")
        );

        List<String> diags = List.of(
                "Right lateral abdominal radiograph (Verify gastric compartmentalization / reverse C)",
                "Abdominal FAST (AFAST) scan to rule out hemoperitoneum or peritoneal effusion",
                "Serial blood lactate monitoring (Lactate > 6 mmol/L correlates with gastric necrosis)",
                "Complete Blood Count (CBC) and full serum chemistry panel"
        );

        List<String> emergency = List.of(
                "Place dual 16G/18G cephalic IV catheters immediately.",
                "Initiate balanced isotonic crystalloid shock volume resuscitation (20-30 mL/kg).",
                "Percutaneous gastric decompression via 14G catheter in right paracostal flank.",
                "Prompt pre-surgical stabilization for laparotomy and incisional gastropexy."
        );

        return new AiResponse(diffs, diags, emergency);
    }
}
