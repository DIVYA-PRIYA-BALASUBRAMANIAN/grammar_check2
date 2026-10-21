package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.security.TokenService;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${apitxt.api-key:${APITXT_API_KEY:}}")
    private String apitxtApiKey;

    @Value("${apitxt.api-url:${APITXT_API_URL:}}")
    private String apitxtApiUrl;

    public AuthController(DoctorProfileRepository doctorRepo, TokenService tokenService) {
        this.doctorRepo = doctorRepo;
        this.tokenService = tokenService;
    }

    private final Map<String, ResetCodeInfo> resetCodes = new java.util.concurrent.ConcurrentHashMap<>();
    private final Map<String, ResetCodeInfo> loginOtpCodes = new java.util.concurrent.ConcurrentHashMap<>();

    public record ResetCodeInfo(String code, java.time.LocalDateTime expiry, Long doctorId) {
    }

    public record LoginRequest(String identifier, String password) {
    }

    public record SendLoginOtpRequest(String phone) {
    }

    public record LoginWithOtpRequest(String phone, String code) {
    }

    public record RegisterRequest(String name, String email, String password,
            String vciNumber, String specialty, String city, String state, String phone) {
    }

    public record ForgotPasswordRequest(String identifier) {
    }

    public record VerifyResetCodeRequest(String identifier, String code) {
    }

    public record ResetPasswordRequest(String identifier, String code, String newPassword) {
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

        // Check password if doctor already has a password set
        if (profile != null && profile.getPasswordHash() != null && !profile.getPasswordHash().isBlank()) {
            if (req.password() == null || req.password().isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Password is required to sign in."));
            }
            if (!profile.getPasswordHash().equals(req.password().trim())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message",
                                "Incorrect password. Please verify your credentials or use Forgot Password to reset it."));
            }
        }

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
            if (req.password() != null && !req.password().isBlank()) {
                newDoc.setPasswordHash(req.password().trim());
            }
            newDoc.setActive(true);
            profile = doctorRepo.save(newDoc);
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
        if (req.password() != null && !req.password().isBlank()) {
            newDoctor.setPasswordHash(req.password().trim());
        }
        newDoctor.setActive(true);
        DoctorProfile saved = doctorRepo.save(newDoctor);

        String token = tokenService.generateToken(saved.getId(), saved.getName(), saved.getEmail());

        return ResponseEntity.ok(toAuthResponse(token, saved));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (req.identifier() == null || req.identifier().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please enter your registered email, mobile number, or Doctor name"));
        }

        String rawSearch = req.identifier().trim();
        String search = rawSearch.toLowerCase();
        String cleanPhone = rawSearch.replaceAll("[^0-9]", "");

        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
                        || (d.getPhone() != null && !cleanPhone.isBlank()
                                && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                        || d.getName().toLowerCase().contains(search)
                        || search.contains(d.getName().toLowerCase()))
                .findFirst();

        if (docOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No registered doctor profile found matching: " + req.identifier()));
        }

        DoctorProfile doc = docOpt.get();

        // 1. Resolve registered mobile number
        String registeredPhone = doc.getPhone() != null ? doc.getPhone().replaceAll("[^0-9]", "") : "";
        if (registeredPhone.isBlank() && cleanPhone.length() >= 10) {
            registeredPhone = cleanPhone;
            doc.setPhone(cleanPhone);
            doctorRepo.save(doc);
        }

        if (registeredPhone.isBlank() || registeredPhone.length() < 10) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "No registered mobile number on record for " + doc.getName()
                            + ". Please enter your 10-digit mobile number."));
        }

        // Generate 6-digit OTP verification code
        String code = String.format("%06d", new java.util.Random().nextInt(900000) + 100000);
        String key = (doc.getEmail() != null && !doc.getEmail().isBlank()) ? doc.getEmail().toLowerCase()
                : doc.getId().toString();
        resetCodes.put(key, new ResetCodeInfo(code, java.time.LocalDateTime.now().plusMinutes(15), doc.getId()));
        resetCodes.put(registeredPhone,
                new ResetCodeInfo(code, java.time.LocalDateTime.now().plusMinutes(15), doc.getId()));
        if (!cleanPhone.isBlank()) {
            resetCodes.put(cleanPhone,
                    new ResetCodeInfo(code, java.time.LocalDateTime.now().plusMinutes(15), doc.getId()));
        }
        resetCodes.put(doc.getId().toString(),
                new ResetCodeInfo(code, java.time.LocalDateTime.now().plusMinutes(15), doc.getId()));

        // Dispatch live OTP to registered mobile number via APITXT
        sendApitxtOtp(registeredPhone, code);

        String maskedPhone = maskPhoneNumber(registeredPhone);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message",
                "A 6-digit verification code has been dispatched via APITXT to your registered mobile (" + maskedPhone
                        + ").",
                "doctorName", doc.getName(),
                "registeredPhoneMasked", maskedPhone,
                "expiresInMinutes", 15));
    }

    private String maskPhoneNumber(String phone) {
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() < 4)
            return digits;
        String last4 = digits.substring(digits.length() - 4);
        return "+91 ******" + last4;
    }

    private void sendApitxtOtp(String target, String otp) {
        String apiKey = (apitxtApiKey != null && !apitxtApiKey.isBlank())
                ? apitxtApiKey
                : (System.getenv("APITXT_API_KEY") != null ? System.getenv("APITXT_API_KEY")
                        : System.getProperty("APITXT_API_KEY"));
        String apiUrl = (apitxtApiUrl != null && !apitxtApiUrl.isBlank())
                ? apitxtApiUrl
                : (System.getenv("APITXT_API_URL") != null ? System.getenv("APITXT_API_URL")
                        : System.getProperty("APITXT_API_URL"));

        if (apiKey == null || apiKey.isBlank() || apiUrl == null || apiUrl.isBlank()) {
            System.err.println("APITXT_API_KEY or APITXT_API_URL not configured in environment.");
            return;
        }

        try {
            String rawDigits = target.replaceAll("[^0-9]", "");
            final String cleanMobile = rawDigits.length() == 10 ? "91" + rawDigits : rawDigits;

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            String formData = "authkey=" + java.net.URLEncoder.encode(apiKey, java.nio.charset.StandardCharsets.UTF_8)
                    + "&mobile=" + java.net.URLEncoder.encode(cleanMobile, java.nio.charset.StandardCharsets.UTF_8)
                    + "&otp=" + java.net.URLEncoder.encode(otp, java.nio.charset.StandardCharsets.UTF_8);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(apiUrl))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(formData))
                    .build();

            client.sendAsync(request, java.net.http.HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> System.out.println(
                            "APITXT sendOTP response for " + cleanMobile + ": " + res.statusCode() + " " + res.body()));
        } catch (Exception e) {
            System.err.println("Failed to send OTP via APITXT: " + e.getMessage());
        }
    }

    @PostMapping("/send-login-otp")
    public ResponseEntity<?> sendLoginOtp(@RequestBody SendLoginOtpRequest req) {
        if (req.phone() == null || req.phone().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please enter your registered 10-digit mobile number."));
        }

        String rawPhone = req.phone().trim();
        String cleanPhone = rawPhone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() < 10) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid 10-digit mobile number."));
        }
        String last10 = cleanPhone.substring(cleanPhone.length() - 10);

        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> d.getPhone() != null && d.getPhone().replaceAll("[^0-9]", "").endsWith(last10))
                .findFirst();

        if (docOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No registered doctor account found with mobile ending in "
                            + last10.substring(6) + ". Please check your number or register."));
        }

        DoctorProfile doc = docOpt.get();
        String code = String.format("%06d", new java.util.Random().nextInt(900000) + 100000);
        loginOtpCodes.put(last10, new ResetCodeInfo(code, java.time.LocalDateTime.now().plusMinutes(10), doc.getId()));

        sendApitxtOtp(last10, code);

        String maskedPhone = maskPhoneNumber(last10);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "A 6-digit login verification code has been dispatched via APITXT to " + maskedPhone,
                "doctorName", doc.getName(),
                "registeredPhoneMasked", maskedPhone,
                "expiresInMinutes", 10));
    }

    @PostMapping("/login-with-otp")
    public ResponseEntity<?> loginWithOtp(@RequestBody LoginWithOtpRequest req) {
        if (req.phone() == null || req.code() == null || req.code().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mobile number and 6-digit OTP code are required."));
        }

        String cleanPhone = req.phone().replaceAll("[^0-9]", "");
        if (cleanPhone.length() < 10) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid mobile number."));
        }
        String last10 = cleanPhone.substring(cleanPhone.length() - 10);

        ResetCodeInfo info = loginOtpCodes.get(last10);
        if (info == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No active login code found. Please request a new OTP."));
        }

        if (info.expiry().isBefore(java.time.LocalDateTime.now())) {
            loginOtpCodes.remove(last10);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Login OTP has expired. Please request a new OTP."));
        }

        if (!info.code().equals(req.code().trim())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid verification code. Please check and try again."));
        }

        Optional<DoctorProfile> docOpt = doctorRepo.findById(info.doctorId());
        if (docOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Doctor account not found."));
        }

        DoctorProfile doc = docOpt.get();
        doc.setActive(true);
        DoctorProfile saved = doctorRepo.save(doc);

        loginOtpCodes.remove(last10);

        String token = tokenService.generateToken(saved.getId(), saved.getName(), saved.getEmail());
        return ResponseEntity.ok(toAuthResponse(token, saved));
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyResetCodeRequest req) {
        if (req.identifier() == null || req.code() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Identifier and verification code are required"));
        }

        String search = req.identifier().trim().toLowerCase();
        String cleanPhone = search.replaceAll("[^0-9]", "");

        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
                        || (d.getPhone() != null && !cleanPhone.isBlank()
                                && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                        || d.getName().toLowerCase().contains(search)
                        || search.contains(d.getName().toLowerCase())
                        || (d.getId() != null && d.getId().toString().equals(search)))
                .findFirst();

        if (docOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Doctor account not found"));
        }

        DoctorProfile doc = docOpt.get();
        String key = (doc.getEmail() != null && !doc.getEmail().isBlank()) ? doc.getEmail().toLowerCase()
                : doc.getId().toString();
        ResetCodeInfo info = resetCodes.get(key);
        if (info == null && doc.getPhone() != null) {
            info = resetCodes.get(doc.getPhone().replaceAll("[^0-9]", ""));
        }
        if (info == null && !cleanPhone.isBlank()) {
            info = resetCodes.get(cleanPhone);
        }
        if (info == null) {
            info = resetCodes.get(doc.getId().toString());
        }

        if (info == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No active verification code found. Please request a new one."));
        }

        if (info.expiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Verification code has expired. Please request a new code."));
        }

        if (!info.code().equals(req.code().trim())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid verification code. Please check and try again."));
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Verification code confirmed successfully."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.identifier() == null || req.code() == null || req.newPassword() == null
                || req.newPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Account identifier, verification code, and new password are required"));
        }

        if (req.newPassword().trim().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "New password must be at least 6 characters long"));
        }

        String search = req.identifier().trim().toLowerCase();
        String cleanPhone = search.replaceAll("[^0-9]", "");

        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
                        || (d.getPhone() != null && !cleanPhone.isBlank()
                                && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                        || d.getName().toLowerCase().contains(search)
                        || search.contains(d.getName().toLowerCase())
                        || (d.getId() != null && d.getId().toString().equals(search)))
                .findFirst();

        if (docOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Doctor account not found"));
        }

        DoctorProfile doc = docOpt.get();
        String key = (doc.getEmail() != null && !doc.getEmail().isBlank()) ? doc.getEmail().toLowerCase()
                : doc.getId().toString();
        ResetCodeInfo info = resetCodes.get(key);
        if (info == null && doc.getPhone() != null) {
            info = resetCodes.get(doc.getPhone().replaceAll("[^0-9]", ""));
        }
        if (info == null && !cleanPhone.isBlank()) {
            info = resetCodes.get(cleanPhone);
        }
        if (info == null) {
            info = resetCodes.get(doc.getId().toString());
        }

        if (info == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No active verification code found. Please request a new one."));
        }

        if (info.expiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Verification code has expired. Please request a new code."));
        }

        if (!info.code().equals(req.code().trim())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid verification code. Please check and try again."));
        }

        // Validate that new password is NOT the same as the old password
        if (doc.getPasswordHash() != null && doc.getPasswordHash().equals(req.newPassword().trim())) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "New password cannot be the same as your old password. Please choose a different password."));
        }

        // Update password in database
        doc.setPasswordHash(req.newPassword().trim());
        DoctorProfile saved = doctorRepo.save(doc);

        // Invalidate used code
        resetCodes.remove(key);
        if (doc.getPhone() != null)
            resetCodes.remove(doc.getPhone().replaceAll("[^0-9]", ""));
        if (!cleanPhone.isBlank())
            resetCodes.remove(cleanPhone);
        resetCodes.remove(doc.getId().toString());

        String token = tokenService.generateToken(saved.getId(), saved.getName(), saved.getEmail());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset successfully! You can now sign in with your new password.",
                "token", token,
                "user", toAuthResponse(token, saved)));
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
