package com.doctorvet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "community_post_likes",
       uniqueConstraints = @UniqueConstraint(columnNames = {"communityPostId", "doctorId"}))
public class CommunityPostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long communityPostId;

    @Column(nullable = false)
    private Long doctorId;

    public CommunityPostLike() {}

    public CommunityPostLike(Long communityPostId, Long doctorId) {
        this.communityPostId = communityPostId;
        this.doctorId = doctorId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityPostId() { return communityPostId; }
    public void setCommunityPostId(Long communityPostId) { this.communityPostId = communityPostId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
}
