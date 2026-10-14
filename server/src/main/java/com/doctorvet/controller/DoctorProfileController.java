package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.service.DoctorProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/profiles", "/api/v1/doctors"})
@CrossOrigin(originPatterns = "*")
public class DoctorProfileController {

    private final DoctorProfileService doctorService;

    public DoctorProfileController(DoctorProfileService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<DoctorProfile> getAllProfiles(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city
    ) {
        return doctorService.getAllProfiles(search, specialty, state, city);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorProfile> getProfileById(@PathVariable Long id) {
        return doctorService.getProfileById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DoctorProfile createProfile(@RequestBody DoctorProfile profile) {
        return doctorService.createProfile(profile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorProfile> updateProfile(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return doctorService.updateProfile(id, updates)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
