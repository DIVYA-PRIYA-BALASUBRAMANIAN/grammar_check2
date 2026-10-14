package com.doctorvet.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // Pure dynamic operation: zero mock data.
            // All doctors, cases, posts, videos, and stories are exclusively user-created.
        };
    }
}
