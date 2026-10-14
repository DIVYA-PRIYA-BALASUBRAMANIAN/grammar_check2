package com.doctorvet.repository;

import com.doctorvet.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    long countByConversationIdAndReceiverIdAndIsReadFalse(Long conversationId, Long receiverId);
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}
