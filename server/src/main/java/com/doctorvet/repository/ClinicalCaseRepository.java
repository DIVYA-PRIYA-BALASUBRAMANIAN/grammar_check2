package com.doctorvet.repository;

import com.doctorvet.model.ClinicalCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClinicalCaseRepository extends JpaRepository<ClinicalCase, Long> {
    List<ClinicalCase> findBySpecies(String species);
    List<ClinicalCase> findByAuthorSpecialty(String authorSpecialty);
}
