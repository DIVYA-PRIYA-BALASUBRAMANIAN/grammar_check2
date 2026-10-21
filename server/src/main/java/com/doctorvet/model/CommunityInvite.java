package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_invites")
public class CommunityInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long communityId;

    private String communityName;

    private Long inviterId;
    private String inviterName;

    @Column(columnDefinition = "LONGTEXT")
    private String inviterAvatar;

    @Column(nullable = false)
    private Long inviteeDoctorId;

    private String inviteeName;

    @Column(columnDefinition = "LONGTEXT")
    private String inviteeAvatar;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED

    private LocalDateTime createdAt = LocalDateTime.now();

    public CommunityInvite() {}

    public CommunityInvite(Long communityId, String communityName, Long inviterId, String inviterName,
                           String inviterAvatar, Long inviteeDoctorId, String inviteeName, String inviteeAvatar) {
        this.communityId = communityId;
        this.communityName = communityName;
        this.inviterId = inviterId;
        this.inviterName = inviterName;
        this.inviterAvatar = inviterAvatar;
        this.inviteeDoctorId = inviteeDoctorId;
        this.inviteeName = inviteeName;
        this.inviteeAvatar = inviteeAvatar;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public String getCommunityName() { return communityName; }
    public void setCommunityName(String communityName) { this.communityName = communityName; }

    public Long getInviterId() { return inviterId; }
    public void setInviterId(Long inviterId) { this.inviterId = inviterId; }

    public String getInviterName() { return inviterName; }
    public void setInviterName(String inviterName) { this.inviterName = inviterName; }

    public String getInviterAvatar() { return inviterAvatar; }
    public void setInviterAvatar(String inviterAvatar) { this.inviterAvatar = inviterAvatar; }

    public Long getInviteeDoctorId() { return inviteeDoctorId; }
    public void setInviteeDoctorId(Long inviteeDoctorId) { this.inviteeDoctorId = inviteeDoctorId; }

    public String getInviteeName() { return inviteeName; }
    public void setInviteeName(String inviteeName) { this.inviteeName = inviteeName; }

    public String getInviteeAvatar() { return inviteeAvatar; }
    public void setInviteeAvatar(String inviteeAvatar) { this.inviteeAvatar = inviteeAvatar; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
