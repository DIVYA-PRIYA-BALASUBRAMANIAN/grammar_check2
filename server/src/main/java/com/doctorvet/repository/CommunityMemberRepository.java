package com.doctorvet.repository;

import com.doctorvet.model.CommunityMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {
    List<CommunityMember> findByCommunityIdOrderByJoinedAtAsc(Long communityId);
    Optional<CommunityMember> findByCommunityIdAndDoctorId(Long communityId, Long doctorId);
    boolean existsByCommunityIdAndDoctorId(Long communityId, Long doctorId);
    void deleteByCommunityIdAndDoctorId(Long communityId, Long doctorId);
}
