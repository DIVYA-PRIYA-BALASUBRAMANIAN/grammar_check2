package com.doctorvet.service;

import com.doctorvet.model.ClinicalCase;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Post;
import com.doctorvet.model.ShortVideo;
import com.doctorvet.repository.ClinicalCaseRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.PostRepository;
import com.doctorvet.repository.ShortVideoRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UnifiedSearchService {

    private final DoctorProfileRepository doctorRepo;
    private final ClinicalCaseRepository caseRepo;
    private final PostRepository postRepo;
    private final ShortVideoRepository videoRepo;

    public UnifiedSearchService(DoctorProfileRepository doctorRepo,
                                ClinicalCaseRepository caseRepo,
                                PostRepository postRepo,
                                ShortVideoRepository videoRepo) {
        this.doctorRepo = doctorRepo;
        this.caseRepo = caseRepo;
        this.postRepo = postRepo;
        this.videoRepo = videoRepo;
    }

    public record SearchResult(
            List<DoctorProfile> doctors,
            List<ClinicalCase> cases,
            List<Post> posts,
            List<ShortVideo> videos,
            int totalResults
    ) {}

    public SearchResult search(String query) {
        if (query == null || query.isBlank()) {
            List<DoctorProfile> allDocs = doctorRepo.findAll();
            List<ClinicalCase> allCases = caseRepo.findAll();
            List<Post> allPosts = postRepo.findAll();
            List<ShortVideo> allVideos = videoRepo.findAll();
            int total = allDocs.size() + allCases.size() + allPosts.size() + allVideos.size();
            return new SearchResult(allDocs, allCases, allPosts, allVideos, total);
        }

        String q = query.trim().toLowerCase();

        List<DoctorProfile> matchedDocs = doctorRepo.findAll().stream()
                .filter(d -> (d.getName() != null && d.getName().toLowerCase().contains(q)) ||
                             (d.getSpecialty() != null && d.getSpecialty().toLowerCase().contains(q)) ||
                             (d.getClinic() != null && d.getClinic().toLowerCase().contains(q)) ||
                             (d.getCity() != null && d.getCity().toLowerCase().contains(q)) ||
                             (d.getState() != null && d.getState().toLowerCase().contains(q)))
                .toList();

        List<ClinicalCase> matchedCases = caseRepo.findAll().stream()
                .filter(c -> (c.getTitle() != null && c.getTitle().toLowerCase().contains(q)) ||
                             (c.getPresentingComplaint() != null && c.getPresentingComplaint().toLowerCase().contains(q)) ||
                             (c.getDiagnosis() != null && c.getDiagnosis().toLowerCase().contains(q)) ||
                             (c.getSpecies() != null && c.getSpecies().toLowerCase().contains(q)) ||
                             (c.getAuthorSpecialty() != null && c.getAuthorSpecialty().toLowerCase().contains(q)))
                .toList();

        List<Post> matchedPosts = postRepo.findAll().stream()
                .filter(p -> (p.getContent() != null && p.getContent().toLowerCase().contains(q)) ||
                             (p.getBadgeLabel() != null && p.getBadgeLabel().toLowerCase().contains(q)) ||
                             (p.getAuthorName() != null && p.getAuthorName().toLowerCase().contains(q)) ||
                             (p.getSpecies() != null && p.getSpecies().toLowerCase().contains(q)))
                .toList();

        List<ShortVideo> matchedVideos = videoRepo.findAll().stream()
                .filter(v -> (v.getTitle() != null && v.getTitle().toLowerCase().contains(q)) ||
                             (v.getDoctorName() != null && v.getDoctorName().toLowerCase().contains(q)) ||
                             (v.getDoctorSpecialty() != null && v.getDoctorSpecialty().toLowerCase().contains(q)))
                .toList();

        int total = matchedDocs.size() + matchedCases.size() + matchedPosts.size() + matchedVideos.size();
        return new SearchResult(matchedDocs, matchedCases, matchedPosts, matchedVideos, total);
    }
}
