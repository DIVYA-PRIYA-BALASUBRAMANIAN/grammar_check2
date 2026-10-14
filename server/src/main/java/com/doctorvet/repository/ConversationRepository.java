package com.doctorvet.repository;

import com.doctorvet.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.doctor1Id = :docId OR c.doctor2Id = :docId ORDER BY c.updatedAt DESC")
    List<Conversation> findAllByDoctorId(@Param("docId") Long docId);

    @Query("SELECT c FROM Conversation c WHERE (c.doctor1Id = :doc1 AND c.doctor2Id = :doc2) OR (c.doctor1Id = :doc2 AND c.doctor2Id = :doc1)")
    Optional<Conversation> findBetweenDoctors(@Param("doc1") Long doc1, @Param("doc2") Long doc2);
}
