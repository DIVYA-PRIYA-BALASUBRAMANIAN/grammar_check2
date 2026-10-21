package com.doctorvet.repository;

import com.doctorvet.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByInviteCodeIgnoreCase(String inviteCode);
    List<Community> findAllByOrderByCreatedAtDesc();
}
