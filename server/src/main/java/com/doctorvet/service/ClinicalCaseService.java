package com.doctorvet.service;

import com.doctorvet.model.ClinicalCase;
import com.doctorvet.repository.ClinicalCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClinicalCaseService {

    private final ClinicalCaseRepository caseRepo;

    public ClinicalCaseService(ClinicalCaseRepository caseRepo) {
        this.caseRepo = caseRepo;
    }

    public List<ClinicalCase> getAllCases(String species) {
        if (species != null && !species.isBlank() && !species.equalsIgnoreCase("all")) {
            return caseRepo.findBySpecies(species);
        }
        return caseRepo.findAll();
    }

    @Transactional
    public Optional<ClinicalCase> getCaseById(Long id) {
        return caseRepo.findById(id).map(c -> {
            c.setViews(c.getViews() + 1);
            return caseRepo.save(c);
        });
    }

    @Transactional
    public ClinicalCase createCase(ClinicalCase clinicalCase) {
        if (clinicalCase.getViews() == 0) {
            clinicalCase.setViews(1);
        }
        return caseRepo.save(clinicalCase);
    }

    @Transactional
    public boolean deleteCase(Long id) {
        if (caseRepo.existsById(id)) {
            caseRepo.deleteById(id);
            return true;
        }
        return false;
    }
}

