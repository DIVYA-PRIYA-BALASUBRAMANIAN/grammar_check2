package com.doctorvet.repository;

import com.doctorvet.model.SavedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    Optional<SavedPost> findByPostIdAndDoctorId(Long postId, Long doctorId);
    boolean existsByPostIdAndDoctorId(Long postId, Long doctorId);
    List<SavedPost> findByDoctorIdOrderBySavedAtDesc(Long doctorId);
}
