package com.doctorvet.service;

import com.doctorvet.model.ClinicalCase;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Notification;
import com.doctorvet.repository.ClinicalCaseRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClinicalCaseService {

    private final ClinicalCaseRepository caseRepo;
    private final NotificationRepository notificationRepo;
    private final DoctorProfileRepository doctorRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ClinicalCaseService(
            ClinicalCaseRepository caseRepo,
            NotificationRepository notificationRepo,
            DoctorProfileRepository doctorRepo,
            @Autowired(required = false) SimpMessagingTemplate messagingTemplate) {
        this.caseRepo = caseRepo;
        this.notificationRepo = notificationRepo;
        this.doctorRepo = doctorRepo;
        this.messagingTemplate = messagingTemplate;
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
        if (clinicalCase.getViews() <= 0) {
            clinicalCase.setViews(1);
        }
        ClinicalCase saved = caseRepo.save(clinicalCase);

        try {
            String authorName = saved.getAuthorName() != null && !saved.getAuthorName().isBlank() ? saved.getAuthorName() : "A Colleague Doctor";
            String avatar = null;
            Long authorId = 0L;

            List<DoctorProfile> allDocs = doctorRepo.findAll();
            for (DoctorProfile doc : allDocs) {
                if (doc.getName() != null && (doc.getName().equalsIgnoreCase(authorName) || doc.getName().toLowerCase().contains(authorName.toLowerCase()))) {
                    avatar = doc.getAvatar();
                    authorId = doc.getId();
                    break;
                }
            }

            String notifMsg = authorName + " shared a new clinical case: \"" + saved.getTitle() + "\" (" + (saved.getSpecies() != null ? saved.getSpecies() : "General") + ")";

            for (DoctorProfile doc : allDocs) {
                if (!doc.getId().equals(authorId)) {
                    Notification notif = new Notification(
                            doc.getId(),
                            authorId,
                            authorName,
                            avatar,
                            "CLINICAL_CASE_SHARED",
                            notifMsg,
                            saved.getId()
                    );
                    notificationRepo.save(notif);

                    if (messagingTemplate != null) {
                        try {
                            messagingTemplate.convertAndSend("/topic/user/" + doc.getId() + "/notifications", (Object) notif, (Map<String, Object>) null);
                        } catch (Exception ignored) {}
                    }
                }
            }

            if (messagingTemplate != null) {
                try {
                    messagingTemplate.convertAndSend("/topic/notifications", (Object) saved, (Map<String, Object>) null);
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            System.err.println("ClinicalCaseService notification error: " + e.getMessage());
        }

        return saved;
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

