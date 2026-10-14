package com.doctorvet.security;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {

    // Secret key for HMAC signing, initialized securely
    private static final byte[] SECRET_KEY = new byte[32];
    static {
        new SecureRandom().nextBytes(SECRET_KEY);
    }

    // In-memory token store for active sessions: token -> DoctorSession
    public record DoctorSession(Long doctorId, String name, String email, long createdAt, long expiresAt) {}

    private final Map<String, DoctorSession> activeSessions = new ConcurrentHashMap<>();

    // 24 hours token validity
    private static final long EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000L;

    /**
     * Generate a signed Bearer token for a doctor.
     */
    public String generateToken(Long doctorId, String name, String email) {
        long now = System.currentTimeMillis();
        long expiresAt = now + EXPIRATION_TIME_MS;

        String payload = doctorId + ":" + (email != null ? email : "") + ":" + now + ":" + UUID.randomUUID();
        String signature = hmacSha256(payload);
        String token = "zenve_" + Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8))
                + "." + signature;

        // Store active session
        activeSessions.put(token, new DoctorSession(doctorId, name, email, now, expiresAt));
        return token;
    }

    /**
     * Validate token and check expiration.
     */
    public boolean validateToken(String token) {
        if (token == null || !token.startsWith("zenve_") || !token.contains(".")) {
            return false;
        }

        DoctorSession session = activeSessions.get(token);
        if (session == null) {
            return false;
        }

        if (System.currentTimeMillis() > session.expiresAt()) {
            activeSessions.remove(token);
            return false;
        }

        return true;
    }

    /**
     * Get the authenticated doctor's ID from token.
     */
    public Long getDoctorIdFromToken(String token) {
        if (!validateToken(token)) {
            return null;
        }
        DoctorSession session = activeSessions.get(token);
        return session != null ? session.doctorId() : null;
    }

    /**
     * Get session details.
     */
    public DoctorSession getSession(String token) {
        if (!validateToken(token)) {
            return null;
        }
        return activeSessions.get(token);
    }

    /**
     * Invalidate token on sign out.
     */
    public void invalidateToken(String token) {
        if (token != null) {
            activeSessions.remove(token);
        }
    }

    /**
     * Invalidate all sessions for a specific doctor.
     */
    public void invalidateAllForDoctor(Long doctorId) {
        if (doctorId != null) {
            activeSessions.entrySet().removeIf(entry -> entry.getValue().doctorId().equals(doctorId));
        }
    }

    private String hmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET_KEY, "HmacSHA256"));
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC-SHA256", e);
        }
    }
}
