package com.doctorvet.repository;

import com.doctorvet.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByAdvertiserIdOrderByCreatedAtDesc(Long advertiserId);
    List<Campaign> findByStatusIgnoreCase(String status);
    long countByAdvertiserId(Long advertiserId);
    long countByAdvertiserIdAndStatusIgnoreCase(Long advertiserId, String status);
}
