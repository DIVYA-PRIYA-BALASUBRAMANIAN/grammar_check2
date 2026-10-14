package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.service.DoctorProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(originPatterns = "*")
public class AuthController {

    private final DoctorProfileService doctorService;

    public AuthController(DoctorProfileService doctorService) {
        this.doctorService = doctorService;
    }

    public record LoginRequest(String identifier, String password) {}
    public record RegisterRequest(String name, String email, String password, 
                                  String vciNumber, String specialty, String city, String state) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.identifier() == null || req.identifier().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email or registered username is required."));
        }
        if (req.password() == null || req.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required."));
        }

        // Try to match an existing doctor in database via service
        Optional<DoctorProfile> docOpt = doctorService.findByEmailOrName(req.identifier());

        if (docOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "No veterinary account found with this email or username. Please create an account first."
            ));
        }

        DoctorProfile profile = docOpt.get();

        // Check password if hashed/set
        if (profile.getPasswordHash() != null && !profile.getPasswordHash().isBlank()) {
            if (!profile.getPasswordHash().equals(req.password())) {
                return ResponseEntity.status(401).body(Map.of(
                        "message", "Invalid password credentials. Please verify your password and try again."
                ));
            }
        }

        return ResponseEntity.ok(toAuthResponse(profile));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor full name is required."));
        }
        if (req.email() == null || req.email().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Official email address is required."));
        }
        if (req.password() == null || req.password().length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 4 characters long."));
        }

        // Verify email uniqueness
        if (doctorService.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "A veterinary practitioner is already registered with this email address. Please sign in."
            ));
        }

        DoctorProfile newDoctor = new DoctorProfile(
                req.name(),
                req.specialty() != null && !req.specialty().isBlank() ? req.specialty() : "Veterinary Medicine",
                "BVSc & AH (Verified Doctor)",
                "Clinical Practice",
                req.city() != null && !req.city().isBlank() ? req.city() : "Bengaluru",
                req.state() != null && !req.state().isBlank() ? req.state() : "Karnataka",
                "",
                true,
                1,
                0,
                "Registered veterinary clinical practitioner with verified credentials."
        );
        newDoctor.setEmail(req.email().trim().toLowerCase());
        newDoctor.setPasswordHash(req.password());
        newDoctor.setRole("VERIFIED_DOCTOR");
        newDoctor.setConnectionsCount(0);
        newDoctor.setCasesCount(0);

        DoctorProfile saved = doctorService.createProfile(newDoctor);

        return ResponseEntity.ok(toAuthResponse(saved));
    }

    private Map<String, Object> toAuthResponse(DoctorProfile profile) {
        Map<String, Object> res = new java.util.LinkedHashMap<>();
        res.put("token", "dvet-jwt-" + System.currentTimeMillis());
        res.put("id", profile.getId() != null ? profile.getId() : 1L);
        res.put("name", profile.getName());
        res.put("email", profile.getEmail() != null ? profile.getEmail() : "");
        res.put("specialty", profile.getSpecialty() != null ? profile.getSpecialty() : "Veterinary Medicine");
        res.put("city", profile.getCity() != null ? profile.getCity() : "Bengaluru");
        res.put("state", profile.getState() != null ? profile.getState() : "Karnataka");
        res.put("avatar", profile.getAvatar() != null ? profile.getAvatar() : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80");
        res.put("verified", profile.isVerified());
        res.put("role", profile.getRole() != null ? profile.getRole() : "VERIFIED_DOCTOR");
        res.put("connectionsCount", profile.getConnectionsCount());
        res.put("casesCount", profile.getCasesCount());
        return res;
    }
}
