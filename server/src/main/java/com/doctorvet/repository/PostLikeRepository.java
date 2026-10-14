package com.doctorvet.repository;

import com.doctorvet.model.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostIdAndDoctorId(Long postId, Long doctorId);
    boolean existsByPostIdAndDoctorId(Long postId, Long doctorId);
    long countByPostId(Long postId);
}
