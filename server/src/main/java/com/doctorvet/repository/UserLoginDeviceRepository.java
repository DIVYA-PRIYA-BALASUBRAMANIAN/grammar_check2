package com.doctorvet.repository;

import com.doctorvet.model.UserLoginDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLoginDeviceRepository extends JpaRepository<UserLoginDevice, Long> {

    List<UserLoginDevice> findByUserEmailIgnoreCase(String userEmail);

    Optional<UserLoginDevice> findByUserEmailIgnoreCaseAndDeviceId(String userEmail, String deviceId);

    boolean existsByUserEmailIgnoreCaseAndDeviceId(String userEmail, String deviceId);

    long countByUserEmailIgnoreCase(String userEmail);
}
