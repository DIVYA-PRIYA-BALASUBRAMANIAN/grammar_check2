package com.doctorvet.repository;

import com.doctorvet.model.CommunityPostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostCommentRepository extends JpaRepository<CommunityPostComment, Long> {
    List<CommunityPostComment> findByCommunityPostIdOrderByCreatedAtAsc(Long communityPostId);
}
