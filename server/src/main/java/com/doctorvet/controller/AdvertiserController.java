package com.doctorvet.controller;

import com.doctorvet.model.Advertiser;
import com.doctorvet.security.TokenService;
import com.doctorvet.service.AdvertiserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/advertisers")
@CrossOrigin(originPatterns = "*")
public class AdvertiserController {

    private final AdvertiserService advertiserService;
    private final TokenService tokenService;
    private final com.doctorvet.service.DeviceSecurityService deviceSecurityService;

    public AdvertiserController(AdvertiserService advertiserService, TokenService tokenService, com.doctorvet.service.DeviceSecurityService deviceSecurityService) {
        this.advertiserService = advertiserService;
        this.tokenService = tokenService;
        this.deviceSecurityService = deviceSecurityService;
    }

    public record LoginReq(String email, String businessEmail, String password) {
        public String effectiveEmail() {
            return email != null && !email.isBlank() ? email : businessEmail;
        }
    }
    public record KeyLoginReq(String accessKey) {}
    public record ForgotPasswordReq(String email) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AdvertiserService.RegisterDto dto) {
        try {
            AdvertiserService.AuthResult result = advertiserService.register(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "token", result.token(),
                    "advertiser", result.advertiser()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during advertiser registration: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req, jakarta.servlet.http.HttpServletRequest request) {
        try {
            AdvertiserService.AuthResult result = advertiserService.login(req.effectiveEmail(), req.password());
            if (result.advertiser() != null && result.advertiser().getBusinessEmail() != null) {
                deviceSecurityService.checkAndRecordDevice(
                        result.advertiser().getBusinessEmail(),
                        result.advertiser().getFullName() != null ? result.advertiser().getFullName() : result.advertiser().getCompanyName(),
                        "ADVERTISER",
                        result.advertiser().getId(),
                        request
                );
            }
            return ResponseEntity.ok(Map.of(
                    "token", result.token(),
                    "advertiser", result.advertiser()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login-with-key")
    public ResponseEntity<?> loginWithKey(@RequestBody KeyLoginReq req) {
        try {
            AdvertiserService.AuthResult result = advertiserService.loginWithAccessKey(req.accessKey());
            return ResponseEntity.ok(Map.of(
                    "token", result.token(),
                    "advertiser", result.advertiser()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Advertiser-Key", required = false) String apiKey
    ) {
        // 1. Try Bearer Token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (tokenService.validateToken(token)) {
                Long advId = tokenService.getDoctorIdFromToken(token);
                if (advId != null) {
                    var advOpt = advertiserService.getById(advId);
                    if (advOpt.isPresent()) {
                        return ResponseEntity.ok(advOpt.get());
                    }
                }
            }
        }

        // 2. Try API Access Key
        if (apiKey != null && !apiKey.isBlank()) {
            var advOpt = advertiserService.getByAccessKey(apiKey.trim());
            if (advOpt.isPresent()) {
                return ResponseEntity.ok(advOpt.get());
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Advertiser session expired. Please log in."));
    }

    @PostMapping("/regenerate-key")
    public ResponseEntity<?> regenerateKey(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long advId = extractAdvertiserId(authHeader);
        if (advId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            Advertiser updated = advertiserService.regenerateAccessKey(advId);
            return ResponseEntity.ok(Map.of("accessKey", updated.getAccessKey(), "advertiser", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordReq req) {
        if (req.email() == null || req.email().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address is required"));
        }
        var advOpt = advertiserService.getByEmail(req.email().trim());
        if (advOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "If an account exists with this email, password reset instructions have been sent."));
        }
        return ResponseEntity.ok(Map.of("message", "Password reset instructions dispatched to " + req.email()));
    }

    private Long extractAdvertiserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7).trim();
        if (!tokenService.validateToken(token)) return null;
        return tokenService.getDoctorIdFromToken(token);
    }
}
