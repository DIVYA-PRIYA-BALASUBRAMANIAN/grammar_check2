package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_reels")
public class CommunityReel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long communityId;

    private Long authorId;
    private String authorName;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String videoUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String thumbnail;

    private String duration = "0:45";
    private Integer views = 1;
    private LocalDateTime createdAt = LocalDateTime.now();

    public CommunityReel() {}

    public CommunityReel(Long communityId, Long authorId, String authorName, String title,
                         String videoUrl, String thumbnail, String duration) {
        this.communityId = communityId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.title = title;
        this.videoUrl = videoUrl;
        this.thumbnail = thumbnail;
        this.duration = duration != null ? duration : "0:45";
        this.views = 1;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Integer getViews() { return views != null ? views : 1; }
    public void setViews(Integer views) { this.views = views != null ? views : 1; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
