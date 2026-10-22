package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.PasswordResetOtp;
import com.doctorvet.repository.AdvertiserRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.PasswordResetOtpRepository;
import com.doctorvet.security.PasswordSecurityService;
import com.doctorvet.security.TokenService;
import com.doctorvet.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(originPatterns = "*")
public class AuthController {

    private final DoctorProfileRepository doctorRepo;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordResetOtpRepository otpRepo;
    private final PasswordSecurityService passwordSecurityService;
    private final AdvertiserRepository advertiserRepo;

    public AuthController(
            DoctorProfileRepository doctorRepo,
            TokenService tokenService,
            EmailService emailService,
            PasswordResetOtpRepository otpRepo,
            PasswordSecurityService passwordSecurityService,
            AdvertiserRepository advertiserRepo) {
        this.doctorRepo = doctorRepo;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.otpRepo = otpRepo;
        this.passwordSecurityService = passwordSecurityService;
        this.advertiserRepo = advertiserRepo;
    }

    public record LoginRequest(String identifier, String password) {
    }

    public record RegisterRequest(String name, String email, String password,
            String vciNumber, String specialty, String city, String state, String phone) {
    }

    public record ForgotPasswordRequest(String identifier) {
    }

    public record VerifyOtpRequest(String email, String otp) {
    }

    public record ResetPasswordRequest(String email, String otp, String newPassword) {
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
                        || (d.getName() != null && d.getName().toLowerCase().contains(search))
                        || (d.getName() != null && search.contains(d.getName().toLowerCase())))
                .findFirst();

        DoctorProfile profile = docOpt.orElse(null);

        // If not found, create new doctor profile
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
            newDoc.setEmail(req.identifier().contains("@") ? req.identifier().trim() : null);
            if (req.password() != null && !req.password().isBlank()) {
                newDoc.setPasswordHash(passwordSecurityService.hashPassword(req.password()));
            }
            newDoc.setActive(true);
            profile = doctorRepo.save(newDoc);

