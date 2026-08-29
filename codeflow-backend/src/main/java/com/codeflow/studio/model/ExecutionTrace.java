package com.codeflow.studio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "execution_traces")
public class ExecutionTrace {

    @Id
    private String id;

    @Column(nullable = false)
    private String projectId;

    @Column(nullable = false)
    private String endpoint;

    @Column(nullable = false)
    private String httpMethod;

    private int durationMs;
    private String status;
    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String traceStepsJson;

    public ExecutionTrace() {
    }

    public ExecutionTrace(String id, String projectId, String endpoint, String httpMethod, int durationMs, String status, LocalDateTime timestamp, String traceStepsJson) {
        this.id = id;
        this.projectId = projectId;
        this.endpoint = endpoint;
        this.httpMethod = httpMethod;
        this.durationMs = durationMs;
        this.status = status;
        this.timestamp = timestamp;
        this.traceStepsJson = traceStepsJson;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public int getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(int durationMs) {
        this.durationMs = durationMs;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getTraceStepsJson() {
        return traceStepsJson;
    }

    public void setTraceStepsJson(String traceStepsJson) {
        this.traceStepsJson = traceStepsJson;
    }
}
