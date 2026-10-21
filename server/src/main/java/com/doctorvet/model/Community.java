package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "communities")
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String privacy = "Public Group";

    @Column(columnDefinition = "TEXT")
    private String coverGradient = "linear-gradient(135deg, #064e3b 0%, #0d9488 100%)";

    @Column(columnDefinition = "LONGTEXT")
    private String coverImage;

    private Long creatorId;
    private String creatorName;

    @Column(unique = true)
    private String inviteCode;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Community() {}

    public Community(String name, String category, String description, String privacy,
                     String coverGradient, String coverImage, Long creatorId, String creatorName, String inviteCode) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.privacy = privacy != null ? privacy : "Public Group";
        this.coverGradient = coverGradient != null ? coverGradient : "linear-gradient(135deg, #064e3b 0%, #0d9488 100%)";
        this.coverImage = coverImage;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.inviteCode = inviteCode;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPrivacy() { return privacy; }
    public void setPrivacy(String privacy) { this.privacy = privacy; }

    public String getCoverGradient() { return coverGradient; }
    public void setCoverGradient(String coverGradient) { this.coverGradient = coverGradient; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public Long getCreatorId() { return creatorId; }
    public void setCreatorId(Long creatorId) { this.creatorId = creatorId; }

    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }

    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
