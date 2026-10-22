package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.PasswordResetOtp;
import com.doctorvet.repository.AdvertiserRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.PasswordResetOtpRepository;
import com.doctorvet.security.PasswordSecurityService;
import com.doctorvet.security.TokenService;
import com.doctorvet.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

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
    private final com.doctorvet.service.DeviceSecurityService deviceSecurityService;

    @Value("${apitxt.api-key:${APITXT_API_KEY:}}")
    private String apitxtApiKey;

    @Value("${apitxt.api-url:${APITXT_API_URL:}}")
    private String apitxtApiUrl;

    public AuthController(
            DoctorProfileRepository doctorRepo,
            TokenService tokenService,
            EmailService emailService,
            PasswordResetOtpRepository otpRepo,
            PasswordSecurityService passwordSecurityService,
            AdvertiserRepository advertiserRepo,
            com.doctorvet.service.DeviceSecurityService deviceSecurityService) {
        this.doctorRepo = doctorRepo;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.otpRepo = otpRepo;
        this.passwordSecurityService = passwordSecurityService;
        this.advertiserRepo = advertiserRepo;
        this.deviceSecurityService = deviceSecurityService;
    }

    private final Map<String, ResetCodeInfo> resetCodes = new ConcurrentHashMap<>();
    private final Map<String, ResetCodeInfo> loginOtpCodes = new ConcurrentHashMap<>();

    public record ResetCodeInfo(String code, LocalDateTime expiry, Long doctorId) {
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

    public record VerifyOtpRequest(String email, String otp) {
    }

    public record VerifyResetCodeRequest(String identifier, String code) {
    }

    public record ResetPasswordRequest(String identifier, String email, String otp, String code, String newPassword) {
        public String effectiveEmailOrIdentifier() {
            if (email != null && !email.isBlank()) return email;
            if (identifier != null && !identifier.isBlank()) return identifier;
            return "";
        }
        public String effectiveCode() {
            if (otp != null && !otp.isBlank()) return otp;
            if (code != null && !code.isBlank()) return code;
            return "";
        }
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
    public ResponseEntity<?> login(@RequestBody LoginRequest req, jakarta.servlet.http.HttpServletRequest request) {
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

        // Check password if doctor already has a password set
        if (profile != null && profile.getPasswordHash() != null && !profile.getPasswordHash().isBlank()) {
            if (req.password() == null || req.password().isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Password is required to sign in."));
            }
            if (!passwordSecurityService.verifyPassword(req.password().trim(), profile.getPasswordHash())) {
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
            newDoc.setEmail(req.identifier().contains("@") ? req.identifier().trim() : null);
            if (req.password() != null && !req.password().isBlank()) {
                newDoc.setPasswordHash(passwordSecurityService.hashPassword(req.password().trim()));
            }
            newDoc.setActive(true);
            profile = doctorRepo.save(newDoc);

            if (profile.getEmail() != null && !profile.getEmail().isBlank()) {
                emailService.sendDoctorWelcomeEmail(profile.getEmail(), profile.getName(), profile.getSpecialty());
            }
        } else {
            // If legacy account has no password set yet, set it on first successful login
            if ((profile.getPasswordHash() == null || profile.getPasswordHash().isBlank())
                    && req.password() != null && !req.password().isBlank()) {
                profile.setPasswordHash(passwordSecurityService.hashPassword(req.password().trim()));
            }
            profile.setActive(true);
            profile = doctorRepo.save(profile);
        }

        // Generate signed token
        String token = tokenService.generateToken(profile.getId(), profile.getName(), profile.getEmail());

        // Check if login is from another device and dispatch security alert email from no-reply@zenvevet.com
        if (profile.getEmail() != null && !profile.getEmail().isBlank()) {
            deviceSecurityService.checkAndRecordDevice(profile.getEmail(), profile.getName(), "DOCTOR", profile.getId(), request);
        }

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
            newDoctor.setPasswordHash(passwordSecurityService.hashPassword(req.password().trim()));
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
     * Also supports mobile dispatch if a mobile number is registered.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (req.identifier() == null || req.identifier().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter your registered email address or mobile number."));
        }

        String rawSearch = req.identifier().trim();
        String search = rawSearch.toLowerCase();
        String cleanPhone = rawSearch.replaceAll("[^0-9]", "");

        // 1. Look up doctor profile
        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
                        || (d.getPhone() != null && !cleanPhone.isBlank()
                                && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                        || (d.getName() != null && d.getName().toLowerCase().contains(search))
                        || (d.getName() != null && search.contains(d.getName().toLowerCase())))
                .findFirst();

        String recipientEmail = null;
        String recipientName = "Zenve Vet Practitioner";
        DoctorProfile doc = docOpt.orElse(null);

        if (doc != null) {
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

        if (doc == null && (recipientEmail == null || recipientEmail.isBlank())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No account found matching '" + req.identifier() + "'. Please check your credentials or register a new account."));
        }

        // Generate 6-digit OTP
        int randomCode = 100000 + new SecureRandom().nextInt(900000);
        String otpCode = String.valueOf(randomCode);

        // A. Send OTP to registered email from no-reply@zenvevet.com if email is available
        if (recipientEmail != null && !recipientEmail.isBlank()) {
            String lowerEmail = recipientEmail.trim().toLowerCase();
            List<PasswordResetOtp> existingOtps = otpRepo.findAllByEmailIgnoreCase(lowerEmail);
            for (PasswordResetOtp otp : existingOtps) {
                if (!otp.isUsed()) {
                    otp.setUsed(true);
                }
            }
            otpRepo.saveAll(existingOtps);

            PasswordResetOtp newOtp = new PasswordResetOtp(lowerEmail, otpCode, LocalDateTime.now().plusMinutes(10));
            otpRepo.save(newOtp);

            // Send automated email from no-reply@zenvevet.com
            emailService.sendPasswordResetOtpEmail(lowerEmail, recipientName, otpCode, 10);
        }

        // B. Also cache in resetCodes map for phone / mobile support
        if (doc != null) {
            String key = (doc.getEmail() != null && !doc.getEmail().isBlank()) ? doc.getEmail().toLowerCase() : doc.getId().toString();
            resetCodes.put(key, new ResetCodeInfo(otpCode, LocalDateTime.now().plusMinutes(15), doc.getId()));
            if (doc.getPhone() != null && !doc.getPhone().isBlank()) {
                String digits = doc.getPhone().replaceAll("[^0-9]", "");
                if (digits.length() >= 10) {
                    resetCodes.put(digits, new ResetCodeInfo(otpCode, LocalDateTime.now().plusMinutes(15), doc.getId()));
                    sendApitxtOtp(digits, otpCode);
                }
            }
        }

        String maskedEmailStr = recipientEmail != null ? maskEmail(recipientEmail) : "";
        String phoneStr = (doc != null && doc.getPhone() != null) ? maskPhoneNumber(doc.getPhone()) : "";

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "A 6-digit verification code (OTP) has been dispatched from no-reply@zenvevet.com to your registered email.",
                "maskedEmail", maskedEmailStr,
                "email", recipientEmail != null ? recipientEmail : "",
                "doctorName", recipientName,
                "registeredPhoneMasked", phoneStr,
                "sender", "no-reply@zenvevet.com",
                "expiresInMinutes", 10
        ));
    }

    /**
     * Step 2: Verify OTP (supports /verify-otp and /verify-code)
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        return performOtpVerification(req.email(), req.otp());
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyResetCodeRequest req) {
        return performOtpVerification(req.identifier(), req.code());
    }

    private ResponseEntity<?> performOtpVerification(String identifier, String inputOtp) {
        if (identifier == null || identifier.isBlank() || inputOtp == null || inputOtp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email/Identifier and OTP code are required."));
        }

        String search = identifier.trim().toLowerCase();
        String cleanPhone = search.replaceAll("[^0-9]", "");
        String cleanCode = inputOtp.trim();

        // Resolve doctor email if identifier is doctor name or phone number
        String tempOtpEmail = search.contains("@") ? search : null;
        if (tempOtpEmail == null) {
            Optional<DoctorProfile> docMatch = doctorRepo.findAll().stream()
                    .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
                            || (d.getPhone() != null && !cleanPhone.isBlank()
                                    && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                            || (d.getName() != null && d.getName().toLowerCase().contains(search)))
                    .findFirst();
            if (docMatch.isPresent() && docMatch.get().getEmail() != null) {
                tempOtpEmail = docMatch.get().getEmail().toLowerCase().trim();
            }
        }
        final String resolvedEmail = tempOtpEmail;

        // 1. Try DB-backed email OTP record
        Optional<PasswordResetOtp> otpOpt = Optional.empty();
        if (resolvedEmail != null) {
            otpOpt = otpRepo.findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(resolvedEmail);
        }
        if (otpOpt.isEmpty()) {
            otpOpt = otpRepo.findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(search);
        }

        if (otpOpt.isPresent()) {
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
            if (otpRecord.getOtp().equals(cleanCode)) {
                return ResponseEntity.ok(Map.of("valid", true, "success", true, "message", "OTP verified successfully. You may now set your new password."));
            }
        }

        // 2. Check memory map fallback (for mobile OTP)
        ResetCodeInfo info = resetCodes.get(search);
        if (info == null && resolvedEmail != null) info = resetCodes.get(resolvedEmail);
        if (info == null && !cleanPhone.isBlank()) info = resetCodes.get(cleanPhone);

        if (info != null) {
            if (info.expiry().isBefore(LocalDateTime.now())) {
                resetCodes.remove(search);
                if (resolvedEmail != null) resetCodes.remove(resolvedEmail);
                if (!cleanPhone.isBlank()) resetCodes.remove(cleanPhone);
                return ResponseEntity.badRequest().body(Map.of("message", "Verification code has expired. Please request a new code."));
            }
            if (info.code().equals(cleanCode)) {
                return ResponseEntity.ok(Map.of("valid", true, "success", true, "message", "Verification code confirmed successfully."));
            }
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification code. Please check your email and try again."));
    }

    /**
     * Step 3: Reset Password -> Updates password, marks OTP used, and dispatches confirmation email from no-reply@zenvevet.com
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        String identifier = req.effectiveEmailOrIdentifier();
        String inputOtp = req.effectiveCode();
        String newPassword = req.newPassword();

        if (identifier.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address or identifier is required."));
        }
        if (inputOtp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code (OTP) is required."));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters long."));
        }

        String search = identifier.trim().toLowerCase();
        String cleanPhone = search.replaceAll("[^0-9]", "");
        String cleanCode = inputOtp.trim();

        // Resolve doctor email if identifier is doctor name or phone number
        String tempResetEmail = search.contains("@") ? search : null;
        if (tempResetEmail == null) {
            Optional<DoctorProfile> docMatch = doctorRepo.findAll().stream()
                    .filter(d -> (d.getEmail() != null && d.getEmail().toLowerCase().equals(search))
                            || (d.getPhone() != null && !cleanPhone.isBlank()
                                    && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                            || (d.getName() != null && d.getName().toLowerCase().contains(search)))
                    .findFirst();
            if (docMatch.isPresent() && docMatch.get().getEmail() != null) {
                tempResetEmail = docMatch.get().getEmail().toLowerCase().trim();
            }
        }
        final String resolvedEmail = tempResetEmail;

        // 1. Verify OTP in DB
        boolean otpVerified = false;
        Optional<PasswordResetOtp> otpOpt = Optional.empty();
        if (resolvedEmail != null) {
            otpOpt = otpRepo.findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(resolvedEmail);
        }
        if (otpOpt.isEmpty()) {
            otpOpt = otpRepo.findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(search);
        }

        if (otpOpt.isPresent()) {
            PasswordResetOtp otpRecord = otpOpt.get();
            if (!otpRecord.isExpired() && otpRecord.getOtp().equals(cleanCode)) {
                otpRecord.setUsed(true);
                otpRepo.save(otpRecord);
                otpVerified = true;
            }
        }

        // 2. Or check memory map fallback
        if (!otpVerified) {
            ResetCodeInfo info = resetCodes.get(search);
            if (info == null && resolvedEmail != null) info = resetCodes.get(resolvedEmail);
            if (info == null && !cleanPhone.isBlank()) info = resetCodes.get(cleanPhone);

            if (info != null && !info.expiry().isBefore(LocalDateTime.now()) && info.code().equals(cleanCode)) {
                resetCodes.remove(search);
                if (resolvedEmail != null) resetCodes.remove(resolvedEmail);
                if (!cleanPhone.isBlank()) resetCodes.remove(cleanPhone);
                otpVerified = true;
            }
        }

        if (!otpVerified) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired verification code. Please request a new OTP."));
        }

        String newPasswordHash = passwordSecurityService.hashPassword(newPassword.trim());
        boolean accountUpdated = false;
        String userName = "Zenve Vet Practitioner";
        String recipientEmail = null;
        DoctorProfile savedDoctor = null;

        // Update Doctor account
        Optional<DoctorProfile> docOpt = doctorRepo.findAll().stream()
                .filter(d -> (d.getEmail() != null && (d.getEmail().toLowerCase().equals(search) || (resolvedEmail != null && d.getEmail().toLowerCase().equals(resolvedEmail))))
                        || (d.getPhone() != null && !cleanPhone.isBlank()
                                && d.getPhone().replaceAll("[^0-9]", "").contains(cleanPhone))
                        || (d.getName() != null && d.getName().toLowerCase().contains(search)))
                .findFirst();

        if (docOpt.isPresent()) {
            DoctorProfile doc = docOpt.get();
            doc.setPasswordHash(newPasswordHash);
            savedDoctor = doctorRepo.save(doc);
            tokenService.invalidateAllForDoctor(doc.getId());
            userName = doc.getName();
            recipientEmail = doc.getEmail();
            accountUpdated = true;
        }

        // Update Advertiser account if present
        var advOpt = advertiserRepo.findByBusinessEmailIgnoreCase(resolvedEmail != null ? resolvedEmail : search);
        if (advOpt.isPresent()) {
            var adv = advOpt.get();
            adv.setPassword(newPasswordHash);
            advertiserRepo.save(adv);
            if (!accountUpdated) {
                userName = adv.getFullName() != null ? adv.getFullName() : adv.getCompanyName();
                recipientEmail = adv.getBusinessEmail();
                accountUpdated = true;
            }
        }

        if (!accountUpdated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Could not locate account records for " + search));
        }

        // Send confirmation email: "Your password has been changed" from no-reply@zenvevet.com
        if (recipientEmail != null && !recipientEmail.isBlank()) {
            emailService.sendPasswordChangedSuccessEmail(recipientEmail, userName);
        }

        String token = (savedDoctor != null)
                ? tokenService.generateToken(savedDoctor.getId(), savedDoctor.getName(), savedDoctor.getEmail())
                : "";

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Your password has been changed successfully! A confirmation notice has been sent to your email from no-reply@zenvevet.com.",
                "sender", "no-reply@zenvevet.com",
                "token", token
        ));
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

            client.sendAsync(request, java.net.http.HttpResponse.BodyHandlers.ofString());
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
        loginOtpCodes.put(last10, new ResetCodeInfo(code, LocalDateTime.now().plusMinutes(10), doc.getId()));

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
    public ResponseEntity<?> loginWithOtp(@RequestBody LoginWithOtpRequest req, jakarta.servlet.http.HttpServletRequest request) {
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

        if (info.expiry().isBefore(LocalDateTime.now())) {
            loginOtpCodes.remove(last10);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Login OTP code has expired. Please request a new code."));
        }

        if (!info.code().equals(req.code().trim())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid verification code. Please check and try again."));
        }

        loginOtpCodes.remove(last10);

        Optional<DoctorProfile> profileOpt = doctorRepo.findById(info.doctorId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Doctor account not found."));
        }

        DoctorProfile profile = profileOpt.get();
        profile.setActive(true);
        DoctorProfile saved = doctorRepo.save(profile);

        String token = tokenService.generateToken(saved.getId(), saved.getName(), saved.getEmail());

        // Check if login is from another device and dispatch security alert email from no-reply@zenvevet.com
        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            deviceSecurityService.checkAndRecordDevice(saved.getEmail(), saved.getName(), "DOCTOR", saved.getId(), request);
        }

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

    private String maskPhoneNumber(String phone) {
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() < 4)
            return digits;
        String last4 = digits.substring(digits.length() - 4);
        return "+91 ******" + last4;
    }
}
