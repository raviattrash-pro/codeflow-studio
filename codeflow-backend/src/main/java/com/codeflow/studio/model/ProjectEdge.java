package com.codeflow.studio.model;

import jakarta.persistence.*;

@Entity
@Table(name = "project_edges")
public class ProjectEdge {

    @Id
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "source_node_id", nullable = false)
    private String sourceNodeId;

    @Column(name = "target_node_id", nullable = false)
    private String targetNodeId;

    @Column(name = "edge_label")
    private String edgeLabel;

    @Column(name = "call_type")
    private String callType;

    public ProjectEdge() {}

    public ProjectEdge(String id, String projectId, String sourceNodeId, String targetNodeId, String edgeLabel, String callType) {
        this.id = id;
        this.projectId = projectId;
        this.sourceNodeId = sourceNodeId;
        this.targetNodeId = targetNodeId;
        this.edgeLabel = edgeLabel;
        this.callType = callType;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getSourceNodeId() { return sourceNodeId; }
    public void setSourceNodeId(String sourceNodeId) { this.sourceNodeId = sourceNodeId; }

    public String getTargetNodeId() { return targetNodeId; }
    public void setTargetNodeId(String targetNodeId) { this.targetNodeId = targetNodeId; }

    public String getEdgeLabel() { return edgeLabel; }
    public void setEdgeLabel(String edgeLabel) { this.edgeLabel = edgeLabel; }

    public String getCallType() { return callType; }
    public void setCallType(String callType) { this.callType = callType; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String projectId;
        private String sourceNodeId;
        private String targetNodeId;
        private String edgeLabel;
        private String callType;

        public Builder id(String id) { this.id = id; return this; }
        public Builder projectId(String projectId) { this.projectId = projectId; return this; }
        public Builder sourceNodeId(String sourceNodeId) { this.sourceNodeId = sourceNodeId; return this; }
        public Builder targetNodeId(String targetNodeId) { this.targetNodeId = targetNodeId; return this; }
        public Builder edgeLabel(String edgeLabel) { this.edgeLabel = edgeLabel; return this; }
        public Builder callType(String callType) { this.callType = callType; return this; }

        public ProjectEdge build() {
            return new ProjectEdge(id, projectId, sourceNodeId, targetNodeId, edgeLabel, callType);
        }
    }
}
