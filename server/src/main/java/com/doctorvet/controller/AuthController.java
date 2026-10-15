package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.security.TokenService;
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

    public AuthController(DoctorProfileRepository doctorRepo, TokenService tokenService) {
        this.doctorRepo = doctorRepo;
        this.tokenService = tokenService;
    }

    public record LoginRequest(String identifier, String password) {
    }

    public record RegisterRequest(String name, String email, String password,
            String vciNumber, String specialty, String city, String state) {
    }

    public record AuthResponse(
            String token,
            Long id,
            String name,
            String email,
            String specialty,
            String city,
            String state,
            String avatar,
            boolean verified,
            int connectionsCount,
            int casesCount) {
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.identifier() == null || req.identifier().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email or doctor name is required"));
        }

        String search = req.identifier().trim().toLowerCase();

        // 1. Try to find doctor in DB by email or name
        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
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
            profile = doctorRepo.save(newDoc);
        }

        // Generate signed token
        String token = tokenService.generateToken(profile.getId(), profile.getName(), profile.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                profile.getId(),
                profile.getName(),
                profile.getEmail() != null ? profile.getEmail() : "",
                profile.getSpecialty() != null ? profile.getSpecialty() : "Veterinary Medicine",
                profile.getCity() != null ? profile.getCity() : "Bengaluru",
                profile.getState() != null ? profile.getState() : "Karnataka",
                profile.getAvatar() != null ? profile.getAvatar() : "",
                profile.isVerified(),
                profile.getConnectionsCount(),
                profile.getCasesCount()));
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
                "Registered veterinary practitioner under VCI: "
                        + (req.vciNumber() != null ? req.vciNumber() : "VCI-REG-NEW"));
        newDoctor.setEmail(req.email() != null ? req.email() : null);
        DoctorProfile saved = doctorRepo.save(newDoctor);

        String token = tokenService.generateToken(saved.getId(), saved.getName(), saved.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                saved.getId(),
                saved.getName(),
                saved.getEmail() != null ? saved.getEmail() : "",
                saved.getSpecialty(),
                saved.getCity(),
                saved.getState(),
                saved.getAvatar(),
                saved.isVerified(),
                saved.getConnectionsCount(),
                saved.getCasesCount()));
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
        return ResponseEntity.ok(new AuthResponse(
                token,
                profile.getId(),
                profile.getName(),
                profile.getEmail() != null ? profile.getEmail() : "",
                profile.getSpecialty(),
                profile.getCity() != null ? profile.getCity() : "Bengaluru",
                profile.getState() != null ? profile.getState() : "Karnataka",
                profile.getAvatar() != null ? profile.getAvatar() : "",
                profile.isVerified(),
                profile.getConnectionsCount(),
                profile.getCasesCount()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
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
