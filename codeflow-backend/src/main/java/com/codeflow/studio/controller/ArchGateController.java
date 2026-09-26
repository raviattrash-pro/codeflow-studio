package com.codeflow.studio.controller;

import com.codeflow.studio.service.ArchGateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
public class ArchGateController {

    private final ArchGateService archGateService;

    public ArchGateController(ArchGateService archGateService) {
        this.archGateService = archGateService;
    }

    /**
     * Run architecture validation against all rules.
     */
    @PostMapping("/{projectId}/arch-gate/validate")
    public ResponseEntity<Map<String, Object>> validateArchitecture(@PathVariable String projectId) {
        try {
            Map<String, Object> report = archGateService.validateArchitecture(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "ERROR",
                    "message", "Architecture validation failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Generate a markdown report for CI/CD integration.
     */
    @GetMapping("/{projectId}/arch-gate/report")
    public ResponseEntity<Map<String, Object>> getMarkdownReport(@PathVariable String projectId) {
        try {
            String markdown = archGateService.generateMarkdownReport(projectId);
            return ResponseEntity.ok(Map.of(
                    "format", "markdown",
                    "content", markdown
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "ERROR",
                    "message", "Report generation failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Get the list of configured architecture rules.
     */
    @GetMapping("/{projectId}/arch-gate/rules")
    public ResponseEntity<Map<String, Object>> getRules(@PathVariable String projectId) {
        // Return the rule definitions without running validation
        Map<String, Object> rules = Map.of(
                "rules", java.util.List.of(
                        Map.of("id", "LAYER-001", "name", "Controller-Repository Separation", "severity", "HIGH",
                                "description", "Controllers must not directly depend on Repository interfaces"),
                        Map.of("id", "CYCLE-001", "name", "No Circular Dependencies", "severity", "CRITICAL",
                                "description", "Services must not have circular dependency chains"),
                        Map.of("id", "LAYER-002", "name", "Service-Controller Separation", "severity", "HIGH",
                                "description", "Service layer must not depend on Controller layer"),
                        Map.of("id", "JPA-001", "name", "JPA Entity Validation", "severity", "MEDIUM",
                                "description", "Model/Entity classes should have @Entity and @Id annotations"),
                        Map.of("id", "API-001", "name", "REST API Naming Convention", "severity", "LOW",
                                "description", "REST endpoints should use lowercase kebab-case paths"),
                        Map.of("id", "SEC-001", "name", "Security Annotation Coverage", "severity", "HIGH",
                                "description", "DELETE/PUT/PATCH endpoints should have security annotations")
                )
        );
        return ResponseEntity.ok(rules);
    }
}
