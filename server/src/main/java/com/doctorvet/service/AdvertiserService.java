package com.doctorvet.service;

import com.doctorvet.model.Advertiser;
import com.doctorvet.repository.AdvertiserRepository;
import com.doctorvet.security.TokenService;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class AdvertiserService {

    private final AdvertiserRepository advertiserRepo;
    private final TokenService tokenService;

    public AdvertiserService(AdvertiserRepository advertiserRepo, TokenService tokenService) {
        this.advertiserRepo = advertiserRepo;
        this.tokenService = tokenService;
    }

    public record RegisterDto(
            String fullName,
            String companyName,
            String businessEmail,
            String mobileNumber,
            String password,
            String accountType,
            String website,
            String logoUrl,
            boolean termsAccepted
    ) {}

    public record AuthResult(
            String token,
            Advertiser advertiser
    ) {}

    public AuthResult register(RegisterDto dto) {
        if (dto.fullName() == null || dto.fullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (dto.companyName() == null || dto.companyName().isBlank()) {
            throw new IllegalArgumentException("Company name is required");
        }
        if (dto.businessEmail() == null || dto.businessEmail().isBlank() || !dto.businessEmail().contains("@")) {
            throw new IllegalArgumentException("Valid business email is required");
        }
        if (dto.mobileNumber() == null || dto.mobileNumber().isBlank()) {
            throw new IllegalArgumentException("Mobile number is required");
        }
        if (dto.password() == null || dto.password().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        if (advertiserRepo.existsByBusinessEmailIgnoreCase(dto.businessEmail().trim())) {
            throw new IllegalArgumentException("An advertiser account with this email already exists");
        }

        String accessKey = "zenve_adv_live_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String passwordHash = hashPassword(dto.password());

        Advertiser adv = new Advertiser(
                dto.fullName().trim(),
                dto.companyName().trim(),
                dto.businessEmail().trim().toLowerCase(),
                dto.mobileNumber().trim(),
                passwordHash,
                dto.accountType() != null ? dto.accountType() : "Pharmaceutical",
                dto.website(),
                dto.logoUrl(),
                accessKey
        );
        adv.setTermsAccepted(dto.termsAccepted());

        Advertiser saved = advertiserRepo.save(adv);
        String token = tokenService.generateToken(saved.getId(), saved.getFullName(), saved.getBusinessEmail());

        return new AuthResult(token, saved);
    }

    public AuthResult login(String email, String password) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        Advertiser adv = advertiserRepo.findByBusinessEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("No advertiser account found with this email"));

        if (!verifyPassword(password, adv.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid password. Please check your credentials.");
        }

        String token = tokenService.generateToken(adv.getId(), adv.getFullName(), adv.getBusinessEmail());
        return new AuthResult(token, adv);
    }

    public AuthResult loginWithAccessKey(String accessKey) {
        if (accessKey == null || accessKey.isBlank()) {
            throw new IllegalArgumentException("Access key is required");
        }

        Advertiser adv = advertiserRepo.findByAccessKey(accessKey.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid access key"));

        String token = tokenService.generateToken(adv.getId(), adv.getFullName(), adv.getBusinessEmail());
        return new AuthResult(token, adv);
    }

    public Optional<Advertiser> getById(Long id) {
        return advertiserRepo.findById(id);
    }

    public Optional<Advertiser> getByEmail(String email) {
        return advertiserRepo.findByBusinessEmailIgnoreCase(email);
    }

    public Optional<Advertiser> getByAccessKey(String accessKey) {
        return advertiserRepo.findByAccessKey(accessKey);
    }

    public Advertiser regenerateAccessKey(Long advertiserId) {
        Advertiser adv = advertiserRepo.findById(advertiserId)
                .orElseThrow(() -> new IllegalArgumentException("Advertiser not found"));

        String newKey = "zenve_adv_live_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        adv.setAccessKey(newKey);
        return advertiserRepo.save(adv);
    }

    // Secure PBKDF2 Password Hashing
    private String hashPassword(String password) {
        try {
            byte[] salt = new byte[16];
            new SecureRandom().nextBytes(salt);

            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 128);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();

            return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    private boolean verifyPassword(String password, String storedHash) {
        try {
            if (storedHash == null || !storedHash.contains(":")) {
                // Backward-compatibility fallback for plain text in dev
                return password.equals(storedHash);
            }
            String[] parts = storedHash.split(":");
            byte[] salt = Base64.getDecoder().decode(parts[0]);
            byte[] hash = Base64.getDecoder().decode(parts[1]);

            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 128);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] testHash = factory.generateSecret(spec).getEncoded();

            int diff = hash.length ^ testHash.length;
            for (int i = 0; i < hash.length && i < testHash.length; i++) {
                diff |= hash[i] ^ testHash[i];
            }
            return diff == 0;
        } catch (Exception e) {
            return false;
        }
    }
}
