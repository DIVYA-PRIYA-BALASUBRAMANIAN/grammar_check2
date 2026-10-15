package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "campaign_events", indexes = {
    @Index(name = "idx_event_campaign", columnList = "campaignId"),
    @Index(name = "idx_event_date", columnList = "eventDate"),
    @Index(name = "idx_event_campaign_type", columnList = "campaignId, eventType"),
    @Index(name = "idx_event_dedup", columnList = "campaignId, eventType, userIp, eventDate")
})
public class CampaignEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long campaignId;

    @Column(nullable = false)
    private String eventType; // "VIEW" or "CLICK"

    private String userIp;

    private String sessionId;

    @Column(length = 500)
    private String userAgent;

    @Column(nullable = false)
    private LocalDate eventDate = LocalDate.now();

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public CampaignEvent() {}

    public CampaignEvent(Long campaignId, String eventType, String userIp, String sessionId, String userAgent) {
        this.campaignId = campaignId;
        this.eventType = eventType;
        this.userIp = userIp;
        this.sessionId = sessionId;
        this.userAgent = userAgent;
        this.eventDate = LocalDate.now();
        this.timestamp = LocalDateTime.now();
    }

    public CampaignEvent(Long campaignId, String eventType, String userIp, String sessionId, String userAgent, LocalDate date) {
        this.campaignId = campaignId;
        this.eventType = eventType;
        this.userIp = userIp;
        this.sessionId = sessionId;
        this.userAgent = userAgent;
        this.eventDate = date != null ? date : LocalDate.now();
        this.timestamp = date != null ? date.atTime(12, 0) : LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(Long campaignId) {
        this.campaignId = campaignId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getUserIp() {
        return userIp;
    }

    public void setUserIp(String userIp) {
        this.userIp = userIp;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
