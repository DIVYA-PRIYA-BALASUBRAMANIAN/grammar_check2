package com.doctorvet.service;

import com.doctorvet.model.UserLoginDevice;
import com.doctorvet.repository.UserLoginDeviceRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DeviceSecurityService {

    private static final Logger log = LoggerFactory.getLogger(DeviceSecurityService.class);

    private final UserLoginDeviceRepository deviceRepo;
    private final EmailService emailService;

    public DeviceSecurityService(UserLoginDeviceRepository deviceRepo, EmailService emailService) {
        this.deviceRepo = deviceRepo;
        this.emailService = emailService;
    }

    /**
     * Checks if the incoming login is from a new or different device.
     * If another device is detected for an existing user, dispatches an automated
     * security alert email from no-reply@zenvevet.com.
     */
    public void checkAndRecordDevice(String userEmail, String recipientName, String userRole, Long userId, HttpServletRequest request) {
        if (userEmail == null || userEmail.isBlank() || !userEmail.contains("@")) {
            return;
        }

        String email = userEmail.trim().toLowerCase();
        String userAgent = request != null ? request.getHeader("User-Agent") : "";
        String clientIp = extractClientIp(request);
        String headerDeviceId = request != null ? request.getHeader("X-Device-Id") : null;

        String deviceName = parseDeviceSummary(userAgent);
        String browser = parseBrowser(userAgent);
        String os = parseOs(userAgent);

        // Derive unique deviceId
        String deviceId = (headerDeviceId != null && !headerDeviceId.isBlank())
                ? headerDeviceId.trim()
                : generateFallbackDeviceId(userAgent, os, browser);

        try {
            Optional<UserLoginDevice> existingDeviceOpt = deviceRepo.findByUserEmailIgnoreCaseAndDeviceId(email, deviceId);

            if (existingDeviceOpt.isPresent()) {
                // Known device: update timestamp and IP
                UserLoginDevice existing = existingDeviceOpt.get();
                existing.setLastSeenAt(LocalDateTime.now());
                existing.setIpAddress(clientIp);
                if (deviceName != null && !deviceName.equals("Unknown Device / Browser")) {
                    existing.setDeviceName(deviceName);
                }
                deviceRepo.save(existing);
                log.info("[Zenve Security] Recognized device '{}' for user '{}'", deviceName, email);
            } else {
                long existingDeviceCount = deviceRepo.countByUserEmailIgnoreCase(email);

                // If user already had other registered device(s), this is a LOGIN FROM ANOTHER DEVICE
                if (existingDeviceCount > 0) {
                    log.warn("==========================================================================");
                    log.warn("[Zenve Security] ALERT: LOGIN FROM ANOTHER DEVICE DETECTED!");
                    log.warn("User: {} | Name: {} | New Device: {} | IP: {} | Sender: no-reply@zenvevet.com",
                            email, recipientName, deviceName, clientIp);
                    log.warn("==========================================================================");

                    // Dispatch alert email from no-reply@zenvevet.com
                    emailService.sendNewDeviceLoginAlertEmail(email, recipientName, deviceName, clientIp, LocalDateTime.now());
                } else {
                    log.info("[Zenve Security] Registering initial trusted device '{}' for user '{}'", deviceName, email);
                }

                // Register new device record
                UserLoginDevice newDevice = new UserLoginDevice(email, userId, userRole, deviceId, deviceName, browser, os, clientIp);
                deviceRepo.save(newDevice);
            }
        } catch (Exception e) {
            log.error("[Zenve Security] Error during device security verification: {}", e.getMessage(), e);
        }
    }

    public static String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1 (Localhost)";
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        String remote = request.getRemoteAddr();
        if (remote == null || "0:0:0:0:0:0:0:1".equals(remote) || "127.0.0.1".equals(remote)) {
            return "127.0.0.1 (Localhost)";
        }
        return remote;
    }

    public static String parseDeviceSummary(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "Web Browser / Unknown Device";
        String browser = parseBrowser(userAgent);
        String os = parseOs(userAgent);
        return browser + " on " + os;
    }

    public static String parseBrowser(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "Web Browser";
        String ua = userAgent.toLowerCase();
        if (ua.contains("edg/")) return "Microsoft Edge";
        if (ua.contains("chrome/") && !ua.contains("edg/")) return "Google Chrome";
        if (ua.contains("safari/") && !ua.contains("chrome/")) return "Apple Safari";
        if (ua.contains("firefox/")) return "Mozilla Firefox";
        if (ua.contains("opr/") || ua.contains("opera")) return "Opera";
        if (ua.contains("postman")) return "Postman API Client";
        if (ua.contains("curl")) return "cURL / Terminal";
        if (ua.contains("powershell")) return "PowerShell CLI";
        return "Web Browser";
    }

    public static String parseOs(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "Unknown OS";
        String ua = userAgent.toLowerCase();
        if (ua.contains("windows nt 10")) return "Windows 10/11";
        if (ua.contains("windows")) return "Windows PC";
        if (ua.contains("iphone")) return "Apple iPhone (iOS)";
        if (ua.contains("ipad")) return "Apple iPad (iPadOS)";
        if (ua.contains("macintosh") || ua.contains("mac os x")) return "Apple Mac (macOS)";
        if (ua.contains("android")) return "Android Device";
        if (ua.contains("linux")) return "Linux";
        return "Desktop / Mobile Device";
    }

    private String generateFallbackDeviceId(String userAgent, String os, String browser) {
        try {
            String raw = (userAgent != null ? userAgent : "") + "::" + os + "::" + browser;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder("dev_");
            for (int i = 0; i < 8; i++) {
                sb.append(String.format("%02x", hash[i]));
            }
            return sb.toString();
        } catch (Exception e) {
            return "dev_default_" + Math.abs((userAgent != null ? userAgent : "dev").hashCode());
        }
    }
}
