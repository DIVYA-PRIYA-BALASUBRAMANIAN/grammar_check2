package com.doctorvet.repository;

import com.doctorvet.model.DoctorConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorConnectionRepository extends JpaRepository<DoctorConnection, Long> {
    
    @Query("SELECT c FROM DoctorConnection c WHERE c.doctor1Id = :doctorId OR c.doctor2Id = :doctorId")
    List<DoctorConnection> findAllByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT c FROM DoctorConnection c WHERE (c.doctor1Id = :doc1 AND c.doctor2Id = :doc2) OR (c.doctor1Id = :doc2 AND c.doctor2Id = :doc1)")
    Optional<DoctorConnection> findConnectionBetween(@Param("doc1") Long doc1, @Param("doc2") Long doc2);

    @Query("SELECT COUNT(c) FROM DoctorConnection c WHERE c.doctor1Id = :doctorId OR c.doctor2Id = :doctorId")
    long countConnectionsForDoctor(@Param("doctorId") Long doctorId);
}
