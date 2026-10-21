package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_posts")
public class CommunityPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long communityId;

    private Long authorId;
    private String authorName;

    @Column(columnDefinition = "LONGTEXT")
    private String authorAvatar;

    private String authorSpecialty;
    private String tag = "Clinical Discussion";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    private Integer likes = 0;
    private LocalDateTime createdAt = LocalDateTime.now();

    public CommunityPost() {}

    public CommunityPost(Long communityId, Long authorId, String authorName, String authorAvatar,
                         String authorSpecialty, String tag, String content, String imageUrl) {
        this.communityId = communityId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorAvatar = authorAvatar;
        this.authorSpecialty = authorSpecialty;
        this.tag = tag != null ? tag : "Clinical Discussion";
        this.content = content;
        this.imageUrl = imageUrl;
        this.likes = 0;
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

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getAuthorSpecialty() { return authorSpecialty; }
    public void setAuthorSpecialty(String authorSpecialty) { this.authorSpecialty = authorSpecialty; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getLikes() { return likes != null ? likes : 0; }
    public void setLikes(Integer likes) { this.likes = likes != null ? likes : 0; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
