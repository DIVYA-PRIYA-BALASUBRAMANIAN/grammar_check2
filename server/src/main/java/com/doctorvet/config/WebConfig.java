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
        String u1 = java.nio.file.Paths.get("uploads").toAbsolutePath().normalize().toUri().toString();
        if (!u1.endsWith("/")) u1 += "/";
        String u2 = java.nio.file.Paths.get("..", "uploads").toAbsolutePath().normalize().toUri().toString();
        if (!u2.endsWith("/")) u2 += "/";
        String u3 = java.nio.file.Paths.get("server", "uploads").toAbsolutePath().normalize().toUri().toString();
        if (!u3.endsWith("/")) u3 += "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(u1, u2, u3);
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
                        "/api/v1/notifications/broadcast",
                        "/uploads/**",
                        "/ws/**",
                        "/ws-chat/**"
                );
    }
}
