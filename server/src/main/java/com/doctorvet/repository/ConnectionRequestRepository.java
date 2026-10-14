package com.doctorvet.repository;

import com.doctorvet.model.ConnectionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    List<ConnectionRequest> findByReceiverIdAndStatusOrderByCreatedAtDesc(Long receiverId, String status);
    List<ConnectionRequest> findBySenderIdAndStatusOrderByCreatedAtDesc(Long senderId, String status);
    Optional<ConnectionRequest> findBySenderIdAndReceiverIdAndStatus(Long senderId, Long receiverId, String status);
    Optional<ConnectionRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
}
