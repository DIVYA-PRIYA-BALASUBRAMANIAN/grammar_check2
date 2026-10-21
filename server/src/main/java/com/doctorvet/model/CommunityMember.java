package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"communityId", "doctorId"}))
public class CommunityMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long communityId;

    @Column(nullable = false)
    private Long doctorId;

    private String doctorName;
    private String role = "Member"; // "Founder & Admin" or "Member"
    private String specialty;
    private String city;

    @Column(columnDefinition = "LONGTEXT")
    private String avatar;

    private LocalDateTime joinedAt = LocalDateTime.now();

    public CommunityMember() {}

    public CommunityMember(Long communityId, Long doctorId, String doctorName, String role,
                           String specialty, String city, String avatar) {
        this.communityId = communityId;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.role = role != null ? role : "Member";
        this.specialty = specialty;
        this.city = city;
        this.avatar = avatar;
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
