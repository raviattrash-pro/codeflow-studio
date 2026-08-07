package com.codeflow.studio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class SecurityExplorerController {

    @GetMapping("/{projectId}/security-flow")
    public ResponseEntity<Map<String, Object>> getSecurityFlow(@PathVariable String projectId) {
        List<Map<String, Object>> pipelineSteps = new ArrayList<>();

        pipelineSteps.add(Map.of(
                "step", 1,
                "name", "Client Request",
                "type", "CLIENT",
                "description", "Client sends HTTP request containing Authorization: Bearer <JWT> token header."
        ));
        pipelineSteps.add(Map.of(
                "step", 2,
                "name", "CorsFilter & CsrfFilter",
                "type", "FILTER",
                "description", "Spring Security CorsFilter verifies allowed origins, headers, and HTTP methods. CSRF disabled for stateless JWT APIs."
        ));
        pipelineSteps.add(Map.of(
                "step", 3,
                "name", "JwtAuthenticationFilter",
                "type", "CUSTOM_FILTER",
                "description", "Custom OncePerRequestFilter extracts Bearer token, validates signature using HMAC256/RSA secret, and parses claims."
        ));
        pipelineSteps.add(Map.of(
                "step", 4,
                "name", "UserDetailsService",
                "type", "SERVICE",
                "description", "Loads user details and granted authorities (e.g. ROLE_USER, ROLE_ADMIN) from DB repository."
        ));
        pipelineSteps.add(Map.of(
                "step", 5,
                "name", "SecurityContextHolder",
                "type", "CONTEXT",
                "description", "Populates UsernamePasswordAuthenticationToken into SecurityContextHolderThreadLocal for session lifetime."
        ));
        pipelineSteps.add(Map.of(
                "step", 6,
                "name", "@PreAuthorize / @RestController",
                "type", "ENDPOINT",
                "description", "MethodSecurityInterceptor enforces role-based access control before invoking target @RestController method."
        ));

        Map<String, Object> result = new HashMap<>();
        result.put("authType", "Spring Security 6.x + JWT (Stateless)");
        result.put("steps", pipelineSteps);
        result.put("filterChain", List.of("HeaderWriterFilter", "CorsFilter", "LogoutFilter", "JwtAuthenticationFilter", "ConcurrentSessionFilter", "AuthorizationFilter"));

        return ResponseEntity.ok(result);
    }
}
