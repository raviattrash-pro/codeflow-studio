package com.codeflow.studio.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * Hardened Cross-Origin Resource Sharing (CORS) Configuration (OWASP A01:2021).
 * Restricts origin access to authorized local studio frontends, Tauri desktop webviews,
 * and explicitly configured enterprise origins.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${codeflow.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:80,http://localhost:18080,http://127.0.0.1:*,tauri://localhost}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] patterns = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        registry.addMapping("/api/**")
                .allowedOriginPatterns(patterns)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                .allowedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin")
                .exposedHeaders("X-Total-Count", "Link")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
