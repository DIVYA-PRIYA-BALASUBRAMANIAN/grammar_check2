package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.repository.DoctorProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/profiles", "/api/v1/doctors"})
@CrossOrigin(originPatterns = "*")
public class DoctorProfileController {

    private final DoctorProfileRepository repository;

    public DoctorProfileController(DoctorProfileRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<DoctorProfile> getAllProfiles(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city
    ) {
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            return repository.findAll().stream()
                    .filter(d -> d.getName().toLowerCase().contains(q) ||
                                 d.getSpecialty().toLowerCase().contains(q) ||
                                 (d.getCity() != null && d.getCity().toLowerCase().contains(q)) ||
                                 (d.getClinic() != null && d.getClinic().toLowerCase().contains(q)))
                    .toList();
        }
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

    @PutMapping("/{id}")
    public ResponseEntity<DoctorProfile> updateProfile(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return repository.findById(id).map(d -> {
            if (updates.containsKey("name")) d.setName(updates.get("name").toString());
            if (updates.containsKey("specialty")) d.setSpecialty(updates.get("specialty").toString());
            if (updates.containsKey("qualification")) d.setQualification(updates.get("qualification").toString());
            if (updates.containsKey("clinic")) d.setClinic(updates.get("clinic").toString());
            if (updates.containsKey("city")) d.setCity(updates.get("city").toString());
            if (updates.containsKey("state")) d.setState(updates.get("state").toString());
            if (updates.containsKey("avatar")) d.setAvatar(updates.get("avatar").toString());
            if (updates.containsKey("bio")) d.setBio(updates.get("bio").toString());
            if (updates.containsKey("headline")) d.setHeadline(updates.get("headline").toString());
            if (updates.containsKey("coverImage")) d.setCoverImage(updates.get("coverImage").toString());
            if (updates.containsKey("phone")) d.setPhone(updates.get("phone").toString());
            if (updates.containsKey("email")) d.setEmail(updates.get("email").toString());
            if (updates.containsKey("experienceYears")) d.setExperienceYears(Integer.parseInt(updates.get("experienceYears").toString()));
            return ResponseEntity.ok(repository.save(d));
        }).orElse(ResponseEntity.notFound().build());
    }
}
