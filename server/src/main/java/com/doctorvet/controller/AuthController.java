package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.repository.DoctorProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(originPatterns = "*")
public class AuthController {

    private final DoctorProfileRepository doctorRepo;

    public AuthController(DoctorProfileRepository doctorRepo) {
        this.doctorRepo = doctorRepo;
    }

    public record LoginRequest(String identifier, String password) {}
    public record RegisterRequest(String name, String email, String password, 
                                  String vciNumber, String specialty, String city, String state) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.identifier() == null || req.identifier().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Identifier is required"));
        }

        // Try to match an existing doctor in MySQL database
        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> d.getName().toLowerCase().contains(req.identifier().toLowerCase()))
                .findFirst();

        DoctorProfile profile = docOpt.orElseGet(() -> {
            DoctorProfile d = new DoctorProfile();
            d.setName(req.identifier().contains("@") ? req.identifier().split("@")[0] : req.identifier());
            d.setSpecialty("Veterinary Medicine");
            d.setCity("Bengaluru");
            d.setState("Karnataka");
            d.setVerified(true);
            d.setAvatar("https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80");
            return d;
        });

        return ResponseEntity.ok(Map.of(
                "token", "dvet-jwt-" + System.currentTimeMillis(),
                "id", profile.getId() != null ? profile.getId() : 1L,
                "name", profile.getName(),
                "specialty", profile.getSpecialty(),
                "city", profile.getCity() != null ? profile.getCity() : "Bengaluru",
                "state", profile.getState() != null ? profile.getState() : "Karnataka",
                "avatar", profile.getAvatar() != null ? profile.getAvatar() : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
                "verified", true
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor name is required"));
        }

        DoctorProfile newDoctor = new DoctorProfile(
                req.name(),
                req.specialty() != null ? req.specialty() : "Veterinary Medicine",
                "BVSc & AH (Verified VCI)",
                "Clinical Practice",
                req.city() != null ? req.city() : "Bengaluru",
                req.state() != null ? req.state() : "Karnataka",
                "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80",
                true,
                1,
                0,
                "Registered veterinary practitioner under VCI: " + (req.vciNumber() != null ? req.vciNumber() : "VCI-REG-NEW")
        );

        DoctorProfile saved = doctorRepo.save(newDoctor);

        return ResponseEntity.ok(Map.of(
                "token", "dvet-jwt-" + System.currentTimeMillis(),
                "id", saved.getId(),
                "name", saved.getName(),
                "specialty", saved.getSpecialty(),
                "city", saved.getCity(),
                "state", saved.getState(),
                "avatar", saved.getAvatar(),
                "verified", true
        ));
    }
}