            if (profile.getEmail() != null && !profile.getEmail().isBlank()) {
                emailService.sendDoctorWelcomeEmail(profile.getEmail(), profile.getName(), profile.getSpecialty());
            }
        } else {
            // Verify password if set
            if (profile.getPasswordHash() != null && !profile.getPasswordHash().isBlank()) {
                if (req.password() == null || !passwordSecurityService.verifyPassword(req.password(), profile.getPasswordHash())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Incorrect password. Please verify your password or use 'Forgot Password?'."));
                }
            } else if (req.password() != null && !req.password().isBlank()) {
                // First-time password set for legacy accounts
                profile.setPasswordHash(passwordSecurityService.hashPassword(req.password()));
            }
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
        if (req.email() != null && !req.email().isBlank()) {
            Optional<DoctorProfile> existing = doctorRepo.findByEmailIgnoreCase(req.email().trim());
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "An account with this email address already exists. Please sign in or reset your password."));
            }
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
        newDoctor.setEmail(req.email() != null ? req.email().trim() : null);
        newDoctor.setPhone(req.phone() != null ? req.phone().trim() : null);
        if (req.password() != null && !req.password().isBlank()) {
            newDoctor.setPasswordHash(passwordSecurityService.hashPassword(req.password()));
        }
        newDoctor.setActive(true);
        DoctorProfile saved = doctorRepo.save(newDoctor);

        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            emailService.sendDoctorWelcomeEmail(saved.getEmail(), saved.getName(), saved.getSpecialty());
        }

        String token = tokenService.generateToken(saved.getId(), saved.getName(), saved.getEmail());

        return ResponseEntity.ok(toAuthResponse(token, saved));
    }

    /**
     * Step 1: User Forgot Password -> Dispatches 6-digit OTP from no-reply@zenvevet.com to registered email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (req.identifier() == null || req.identifier().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter your registered email address or phone number."));
        }

        String search = req.identifier().trim().toLowerCase();
        String cleanPhone = search.replaceAll("[^0-9]", "");

        // 1. Look up doctor profile
        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
                        || (d.getPhone() != null && !cleanPhone.isBlank()
                                && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                        || (d.getName() != null && d.getName().toLowerCase().contains(search)))
                .findFirst();

        String recipientEmail = null;
        String recipientName = "Zenve Vet Practitioner";

        if (docOpt.isPresent()) {
            DoctorProfile doc = docOpt.get();
            recipientEmail = doc.getEmail();
            recipientName = doc.getName();
        } else {
            // Check advertiser
            var advOpt = advertiserRepo.findByBusinessEmailIgnoreCase(search);
            if (advOpt.isPresent()) {
                var adv = advOpt.get();
                recipientEmail = adv.getBusinessEmail();
                recipientName = adv.getFullName() != null ? adv.getFullName() : adv.getCompanyName();
            }
        }

        if (recipientEmail == null || recipientEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No account found matching '" + req.identifier() + "'. Please check your credentials or register a new account."));
        }

        recipientEmail = recipientEmail.trim().toLowerCase();

        // 2. Generate 6-digit OTP
        int randomCode = 100000 + new SecureRandom().nextInt(900000);
        String otpCode = String.valueOf(randomCode);

        // 3. Invalidate previous unused OTPs for this email
        List<PasswordResetOtp> existingOtps = otpRepo.findAllByEmailIgnoreCase(recipientEmail);
        for (PasswordResetOtp otp : existingOtps) {
            if (!otp.isUsed()) {
                otp.setUsed(true);
            }
        }
        otpRepo.saveAll(existingOtps);

        // 4. Save new OTP with 10-minute expiry
        PasswordResetOtp newOtp = new PasswordResetOtp(recipientEmail, otpCode, LocalDateTime.now().plusMinutes(10));
        otpRepo.save(newOtp);

        // 5. Send automated email from no-reply@zenvevet.com
        emailService.sendPasswordResetOtpEmail(recipientEmail, recipientName, otpCode, 10);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "A 6-digit verification code (OTP) has been dispatched from no-reply@zenvevet.com to your registered email.",
                "maskedEmail", maskEmail(recipientEmail),
                "email", recipientEmail,
                "sender", "no-reply@zenvevet.com"
        ));
    }

    /**
     * Step 2: Verify OTP
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        if (req.email() == null || req.email().isBlank() || req.otp() == null || req.otp().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP code are required."));
        }

        String email = req.email().trim().toLowerCase();
        String inputOtp = req.otp().trim();

        Optional<PasswordResetOtp> otpOpt = otpRepo.findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(email);
        if (otpOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No active verification code found. Please request a new OTP."));
        }

        PasswordResetOtp otpRecord = otpOpt.get();

        if (otpRecord.isExpired()) {
            otpRecord.setUsed(true);
            otpRepo.save(otpRecord);
            return ResponseEntity.badRequest().body(Map.of("message", "This OTP verification code has expired. Please request a new code."));
        }

        otpRecord.setAttemptCount(otpRecord.getAttemptCount() + 1);
        if (otpRecord.getAttemptCount() > 5) {
            otpRecord.setUsed(true);
            otpRepo.save(otpRecord);
            return ResponseEntity.badRequest().body(Map.of("message", "Too many invalid attempts. This OTP has been voided. Please request a new one."));
        }

        if (!otpRecord.getOtp().equals(inputOtp)) {
            otpRepo.save(otpRecord);
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification code. Please check your email and try again."));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "message", "OTP verified successfully. You may now set your new password."
        ));
    }

    /**
     * Step 3: Reset Password -> Updates password, marks OTP used, and dispatches confirmation email from no-reply@zenvevet.com
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.email() == null || req.email().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address is required."));
        }
        if (req.otp() == null || req.otp().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code (OTP) is required."));
        }
        if (req.newPassword() == null || req.newPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters long."));
        }

        String email = req.email().trim().toLowerCase();
        String inputOtp = req.otp().trim();

        Optional<PasswordResetOtp> otpOpt = otpRepo.findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(email);
        if (otpOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No active verification code found. Please request a new OTP."));
        }

        PasswordResetOtp otpRecord = otpOpt.get();

        if (otpRecord.isExpired()) {
            otpRecord.setUsed(true);
            otpRepo.save(otpRecord);
            return ResponseEntity.badRequest().body(Map.of("message", "This OTP verification code has expired. Please request a new code."));
        }

        if (!otpRecord.getOtp().equals(inputOtp)) {
            otpRecord.setAttemptCount(otpRecord.getAttemptCount() + 1);
            otpRepo.save(otpRecord);
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification code. Please request a new OTP."));
        }

        // Mark OTP as used immediately to prevent replay
        otpRecord.setUsed(true);
        otpRepo.save(otpRecord);

        String newPasswordHash = passwordSecurityService.hashPassword(req.newPassword());
        boolean accountUpdated = false;
        String userName = "Zenve Vet Practitioner";

        // Update Doctor account
        Optional<DoctorProfile> docOpt = doctorRepo.findByEmailIgnoreCase(email);
        if (docOpt.isPresent()) {
            DoctorProfile doc = docOpt.get();
            doc.setPasswordHash(newPasswordHash);
            doctorRepo.save(doc);
            tokenService.invalidateAllForDoctor(doc.getId());
            userName = doc.getName();
            accountUpdated = true;
        }

        // Update Advertiser account if present
        var advOpt = advertiserRepo.findByBusinessEmailIgnoreCase(email);
        if (advOpt.isPresent()) {
            var adv = advOpt.get();
            adv.setPasswordHash(newPasswordHash);
            advertiserRepo.save(adv);
            if (!accountUpdated) {
                userName = adv.getFullName() != null ? adv.getFullName() : adv.getCompanyName();
                accountUpdated = true;
            }
        }

        if (!accountUpdated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Could not locate account records for " + email));
        }

        // Send confirmation email: "Your password has been changed" from no-reply@zenvevet.com
        emailService.sendPasswordChangedSuccessEmail(email, userName);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Your password has been changed successfully! A confirmation notice has been sent to your email from no-reply@zenvevet.com.",
                "sender", "no-reply@zenvevet.com"
        ));
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

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }
}
