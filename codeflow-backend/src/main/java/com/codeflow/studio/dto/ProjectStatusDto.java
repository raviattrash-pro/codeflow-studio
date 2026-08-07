package com.codeflow.studio.dto;

import java.time.LocalDateTime;

public class ProjectStatusDto {
    private String projectId;
    private String status;
    private Integer progressPercentage;
    private String errorDetails;
    private LocalDateTime completedAt;

    public ProjectStatusDto() {}

    public ProjectStatusDto(String projectId, String status, Integer progressPercentage, String errorDetails, LocalDateTime completedAt) {
        this.projectId = projectId;
        this.status = status;
        this.progressPercentage = progressPercentage;
        this.errorDetails = errorDetails;
        this.completedAt = completedAt;
    }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getErrorDetails() { return errorDetails; }
    public void setErrorDetails(String errorDetails) { this.errorDetails = errorDetails; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String projectId;
        private String status;
        private Integer progressPercentage;
        private String errorDetails;
        private LocalDateTime completedAt;

        public Builder projectId(String projectId) { this.projectId = projectId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder progressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; return this; }
        public Builder errorDetails(String errorDetails) { this.errorDetails = errorDetails; return this; }
        public Builder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this; }

        public ProjectStatusDto build() {
            return new ProjectStatusDto(projectId, status, progressPercentage, errorDetails, completedAt);
        }
    }
}
