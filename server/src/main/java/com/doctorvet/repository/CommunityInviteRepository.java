package com.doctorvet.repository;

import com.doctorvet.model.CommunityInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityInviteRepository extends JpaRepository<CommunityInvite, Long> {
    Optional<CommunityInvite> findByCommunityIdAndInviteeDoctorIdAndStatus(Long communityId, Long inviteeDoctorId, String status);
    List<CommunityInvite> findByCommunityIdAndStatus(Long communityId, String status);
    List<CommunityInvite> findByInviteeDoctorIdAndStatusOrderByCreatedAtDesc(Long inviteeDoctorId, String status);
    List<CommunityInvite> findByCommunityId(Long communityId);
    boolean existsByCommunityIdAndInviteeDoctorIdAndStatus(Long communityId, Long inviteeDoctorId, String status);
}
