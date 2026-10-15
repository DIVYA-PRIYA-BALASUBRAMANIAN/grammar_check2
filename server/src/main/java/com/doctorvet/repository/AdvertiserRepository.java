package com.doctorvet.repository;

import com.doctorvet.model.Advertiser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdvertiserRepository extends JpaRepository<Advertiser, Long> {
    Optional<Advertiser> findByBusinessEmailIgnoreCase(String businessEmail);
    Optional<Advertiser> findByAccessKey(String accessKey);
    boolean existsByBusinessEmailIgnoreCase(String businessEmail);
}
