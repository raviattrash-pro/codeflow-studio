package com.codeflow.studio.controller;

import com.codeflow.studio.service.EbpfTracingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * REST API for Real-Time Distributed Mesh & eBPF Kernel Tracing (v12.0).
 */
@RestController
@RequestMapping("/api/v1/projects")
public class EbpfTracingController {

    private static final Pattern SAFE_PROJECT_ID = Pattern.compile("^[a-zA-Z0-9_-]+$");

    private final EbpfTracingService ebpfTracingService;

    public EbpfTracingController(EbpfTracingService ebpfTracingService) {
        this.ebpfTracingService = ebpfTracingService;
    }

    /**
     * Get active eBPF kernel probes, socket filters, and microsecond trace waterfall.
     */
    @GetMapping("/{projectId}/ebpf/probes")
    public ResponseEntity<Map<String, Object>> getKernelProbes(@PathVariable String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid project identifier"));
        }
        return ResponseEntity.ok(ebpfTracingService.getKernelProbes(projectId));
    }

    /**
     * Get multi-cloud cluster topology, WireGuard peering links, and latency matrix.
     */
    @GetMapping("/{projectId}/ebpf/mesh")
    public ResponseEntity<Map<String, Object>> getMeshTopology(@PathVariable String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid project identifier"));
        }
        return ResponseEntity.ok(ebpfTracingService.getMeshTopology(projectId));
    }

    /**
     * Get real-time SLO error budget tracking and active guard status.
     */
    @GetMapping("/{projectId}/ebpf/slo-guards")
    public ResponseEntity<Map<String, Object>> getSloGuards(@PathVariable String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid project identifier"));
        }
        return ResponseEntity.ok(ebpfTracingService.getSloGuards(projectId));
    }

    /**
     * Apply an autonomous eBPF traffic throttle or Canary rate limit on a service.
     */
    @PostMapping("/{projectId}/ebpf/throttle")
    public ResponseEntity<Map<String, Object>> applyTrafficGuard(
            @PathVariable String projectId,
            @RequestParam(value = "serviceId", required = false, defaultValue = "svc-inventory") String serviceId,
            @RequestParam(value = "action", required = false, defaultValue = "RATE_LIMIT_20") String action) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid project identifier"));
        }
        return ResponseEntity.ok(ebpfTracingService.applyTrafficGuard(projectId, serviceId, action));
    }
}
