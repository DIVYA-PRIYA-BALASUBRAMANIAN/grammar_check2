package com.doctorvet.repository;

import com.doctorvet.model.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    List<DoctorProfile> findBySpecialty(String specialty);
    List<DoctorProfile> findByState(String state);
    List<DoctorProfile> findByCityIgnoreCase(String city);
}
