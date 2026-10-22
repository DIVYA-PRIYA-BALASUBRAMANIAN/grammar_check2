package com.doctorvet.config;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.repository.DoctorConnectionRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(DoctorProfileRepository docRepo, DoctorConnectionRepository connRepo) {
        return args -> {
            for (DoctorProfile d : docRepo.findAll()) {
                long c = connRepo.countConnectionsForDoctor(d.getId());
                if (d.getConnectionsCount() != (int) c) {
                    d.setConnectionsCount((int) c);
                    docRepo.save(d);
                }
            }
        };
    }
}
