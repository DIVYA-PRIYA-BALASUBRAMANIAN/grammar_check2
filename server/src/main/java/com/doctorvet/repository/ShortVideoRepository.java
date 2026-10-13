package com.doctorvet.repository;

import com.doctorvet.model.ShortVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShortVideoRepository extends JpaRepository<ShortVideo, Long> {
}
