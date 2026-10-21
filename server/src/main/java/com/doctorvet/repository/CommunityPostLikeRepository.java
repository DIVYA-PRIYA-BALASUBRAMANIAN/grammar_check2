package com.doctorvet.repository;

import com.doctorvet.model.CommunityPostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityPostLikeRepository extends JpaRepository<CommunityPostLike, Long> {
    Optional<CommunityPostLike> findByCommunityPostIdAndDoctorId(Long communityPostId, Long doctorId);
    List<CommunityPostLike> findByCommunityPostId(Long communityPostId);
    boolean existsByCommunityPostIdAndDoctorId(Long communityPostId, Long doctorId);
    void deleteByCommunityPostIdAndDoctorId(Long communityPostId, Long doctorId);
}
