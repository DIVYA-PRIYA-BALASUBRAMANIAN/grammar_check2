package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "short_videos")
public class ShortVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String doctorName;
    private String doctorSpecialty;
    private String views = "1.2k";
    private String duration;
    private String thumbnail;
    @Column(length = 1000)
    private String videoUrl;
    private Integer viewsCount = 0;
    private Integer likes = 0;
    private Integer comments = 0;
    private LocalDateTime createdAt = LocalDateTime.now();

    public ShortVideo() {}

    public ShortVideo(String title, String doctorName, String doctorSpecialty, String views, String duration, String thumbnail, int likes) {
        this.title = title;
        this.doctorName = doctorName;
        this.doctorSpecialty = doctorSpecialty;
        this.views = views;
        this.duration = duration;
        this.thumbnail = thumbnail;
        this.likes = likes;
    }

    public ShortVideo(String title, String doctorName, String doctorSpecialty, String views, String duration, String thumbnail, String videoUrl, int likes) {
        this.title = title;
        this.doctorName = doctorName;
        this.doctorSpecialty = doctorSpecialty;
        this.views = views;
        this.duration = duration;
        this.thumbnail = thumbnail;
        this.videoUrl = videoUrl;
        this.likes = likes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorSpecialty() { return doctorSpecialty; }
    public void setDoctorSpecialty(String doctorSpecialty) { this.doctorSpecialty = doctorSpecialty; }

    public String getViews() { return views; }
    public void setViews(String views) { this.views = views; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public int getViewsCount() { return viewsCount; }
    public void setViewsCount(int viewsCount) { this.viewsCount = viewsCount; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public int getComments() { return comments; }
    public void setComments(int comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
