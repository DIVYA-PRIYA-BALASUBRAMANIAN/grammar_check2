package com.doctorvet.service;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.repository.DoctorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DoctorProfileService {

    private final DoctorProfileRepository repository;

    public DoctorProfileService(DoctorProfileRepository repository) {
        this.repository = repository;
    }

    public List<DoctorProfile> getAllProfiles(String search, String specialty, String state, String city) {
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            return repository.findAll().stream()
                    .filter(d -> (d.getName() != null && d.getName().toLowerCase().contains(q)) ||
                            (d.getSpecialty() != null && d.getSpecialty().toLowerCase().contains(q)) ||
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

    public Optional<DoctorProfile> getProfileById(Long id) {
        return repository.findById(id);
    }

    public Optional<DoctorProfile> findByEmail(String email) {
        if (email == null || email.isBlank())
            return Optional.empty();
        return repository.findByEmailIgnoreCase(email.trim());
    }

    public Optional<DoctorProfile> findByEmailOrName(String identifier) {
        if (identifier == null || identifier.isBlank())
            return Optional.empty();
        String clean = identifier.trim().toLowerCase();
        Optional<DoctorProfile> byEmail = repository.findByEmailIgnoreCase(clean);
        if (byEmail.isPresent())
            return byEmail;
        return repository.findAll().stream()
                .filter(d -> (d.getEmail() != null && d.getEmail().equalsIgnoreCase(clean)) ||
                        (d.getName() != null && d.getName().toLowerCase().contains(clean)))
                .findFirst();
    }

    @Transactional
    public DoctorProfile createProfile(DoctorProfile profile) {
        return repository.save(profile);
    }

    @Transactional
    public Optional<DoctorProfile> updateProfile(Long id, Map<String, Object> updates) {
        DoctorProfile doc = null;
        if (id != null) {
            doc = repository.findById(id).orElse(null);
        }
        if (doc == null && updates.containsKey("email") && updates.get("email") != null) {
            String email = updates.get("email").toString().trim().toLowerCase();
            doc = repository.findAll().stream()
                    .filter(d -> d.getEmail() != null && d.getEmail().toLowerCase().equals(email))
                    .findFirst().orElse(null);
        }
        if (doc == null && updates.containsKey("name") && updates.get("name") != null) {
            String name = updates.get("name").toString().trim().toLowerCase();
            doc = repository.findAll().stream()
                    .filter(d -> d.getName() != null && d.getName().toLowerCase().equals(name))
                    .findFirst().orElse(null);
        }
        if (doc == null) {
            doc = new DoctorProfile();
            doc.setName(updates.containsKey("name") ? updates.get("name").toString() : "Doctor");
            doc.setSpecialty(
                    updates.containsKey("specialty") ? updates.get("specialty").toString() : "Veterinary Surgery");
        }

        final DoctorProfile d = doc;
        if (updates.containsKey("name"))
            d.setName(updates.get("name").toString());
        if (updates.containsKey("specialty"))
            d.setSpecialty(updates.get("specialty").toString());
        if (updates.containsKey("qualification"))
            d.setQualification(updates.get("qualification").toString());
        if (updates.containsKey("clinic"))
            d.setClinic(updates.get("clinic").toString());
        if (updates.containsKey("city"))
            d.setCity(updates.get("city").toString());
        if (updates.containsKey("state"))
            d.setState(updates.get("state").toString());
        if (updates.containsKey("avatar"))
            d.setAvatar(updates.get("avatar").toString());
        if (updates.containsKey("bio"))
            d.setBio(updates.get("bio").toString());
        if (updates.containsKey("headline"))
            d.setHeadline(updates.get("headline").toString());
        if (updates.containsKey("coverImage"))
            d.setCoverImage(updates.get("coverImage").toString());
        if (updates.containsKey("phone"))
            d.setPhone(updates.get("phone").toString());
        if (updates.containsKey("email"))
            d.setEmail(updates.get("email").toString());
        if (updates.containsKey("licenseNumber"))
            d.setLicenseNumber(updates.get("licenseNumber").toString());
        if (updates.containsKey("experienceYears")) {
            try {
                d.setExperienceYears(Integer.parseInt(updates.get("experienceYears").toString()));
            } catch (Exception ignored) {
            }
        }
        if (updates.containsKey("active")) {
            try {
                d.setActive(Boolean.parseBoolean(updates.get("active").toString()));
            } catch (Exception ignored) {
            }
        }
        if (updates.containsKey("passwordHash") && updates.get("passwordHash") != null) {
            d.setPassword(updates.get("passwordHash").toString().trim());
        } else if (updates.containsKey("password") && updates.get("password") != null) {
            d.setPassword(updates.get("password").toString().trim());
        }
        return Optional.of(repository.save(d));
    }
}
