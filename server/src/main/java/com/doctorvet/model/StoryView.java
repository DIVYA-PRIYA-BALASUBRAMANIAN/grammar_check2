package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "story_views", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"storyId", "viewerDoctorId"})
})
public class StoryView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long storyId;

    @Column(nullable = false)
    private Long viewerDoctorId;

    private String viewerDoctorName;
    private String viewerDoctorAvatar;
    private String viewerSpecialty;

    private LocalDateTime viewedAt = LocalDateTime.now();

    public StoryView() {}

    public StoryView(Long storyId, Long viewerDoctorId, String viewerDoctorName, String viewerDoctorAvatar, String viewerSpecialty) {
        this.storyId = storyId;
        this.viewerDoctorId = viewerDoctorId;
        this.viewerDoctorName = viewerDoctorName;
        this.viewerDoctorAvatar = viewerDoctorAvatar;
        this.viewerSpecialty = viewerSpecialty;
        this.viewedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStoryId() { return storyId; }
    public void setStoryId(Long storyId) { this.storyId = storyId; }

    public Long getViewerDoctorId() { return viewerDoctorId; }
    public void setViewerDoctorId(Long viewerDoctorId) { this.viewerDoctorId = viewerDoctorId; }

    public String getViewerDoctorName() { return viewerDoctorName; }
    public void setViewerDoctorName(String viewerDoctorName) { this.viewerDoctorName = viewerDoctorName; }

    public String getViewerDoctorAvatar() { return viewerDoctorAvatar; }
    public void setViewerDoctorAvatar(String viewerDoctorAvatar) { this.viewerDoctorAvatar = viewerDoctorAvatar; }

    public String getViewerSpecialty() { return viewerSpecialty; }
    public void setViewerSpecialty(String viewerSpecialty) { this.viewerSpecialty = viewerSpecialty; }

    public LocalDateTime getViewedAt() { return viewedAt; }
    public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }
}
