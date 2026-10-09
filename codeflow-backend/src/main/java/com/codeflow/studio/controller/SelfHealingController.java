package com.codeflow.studio.controller;

import com.codeflow.studio.service.SelfHealingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * REST API for Autonomous Architecture Self-Healing & AI Refactoring Swarm (v11.0).
 */
@RestController
@RequestMapping("/api/v1/projects")
public class SelfHealingController {

    private static final Pattern SAFE_PROJECT_ID = Pattern.compile("^[a-zA-Z0-9_-]+$");

    private final SelfHealingService selfHealingService;

    public SelfHealingController(SelfHealingService selfHealingService) {
        this.selfHealingService = selfHealingService;
    }

    /**
     * Get live telemetry and status of the 4 autonomous agents.
     */
    @GetMapping("/{projectId}/self-heal/agents")
    public ResponseEntity<Map<String, Object>> getSwarmAgents(@PathVariable String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid project identifier"));
        }
        return ResponseEntity.ok(selfHealingService.getSwarmStatus(projectId));
    }

    /**
     * Run autonomous remediation for a specific rule or full codebase.
     */
    @PostMapping("/{projectId}/self-heal/remediate")
    public ResponseEntity<Map<String, Object>> remediate(
            @PathVariable String projectId,
            @RequestParam(value = "ruleId", required = false, defaultValue = "ALL") String ruleId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid project identifier"));
        }
        return ResponseEntity.ok(selfHealingService.executeRemediation(projectId, ruleId));
    }

    /**
     * Scan dependencies and produce autonomous zero-day CVE patches.
     */
    @PostMapping("/{projectId}/self-heal/cve-scan")
    public ResponseEntity<Map<String, Object>> scanCves(@PathVariable String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid project identifier"));
        }
        return ResponseEntity.ok(selfHealingService.scanAndPatchCves(projectId));
    }
}
