package com.codeflow.studio.controller;

import com.codeflow.studio.model.ExecutionTrace;
import com.codeflow.studio.service.RuntimeTracingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class RuntimeTracingController {

    private final RuntimeTracingService runtimeTracingService;

    @Autowired
    public RuntimeTracingController(RuntimeTracingService runtimeTracingService) {
        this.runtimeTracingService = runtimeTracingService;
    }

    @GetMapping("/{projectId}/traces")
    public ResponseEntity<List<ExecutionTrace>> getExecutionTraces(@PathVariable String projectId) {
        List<ExecutionTrace> traces = runtimeTracingService.getOrGenerateTraces(projectId);
        return ResponseEntity.ok(traces);
    }
}
