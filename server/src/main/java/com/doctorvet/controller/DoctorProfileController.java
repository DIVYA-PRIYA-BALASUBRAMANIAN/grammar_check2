package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.repository.DoctorProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profiles")
@CrossOrigin(originPatterns = "*")
public class DoctorProfileController {

    private final DoctorProfileRepository repository;

    public DoctorProfileController(DoctorProfileRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<DoctorProfile> getAllProfiles(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city
    ) {
        if (specialty != null && !specialty.equals("All specialties")) {
            return repository.findBySpecialty(specialty);
        }
        if (state != null && !state.equals("All states")) {
            return repository.findByState(state);
        }
        if (city != null && !city.isBlank()) {
            return repository.findByCityIgnoreCase(city);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorProfile> getProfileById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DoctorProfile createProfile(@RequestBody DoctorProfile profile) {
        return repository.save(profile);
    }
}
