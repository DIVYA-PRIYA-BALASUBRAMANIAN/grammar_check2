package com.doctorvet.config;

import com.doctorvet.security.AuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    public WebConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
        java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads").toAbsolutePath().normalize();
        java.nio.file.Path rootUploadDir = java.nio.file.Paths.get("..", "uploads").toAbsolutePath().normalize();
        java.nio.file.Path serverUploadDir = java.nio.file.Paths.get("server", "uploads").toAbsolutePath().normalize();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                        uploadDir.toUri().toString(),
                        rootUploadDir.toUri().toString(),
                        serverUploadDir.toUri().toString()
                );
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Enforce authentication on private doctor-to-doctor endpoints
        registry.addInterceptor(authInterceptor)
                .addPathPatterns(
                        "/api/v1/chat/**",
                        "/api/v1/connections/**",
                        "/api/v1/notifications/**"
                )
                .excludePathPatterns(
                        "/api/v1/auth/**",
                        "/api/v1/feed/**",
                        "/api/v1/doctors/**",
                        "/api/v1/cases/**",
                        "/api/v1/videos/**",
                        "/uploads/**",
                        "/ws/**"
                );
    }
}
