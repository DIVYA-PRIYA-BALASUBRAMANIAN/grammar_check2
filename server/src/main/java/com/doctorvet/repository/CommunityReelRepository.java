package com.doctorvet.repository;

import com.doctorvet.model.CommunityReel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityReelRepository extends JpaRepository<CommunityReel, Long> {
    List<CommunityReel> findByCommunityIdOrderByCreatedAtDesc(Long communityId);
}
