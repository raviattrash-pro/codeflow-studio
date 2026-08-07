package com.codeflow.studio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "source_type", nullable = false)
    private String sourceType;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(nullable = false)
    private String status;

    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    @Column(name = "backend_framework")
    private String backendFramework;

    @Column(name = "backend_version")
    private String backendVersion;

    @Column(name = "java_version")
    private String javaVersion;

    @Column(name = "frontend_framework")
    private String frontendFramework;

    @Column(name = "frontend_version")
    private String frontendVersion;

    @Column(name = "database_type")
    private String databaseType;

    @Column(name = "controller_count")
    private Integer controllerCount;

    @Column(name = "service_count")
    private Integer serviceCount;

    @Column(name = "repository_count")
    private Integer repositoryCount;

    @Column(name = "component_count")
    private Integer componentCount;

    @Column(name = "api_count")
    private Integer apiCount;

    @Column(name = "dependency_count")
    private Integer dependencyCount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Project() {}

    public Project(String id, String name, String sourceType, String sourceUrl, String status, Integer progressPercentage, String errorMessage, String backendFramework, String backendVersion, String javaVersion, String frontendFramework, String frontendVersion, String databaseType, Integer controllerCount, Integer serviceCount, Integer repositoryCount, Integer componentCount, Integer apiCount, Integer dependencyCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.sourceType = sourceType;
        this.sourceUrl = sourceUrl;
        this.status = status;
        this.progressPercentage = progressPercentage;
        this.errorMessage = errorMessage;
        this.backendFramework = backendFramework;
        this.backendVersion = backendVersion;
        this.javaVersion = javaVersion;
        this.frontendFramework = frontendFramework;
        this.frontendVersion = frontendVersion;
        this.databaseType = databaseType;
        this.controllerCount = controllerCount;
        this.serviceCount = serviceCount;
        this.repositoryCount = repositoryCount;
        this.componentCount = componentCount;
        this.apiCount = apiCount;
        this.dependencyCount = dependencyCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getBackendFramework() { return backendFramework; }
    public void setBackendFramework(String backendFramework) { this.backendFramework = backendFramework; }

    public String getBackendVersion() { return backendVersion; }
    public void setBackendVersion(String backendVersion) { this.backendVersion = backendVersion; }

    public String getJavaVersion() { return javaVersion; }
    public void setJavaVersion(String javaVersion) { this.javaVersion = javaVersion; }

    public String getFrontendFramework() { return frontendFramework; }
    public void setFrontendFramework(String frontendFramework) { this.frontendFramework = frontendFramework; }

    public String getFrontendVersion() { return frontendVersion; }
    public void setFrontendVersion(String frontendVersion) { this.frontendVersion = frontendVersion; }

    public String getDatabaseType() { return databaseType; }
    public void setDatabaseType(String databaseType) { this.databaseType = databaseType; }

    public Integer getControllerCount() { return controllerCount; }
    public void setControllerCount(Integer controllerCount) { this.controllerCount = controllerCount; }

    public Integer getServiceCount() { return serviceCount; }
    public void setServiceCount(Integer serviceCount) { this.serviceCount = serviceCount; }

    public Integer getRepositoryCount() { return repositoryCount; }
    public void setRepositoryCount(Integer repositoryCount) { this.repositoryCount = repositoryCount; }

    public Integer getComponentCount() { return componentCount; }
    public void setComponentCount(Integer componentCount) { this.componentCount = componentCount; }

    public Integer getApiCount() { return apiCount; }
    public void setApiCount(Integer apiCount) { this.apiCount = apiCount; }

    public Integer getDependencyCount() { return dependencyCount; }
    public void setDependencyCount(Integer dependencyCount) { this.dependencyCount = dependencyCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String sourceType;
        private String sourceUrl;
        private String status;
        private Integer progressPercentage;
        private String errorMessage;
        private String backendFramework;
        private String backendVersion;
        private String javaVersion;
        private String frontendFramework;
        private String frontendVersion;
        private String databaseType;
        private Integer controllerCount;
        private Integer serviceCount;
        private Integer repositoryCount;
        private Integer componentCount;
        private Integer apiCount;
        private Integer dependencyCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder sourceType(String sourceType) { this.sourceType = sourceType; return this; }
        public Builder sourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder progressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; return this; }
        public Builder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
        public Builder backendFramework(String backendFramework) { this.backendFramework = backendFramework; return this; }
        public Builder backendVersion(String backendVersion) { this.backendVersion = backendVersion; return this; }
        public Builder javaVersion(String javaVersion) { this.javaVersion = javaVersion; return this; }
        public Builder frontendFramework(String frontendFramework) { this.frontendFramework = frontendFramework; return this; }
        public Builder frontendVersion(String frontendVersion) { this.frontendVersion = frontendVersion; return this; }
        public Builder databaseType(String databaseType) { this.databaseType = databaseType; return this; }
        public Builder controllerCount(Integer controllerCount) { this.controllerCount = controllerCount; return this; }
        public Builder serviceCount(Integer serviceCount) { this.serviceCount = serviceCount; return this; }
        public Builder repositoryCount(Integer repositoryCount) { this.repositoryCount = repositoryCount; return this; }
        public Builder componentCount(Integer componentCount) { this.componentCount = componentCount; return this; }
        public Builder apiCount(Integer apiCount) { this.apiCount = apiCount; return this; }
        public Builder dependencyCount(Integer dependencyCount) { this.dependencyCount = dependencyCount; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Project build() {
            return new Project(id, name, sourceType, sourceUrl, status, progressPercentage, errorMessage, backendFramework, backendVersion, javaVersion, frontendFramework, frontendVersion, databaseType, controllerCount, serviceCount, repositoryCount, componentCount, apiCount, dependencyCount, createdAt, updatedAt);
        }
    }
}
