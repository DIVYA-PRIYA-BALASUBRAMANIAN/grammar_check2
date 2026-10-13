package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clinical_cases")
public class ClinicalCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String authorName;
    private String authorSpecialty;
    private String species;

    @Column(length = 2000)
    private String presentingComplaint;

    @Column(length = 2000)
    private String clinicalFindings;

    @Column(length = 2000)
    private String diagnostics;

    @Column(length = 2000)
    private String diagnosis;

    @Column(length = 3000)
    private String treatmentProtocol;

    @Column(length = 1000)
    private String outcome;

    private String mediaUrl;
    private int views;
    private int comments;
    private LocalDateTime createdAt = LocalDateTime.now();

    public ClinicalCase() {}

    public ClinicalCase(String title, String authorName, String authorSpecialty, String species,
                        String presentingComplaint, String clinicalFindings, String diagnostics,
                        String diagnosis, String treatmentProtocol, String outcome, String mediaUrl) {
        this.title = title;
        this.authorName = authorName;
        this.authorSpecialty = authorSpecialty;
        this.species = species;
        this.presentingComplaint = presentingComplaint;
        this.clinicalFindings = clinicalFindings;
        this.diagnostics = diagnostics;
        this.diagnosis = diagnosis;
        this.treatmentProtocol = treatmentProtocol;
        this.outcome = outcome;
        this.mediaUrl = mediaUrl;
        this.views = 100;
        this.comments = 5;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorSpecialty() { return authorSpecialty; }
    public void setAuthorSpecialty(String authorSpecialty) { this.authorSpecialty = authorSpecialty; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getPresentingComplaint() { return presentingComplaint; }
    public void setPresentingComplaint(String presentingComplaint) { this.presentingComplaint = presentingComplaint; }

    public String getClinicalFindings() { return clinicalFindings; }
    public void setClinicalFindings(String clinicalFindings) { this.clinicalFindings = clinicalFindings; }

    public String getDiagnostics() { return diagnostics; }
    public void setDiagnostics(String diagnostics) { this.diagnostics = diagnostics; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getTreatmentProtocol() { return treatmentProtocol; }
    public void setTreatmentProtocol(String treatmentProtocol) { this.treatmentProtocol = treatmentProtocol; }

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public int getViews() { return views; }
    public void setViews(int views) { this.views = views; }

    public int getComments() { return comments; }
    public void setComments(int comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
