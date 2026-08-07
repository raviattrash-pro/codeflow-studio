package com.codeflow.studio.model;

import jakarta.persistence.*;

@Entity
@Table(name = "project_dependencies")
public class ProjectDependency {

    @Id
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "group_id")
    private String groupId;

    @Column(name = "artifact_id", nullable = false)
    private String artifactId;

    private String version;

    private String scope;

    @Column(name = "purpose_summary", length = 1000)
    private String purposeSummary;

    @Column(name = "common_annotations", length = 1000)
    private String commonAnnotations;

    public ProjectDependency() {}

    public ProjectDependency(String id, String projectId, String groupId, String artifactId, String version, String scope, String purposeSummary, String commonAnnotations) {
        this.id = id;
        this.projectId = projectId;
        this.groupId = groupId;
        this.artifactId = artifactId;
        this.version = version;
        this.scope = scope;
        this.purposeSummary = purposeSummary;
        this.commonAnnotations = commonAnnotations;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }

    public String getArtifactId() { return artifactId; }
    public void setArtifactId(String artifactId) { this.artifactId = artifactId; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }

    public String getPurposeSummary() { return purposeSummary; }
    public void setPurposeSummary(String purposeSummary) { this.purposeSummary = purposeSummary; }

    public String getCommonAnnotations() { return commonAnnotations; }
    public void setCommonAnnotations(String commonAnnotations) { this.commonAnnotations = commonAnnotations; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String projectId;
        private String groupId;
        private String artifactId;
        private String version;
        private String scope;
        private String purposeSummary;
        private String commonAnnotations;

        public Builder id(String id) { this.id = id; return this; }
        public Builder projectId(String projectId) { this.projectId = projectId; return this; }
        public Builder groupId(String groupId) { this.groupId = groupId; return this; }
        public Builder artifactId(String artifactId) { this.artifactId = artifactId; return this; }
        public Builder version(String version) { this.version = version; return this; }
        public Builder scope(String scope) { this.scope = scope; return this; }
        public Builder purposeSummary(String purposeSummary) { this.purposeSummary = purposeSummary; return this; }
        public Builder commonAnnotations(String commonAnnotations) { this.commonAnnotations = commonAnnotations; return this; }

        public ProjectDependency build() {
            return new ProjectDependency(id, projectId, groupId, artifactId, version, scope, purposeSummary, commonAnnotations);
        }
    }
}
