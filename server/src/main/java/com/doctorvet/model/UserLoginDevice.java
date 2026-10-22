package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_login_devices", indexes = {
    @Index(name = "idx_user_email", columnList = "user_email"),
    @Index(name = "idx_user_device", columnList = "user_email, device_id")
})
public class UserLoginDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_role")
    private String userRole = "DOCTOR";

    @Column(name = "device_id", nullable = false, length = 100)
    private String deviceId;

    @Column(name = "device_name", nullable = false)
    private String deviceName;

    @Column(name = "browser")
    private String browser;

    @Column(name = "os")
    private String os;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "first_seen_at", nullable = false)
    private LocalDateTime firstSeenAt = LocalDateTime.now();

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt = LocalDateTime.now();

    public UserLoginDevice() {}

    public UserLoginDevice(String userEmail, Long userId, String userRole, String deviceId,
                           String deviceName, String browser, String os, String ipAddress) {
        this.userEmail = userEmail != null ? userEmail.trim().toLowerCase() : "";
        this.userId = userId;
        this.userRole = userRole != null ? userRole : "DOCTOR";
        this.deviceId = deviceId != null ? deviceId.trim() : "default";
        this.deviceName = deviceName != null ? deviceName : "Unknown Device";
        this.browser = browser;
        this.os = os;
        this.ipAddress = ipAddress;
        this.firstSeenAt = LocalDateTime.now();
        this.lastSeenAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail != null ? userEmail.trim().toLowerCase() : "";
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getBrowser() { return browser; }
    public void setBrowser(String browser) { this.browser = browser; }

    public String getOs() { return os; }
    public void setOs(String os) { this.os = os; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getFirstSeenAt() { return firstSeenAt; }
    public void setFirstSeenAt(LocalDateTime firstSeenAt) { this.firstSeenAt = firstSeenAt; }

    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
}
