package com.doctorvet.repository;

import com.doctorvet.model.StoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoryViewRepository extends JpaRepository<StoryView, Long> {
    Optional<StoryView> findByStoryIdAndViewerDoctorId(Long storyId, Long viewerDoctorId);
    boolean existsByStoryIdAndViewerDoctorId(Long storyId, Long viewerDoctorId);
    long countByStoryId(Long storyId);
    List<StoryView> findByStoryIdOrderByViewedAtDesc(Long storyId);
}
