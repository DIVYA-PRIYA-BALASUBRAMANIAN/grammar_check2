package com.doctorvet.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "campaigns", indexes = {
    @Index(name = "idx_campaign_advertiser", columnList = "advertiserId"),
    @Index(name = "idx_campaign_status", columnList = "status"),
    @Index(name = "idx_campaign_dates", columnList = "startDate, endDate")
})
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long advertiserId;

    @NotBlank(message = "Campaign title is required")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String campaignType = "Sponsored Post"; // "Sponsored Post", "Clinical Masterclass", "Product Launch", "Recruitment Spotlight", "CME Banner"

    @Column(length = 1000)
    private String posterUrl;

    @NotBlank(message = "Destination URL is required")
    @Column(nullable = false, length = 1000)
    private String destinationUrl;

    @Column(nullable = false)
    private String placement = "Feed & Clinical Cases"; // "Feed & Clinical Cases", "Short Videos Stream", "Specialist Spotlight", "CME Banner"

    @Column(nullable = false)
    private String targetAudience = "All Veterinarians"; // "All Veterinarians", "Surgeons & Specialists", "Companion Animal Practitioners", "Dairy / Farm Practitioners"

    private LocalDate startDate = LocalDate.now();

    private LocalDate endDate = LocalDate.now().plusDays(14);

    private Instant endDateTime;

    private Double dailyBudget = 2500.0;

    private Double totalBudget = 35000.0;

    @Column(nullable = false)
    private String status = "Live"; // "Draft", "Pending Review", "Approved", "Live", "Rejected", "Completed"

    @Column(nullable = false)
    private Long viewsCount = 0L;

    @Column(nullable = false)
    private Long clicksCount = 0L;

    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Campaign() {}

    public Campaign(Long advertiserId, String title, String description, String campaignType,
                    String posterUrl, String destinationUrl, String placement, String targetAudience,
                    LocalDate startDate, LocalDate endDate, Double dailyBudget, String status) {
        this.advertiserId = advertiserId;
        this.title = title;
        this.description = description;
        this.campaignType = campaignType != null ? campaignType : "Sponsored Post";
        this.posterUrl = posterUrl;
        this.destinationUrl = destinationUrl;
        this.placement = placement != null ? placement : "Feed & Clinical Cases";
        this.targetAudience = targetAudience != null ? targetAudience : "All Veterinarians";
        this.startDate = startDate != null ? startDate : LocalDate.now();
        this.endDate = endDate != null ? endDate : LocalDate.now().plusDays(14);
        this.dailyBudget = dailyBudget != null ? dailyBudget : 2500.0;
        this.status = status != null ? status : "Live";
        this.viewsCount = 0L;
        this.clicksCount = 0L;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAdvertiserId() {
        return advertiserId;
    }

    public void setAdvertiserId(Long advertiserId) {
        this.advertiserId = advertiserId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCampaignType() {
        return campaignType;
    }

    public void setCampaignType(String campaignType) {
        this.campaignType = campaignType;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getDestinationUrl() {
        return destinationUrl;
    }

    public void setDestinationUrl(String destinationUrl) {
        this.destinationUrl = destinationUrl;
    }

    public String getPlacement() {
        return placement;
    }

    public void setPlacement(String placement) {
        this.placement = placement;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Instant getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(Instant endDateTime) {
        this.endDateTime = endDateTime;
    }

    @Transient
    public boolean isExpired() {
        Instant now = Instant.now();
        if (endDateTime != null) {
            return now.isAfter(endDateTime);
        }
        if (endDate != null) {
            Instant endInstant = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
            return now.isAfter(endInstant);
        }
        return false;
    }

    public Double getDailyBudget() {
        return dailyBudget;
    }

    public void setDailyBudget(Double dailyBudget) {
        this.dailyBudget = dailyBudget;
    }

    public Double getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(Double totalBudget) {
        this.totalBudget = totalBudget;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getViewsCount() {
        return viewsCount;
    }

    public void setViewsCount(Long viewsCount) {
        this.viewsCount = viewsCount;
    }

    public Long getClicksCount() {
        return clicksCount;
    }

    public void setClicksCount(Long clicksCount) {
        this.clicksCount = clicksCount;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
