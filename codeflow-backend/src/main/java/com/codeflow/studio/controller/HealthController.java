package com.codeflow.studio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health & Diagnostic System Telemetry Controller.
 * Provides system vitals, JVM heap utilization, and engine status for CodeFlow Studio v9.0.
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final Instant startTime = Instant.now();

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("version", "9.0.0");
        health.put("service", "CodeFlow Studio Architecture Engine");
        health.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(health);
    }

    @GetMapping("/system/info")
    public ResponseEntity<Map<String, Object>> getSystemInfo() {
        MemoryMXBean memory = ManagementFactory.getMemoryMXBean();
        ThreadMXBean threads = ManagementFactory.getThreadMXBean();
        Runtime runtime = Runtime.getRuntime();

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("status", "HEALTHY");
        info.put("engineVersion", "8.0.0");
        info.put("springBootVersion", "3.2.3");
        info.put("javaVersion", System.getProperty("java.version"));
        info.put("jvmUptimeSeconds", ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
        info.put("startedAt", startTime.toString());

        Map<String, Object> jvmMemory = new LinkedHashMap<>();
        long maxMem = runtime.maxMemory() / (1024 * 1024);
        long totalMem = runtime.totalMemory() / (1024 * 1024);
        long freeMem = runtime.freeMemory() / (1024 * 1024);
        long usedMem = totalMem - freeMem;
        jvmMemory.put("usedMb", usedMem);
        jvmMemory.put("totalAllocatedMb", totalMem);
        jvmMemory.put("maxAvailableMb", maxMem);
        jvmMemory.put("heapMemoryUsedMb", memory.getHeapMemoryUsage().getUsed() / (1024 * 1024));
        info.put("memory", jvmMemory);

        Map<String, Object> threadInfo = new LinkedHashMap<>();
        threadInfo.put("liveThreads", threads.getThreadCount());
        threadInfo.put("peakThreads", threads.getPeakThreadCount());
        threadInfo.put("totalStartedThreads", threads.getTotalStartedThreadCount());
        info.put("threads", threadInfo);

        return ResponseEntity.ok(info);
    }
}
