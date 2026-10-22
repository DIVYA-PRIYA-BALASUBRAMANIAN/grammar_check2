package com.doctorvet.repository;

import com.doctorvet.model.StoryLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoryLikeRepository extends JpaRepository<StoryLike, Long> {
    Optional<StoryLike> findByStoryIdAndDoctorId(Long storyId, Long doctorId);
    boolean existsByStoryIdAndDoctorId(Long storyId, Long doctorId);
    long countByStoryId(Long storyId);
    List<StoryLike> findByStoryId(Long storyId);
}
