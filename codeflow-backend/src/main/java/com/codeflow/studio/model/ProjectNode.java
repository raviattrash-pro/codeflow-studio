package com.codeflow.studio.model;

import jakarta.persistence.*;

@Entity
@Table(name = "project_nodes")
public class ProjectNode {

    @Id
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String layer;

    @Column(name = "node_type", nullable = false)
    private String nodeType;

    @Column(name = "file_path", length = 1000)
    private String filePath;

    @Column(name = "line_number")
    private Integer lineNumber;

    @Column(name = "method_name")
    private String methodName;

    @Column(name = "http_method")
    private String httpMethod;

    @Column(name = "endpoint_path")
    private String endpointPath;

    @Column(name = "package_name")
    private String packageName;

    @Column(name = "annotations_csv", length = 1000)
    private String annotationsCsv;

    @Column(name = "target_entity")
    private String targetEntity;

    public ProjectNode() {}

    public ProjectNode(String id, String projectId, String label, String layer, String nodeType, String filePath, Integer lineNumber, String methodName, String httpMethod, String endpointPath, String packageName, String annotationsCsv, String targetEntity) {
        this.id = id;
        this.projectId = projectId;
        this.label = label;
        this.layer = layer;
        this.nodeType = nodeType;
        this.filePath = filePath;
        this.lineNumber = lineNumber;
        this.methodName = methodName;
        this.httpMethod = httpMethod;
        this.endpointPath = endpointPath;
        this.packageName = packageName;
        this.annotationsCsv = annotationsCsv;
        this.targetEntity = targetEntity;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getLayer() { return layer; }
    public void setLayer(String layer) { this.layer = layer; }

    public String getNodeType() { return nodeType; }
    public void setNodeType(String nodeType) { this.nodeType = nodeType; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }

    public String getMethodName() { return methodName; }
    public void setMethodName(String methodName) { this.methodName = methodName; }

    public String getHttpMethod() { return httpMethod; }
    public void setHttpMethod(String httpMethod) { this.httpMethod = httpMethod; }

    public String getEndpointPath() { return endpointPath; }
    public void setEndpointPath(String endpointPath) { this.endpointPath = endpointPath; }

    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }

    public String getAnnotationsCsv() { return annotationsCsv; }
    public void setAnnotationsCsv(String annotationsCsv) { this.annotationsCsv = annotationsCsv; }

    public String getTargetEntity() { return targetEntity; }
    public void setTargetEntity(String targetEntity) { this.targetEntity = targetEntity; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String projectId;
        private String label;
        private String layer;
        private String nodeType;
        private String filePath;
        private Integer lineNumber;
        private String methodName;
        private String httpMethod;
        private String endpointPath;
        private String packageName;
        private String annotationsCsv;
        private String targetEntity;

        public Builder id(String id) { this.id = id; return this; }
        public Builder projectId(String projectId) { this.projectId = projectId; return this; }
        public Builder label(String label) { this.label = label; return this; }
        public Builder layer(String layer) { this.layer = layer; return this; }
        public Builder nodeType(String nodeType) { this.nodeType = nodeType; return this; }
        public Builder filePath(String filePath) { this.filePath = filePath; return this; }
        public Builder lineNumber(Integer lineNumber) { this.lineNumber = lineNumber; return this; }
        public Builder methodName(String methodName) { this.methodName = methodName; return this; }
        public Builder httpMethod(String httpMethod) { this.httpMethod = httpMethod; return this; }
        public Builder endpointPath(String endpointPath) { this.endpointPath = endpointPath; return this; }
        public Builder packageName(String packageName) { this.packageName = packageName; return this; }
        public Builder annotationsCsv(String annotationsCsv) { this.annotationsCsv = annotationsCsv; return this; }
        public Builder targetEntity(String targetEntity) { this.targetEntity = targetEntity; return this; }

        public ProjectNode build() {
            return new ProjectNode(id, projectId, label, layer, nodeType, filePath, lineNumber, methodName, httpMethod, endpointPath, packageName, annotationsCsv, targetEntity);
        }
    }
}
