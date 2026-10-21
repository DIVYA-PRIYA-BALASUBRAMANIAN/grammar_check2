package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.security.TokenService;
import com.doctorvet.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(originPatterns = "*")
public class AuthController {

    private final DoctorProfileRepository doctorRepo;
    private final TokenService tokenService;
    private final EmailService emailService;

    public AuthController(DoctorProfileRepository doctorRepo, TokenService tokenService, EmailService emailService) {
        this.doctorRepo = doctorRepo;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }

    public record LoginRequest(String identifier, String password) {
    }

    public record RegisterRequest(String name, String email, String password,
            String vciNumber, String specialty, String city, String state, String phone) {
    }

    public record AuthResponse(
            String token,
            Long id,
            String name,
            String email,
            String specialty,
            String qualification,
            String clinic,
            String city,
            String state,
            String avatar,
            String coverImage,
            String bio,
            String headline,
            String phone,
            String licenseNumber,
            Integer experienceYears,
            boolean verified,
            int connectionsCount,
            int casesCount,
            boolean active) {
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.identifier() == null || req.identifier().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email, phone number, or doctor name is required"));
        }

        String rawSearch = req.identifier().trim();
        String search = rawSearch.toLowerCase();
        String cleanPhone = rawSearch.replaceAll("[^0-9]", "");

        // 1. Try to find doctor in DB by email, phone, or name
        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
                        || (d.getPhone() != null && !cleanPhone.isBlank()
                                && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                        || d.getName().toLowerCase().contains(search)
                        || search.contains(d.getName().toLowerCase()))
                .findFirst();

        DoctorProfile profile = docOpt.orElse(null);

        // 3. If still not found, create new doctor profile
        if (profile == null) {
            String cleanName = req.identifier().contains("@")
                    ? "Dr. " + capitalize(req.identifier().split("@")[0])
                    : (req.identifier().startsWith("Dr.") ? req.identifier() : "Dr. " + req.identifier());

            DoctorProfile newDoc = new DoctorProfile(
                    cleanName,
                    "Veterinary Medicine",
                    "BVSc & AH (Verified)",
                    "Companion Animal Hospital",
                    "Bengaluru",
                    "Karnataka",
                    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
                    true,
                    5,
                    12,
                    "Veterinary practitioner registered on Zenve Vet.");
            newDoc.setEmail(req.identifier().contains("@") ? req.identifier() : null);
            newDoc.setActive(true);
            profile = doctorRepo.save(newDoc);

            if (profile.getEmail() != null && !profile.getEmail().isBlank()) {
                emailService.sendDoctorWelcomeEmail(profile.getEmail(), profile.getName(), profile.getSpecialty());
            }
        } else {
            profile.setActive(true);
            profile = doctorRepo.save(profile);
        }

        // Generate signed token
        String token = tokenService.generateToken(profile.getId(), profile.getName(), profile.getEmail());

        return ResponseEntity.ok(toAuthResponse(token, profile));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor name is required"));
        }

        String doctorName = req.name().trim();
        if (!doctorName.startsWith("Dr.")) {
            doctorName = "Dr. " + doctorName;
        }

        DoctorProfile newDoctor = new DoctorProfile(
                doctorName,
                req.specialty() != null ? req.specialty() : "Veterinary Medicine",
                "BVSc & AH (Verified VCI)",
                "Clinical Practice",
                req.city() != null && !req.city().isBlank() ? req.city() : "Bengaluru",
                req.state() != null && !req.state().isBlank() ? req.state() : "Karnataka",
                "",
                true,
                1,
                0,
                req.vciNumber() != null && !req.vciNumber().isBlank()
                        ? "Registered veterinary practitioner under VCI: " + req.vciNumber().trim()
                        : "Registered veterinary practitioner");
        newDoctor.setEmail(req.email() != null ? req.email() : null);
        newDoctor.setPhone(req.phone() != null ? req.phone() : null);
        newDoctor.setActive(true);
        DoctorProfile saved = doctorRepo.save(newDoctor);

        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            emailService.sendDoctorWelcomeEmail(saved.getEmail(), saved.getName(), saved.getSpecialty());
        }

        String token = tokenService.generateToken(saved.getId(), saved.getName(), saved.getEmail());

        return ResponseEntity.ok(toAuthResponse(token, saved));
    }

    @PostMapping("/test-welcome-email")
    public ResponseEntity<?> testWelcomeEmail(
            @RequestParam(name = "to", defaultValue = "test@zenvevet.com") String to,
            @RequestParam(name = "name", defaultValue = "Dr. Partner") String name) {
        emailService.sendDoctorWelcomeEmail(to, name, "Veterinary Medicine");
        return ResponseEntity.ok(Map.of(
                "status", "DISPATCHED",
                "recipient", to,
                "sender", "no-reply@zenvevet.com",
                "message", "Welcome email queued for " + to + " from no-reply@zenvevet.com"
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "Missing authentication token"));
        }

        String token = authHeader.substring(7).trim();
        Long doctorId = tokenService.getDoctorIdFromToken(token);
        if (doctorId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "Session expired or invalid token"));
        }

        Optional<DoctorProfile> profileOpt = doctorRepo.findById(doctorId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "Doctor account not found"));
        }

        DoctorProfile profile = profileOpt.get();
        return ResponseEntity.ok(toAuthResponse(token, profile));
    }

    private AuthResponse toAuthResponse(String token, DoctorProfile p) {
        return new AuthResponse(
                token,
                p.getId(),
                p.getName(),
                p.getEmail() != null ? p.getEmail() : "",
                p.getSpecialty() != null ? p.getSpecialty() : "Veterinary Medicine",
                p.getQualification() != null ? p.getQualification() : "BVSc & AH (Verified VCI)",
                p.getClinic() != null ? p.getClinic() : "Clinical Practice",
                p.getCity() != null ? p.getCity() : "Bengaluru",
                p.getState() != null ? p.getState() : "Karnataka",
                p.getAvatar() != null ? p.getAvatar() : "",
                p.getCoverImage() != null ? p.getCoverImage() : "",
                p.getBio() != null ? p.getBio() : "",
                p.getHeadline() != null ? p.getHeadline() : "",
                p.getPhone() != null ? p.getPhone() : "",
                p.getLicenseNumber() != null ? p.getLicenseNumber() : "",
                p.getExperienceYears(),
                p.isVerified(),
                p.getConnectionsCount(),
                p.getCasesCount(),
                p.isActive());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            Long doctorId = tokenService.getDoctorIdFromToken(token);
            if (doctorId != null) {
                doctorRepo.findById(doctorId).ifPresent(doc -> {
                    doc.setActive(false);
                    doctorRepo.save(doc);
                });
            }
            tokenService.invalidateToken(token);
        }
        return ResponseEntity.ok(Map.of("message", "Successfully signed out"));
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty())
            return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
