package com.codeflow.studio.controller;

import com.codeflow.studio.model.SqlQueryLog;
import com.codeflow.studio.service.RuntimeTraceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class RuntimeTraceController {

    private final RuntimeTraceService runtimeTraceService;

    @Autowired
    public RuntimeTraceController(RuntimeTraceService runtimeTraceService) {
        this.runtimeTraceService = runtimeTraceService;
    }

    @GetMapping("/{projectId}/sql")
    public ResponseEntity<List<SqlQueryLog>> getSqlQueryLogs(@PathVariable String projectId) {
        List<SqlQueryLog> logs = runtimeTraceService.getProjectSqlQueries(projectId);
        return ResponseEntity.ok(logs);
    }
}
