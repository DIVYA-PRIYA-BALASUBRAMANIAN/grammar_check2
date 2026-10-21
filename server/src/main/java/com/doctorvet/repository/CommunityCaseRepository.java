package com.doctorvet.repository;

import com.doctorvet.model.CommunityCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityCaseRepository extends JpaRepository<CommunityCase, Long> {
    List<CommunityCase> findByCommunityIdOrderByCreatedAtDesc(Long communityId);
}
