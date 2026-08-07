# CodeFlow Studio - REST API Specification

This document provides the OpenAPI 3.0-compliant REST API specification for **CodeFlow Studio**. All API payloads are JSON formatted. Base URL: `/api/v1`.

---

## 1. Project Ingestion & Analysis APIs

### 1.1 Ingest via GitHub URL
- **Endpoint**: `POST /api/v1/projects/github`
- **Description**: Submits a public GitHub repository URL for asynchronous cloning and analysis.
- **Request Body**:
```json
{
  "githubUrl": "https://github.com/spring-projects/spring-petclinic",
  "branch": "main"
}
```
- **Response** (`202 Accepted`):
```json
{
  "projectId": "prj_9f8a7b6c-4d3e-2f1a",
  "status": "PROCESSING",
  "message": "Repository cloning initiated successfully.",
  "estimatedTimeSeconds": 8
}
```

### 1.2 Ingest via ZIP Upload
- **Endpoint**: `POST /api/v1/projects/upload`
- **Content-Type**: `multipart/form-data`
- **Form Data**: `file` (Binary .ZIP archive, max 100 MB)
- **Response** (`202 Accepted`):
```json
{
  "projectId": "prj_1a2b3c4d-5e6f-7a8b",
  "status": "PROCESSING",
  "message": "ZIP package uploaded and extraction queued.",
  "estimatedTimeSeconds": 5
}
```

### 1.3 Check Ingestion Status
- **Endpoint**: `GET /api/v1/projects/{projectId}/status`
- **Response** (`200 OK`):
```json
{
  "projectId": "prj_9f8a7b6c-4d3e-2f1a",
  "status": "COMPLETED", // Values: QUEUED, CLONING, PARSING_POM, PARSING_JAVA, PARSING_REACT, RESOLVING_RELATIONSHIPS, COMPLETED, FAILED
  "progressPercentage": 100,
  "errorDetails": null,
  "completedAt": "2026-08-06T21:05:00Z"
}
```

---

## 2. Project Overview & Dashboard APIs

### 2.1 Get Project Summary Metadata
- **Endpoint**: `GET /api/v1/projects/{projectId}`
- **Response** (`200 OK`):
```json
{
  "projectId": "prj_9f8a7b6c-4d3e-2f1a",
  "projectName": "spring-petclinic",
  "detectedStack": {
    "backend": {
      "framework": "Spring Boot",
      "frameworkVersion": "3.2.1",
      "javaVersion": "21",
      "buildTool": "Maven"
    },
    "frontend": {
      "framework": "React",
      "frameworkVersion": "18.2.0",
      "language": "TypeScript"
    },
    "database": {
      "type": "PostgreSQL",
      "entityCount": 12
    }
  },
  "metrics": {
    "controllerCount": 8,
    "serviceCount": 14,
    "repositoryCount": 10,
    "componentCount": 26,
    "totalApiEndpoints": 19,
    "dependencyCount": 42
  }
}
```

---

## 3. Visual Graph & Relationship APIs

### 3.1 Fetch Interactive Flow Graph (React Flow format)
- **Endpoint**: `GET /api/v1/projects/{projectId}/graph`
- **Query Params**: `layer` (optional: `all`, `frontend`, `backend`, `database`)
- **Response** (`200 OK`):
```json
{
  "nodes": [
    {
      "id": "node_btn_login",
      "type": "reactComponent",
      "data": {
        "label": "LoginButton.tsx",
        "layer": "FRONTEND",
        "file": "src/components/LoginButton.tsx",
        "method": "handleLoginClick"
      }
    },
    {
      "id": "node_ctrl_auth",
      "type": "springController",
      "data": {
        "label": "AuthController",
        "layer": "BACKEND",
        "endpoint": "/api/v1/auth/login",
        "httpMethod": "POST",
        "file": "com/petclinic/controller/AuthController.java",
        "method": "authenticateUser"
      }
    },
    {
      "id": "node_tbl_users",
      "type": "dbTable",
      "data": {
        "label": "users",
        "layer": "DATABASE",
        "entityClass": "com.petclinic.entity.User"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_btn_login",
      "target": "node_ctrl_auth",
      "label": "axios.post('/api/v1/auth/login')",
      "animated": true
    },
    {
      "id": "edge_2",
      "source": "node_ctrl_auth",
      "target": "node_tbl_users",
      "label": "UserRepository.findByUsername()",
      "animated": true
    }
  ]
}
```

### 3.2 Get Node Details & Call Hierarchy
- **Endpoint**: `GET /api/v1/projects/{projectId}/nodes/{nodeId}`
- **Response** (`200 OK`):
```json
{
  "nodeId": "node_ctrl_auth",
  "name": "AuthController",
  "package": "com.petclinic.controller",
  "filePath": "src/main/java/com/petclinic/controller/AuthController.java",
  "annotations": ["@RestController", "@RequestMapping(\"/api/v1/auth\")"],
  "calledBy": [
    { "nodeId": "node_btn_login", "name": "LoginButton.tsx", "layer": "FRONTEND" }
  ],
  "calls": [
    { "nodeId": "node_srv_auth", "name": "AuthenticationService.java", "layer": "BACKEND" }
  ],
  "educationalContext": {
    "purpose": "Handles HTTP REST requests for user authentication.",
    "interviewQuestions": [
      "What is the difference between @RestController and @Controller in Spring MVC?",
      "How does DispatcherServlet route requests to @PostMapping endpoints?"
    ]
  }
}
```

---

## 4. Entity-Relationship Diagram (ERD) API

### 4.1 Fetch Database ERD Nodes & Links
- **Endpoint**: `GET /api/v1/projects/{projectId}/erd`
- **Response** (`200 OK`):
```json
{
  "tables": [
    {
      "tableName": "owners",
      "entityClass": "com.petclinic.model.Owner",
      "columns": [
        { "name": "id", "type": "BIGINT", "isPrimaryKey": true },
        { "name": "first_name", "type": "VARCHAR(30)", "isPrimaryKey": false }
      ]
    },
    {
      "tableName": "pets",
      "entityClass": "com.petclinic.model.Pet",
      "columns": [
        { "name": "id", "type": "BIGINT", "isPrimaryKey": true },
        { "name": "owner_id", "type": "BIGINT", "isForeignKey": true }
      ]
    }
  ],
  "relationships": [
    {
      "fromTable": "owners",
      "toTable": "pets",
      "cardinality": "ONE_TO_MANY",
      "joinColumn": "owner_id"
    }
  ]
}
```

---

## 5. Global Search & Code Retrieval APIs

### 5.1 Global Fuzzy Search
- **Endpoint**: `GET /api/v1/projects/{projectId}/search`
- **Query Params**: `q` (e.g., `findByLastName`)
- **Response** (`200 OK`):
```json
{
  "query": "findByLastName",
  "totalMatches": 2,
  "results": [
    {
      "nodeId": "node_repo_owner",
      "type": "SPRING_REPOSITORY",
      "name": "OwnerRepository.findByLastName()",
      "filePath": "src/main/java/com/petclinic/repository/OwnerRepository.java",
      "lineStart": 34
    }
  ]
}
```

### 5.2 Retrieve File Snippet for Monaco Viewer
- **Endpoint**: `GET /api/v1/projects/{projectId}/file`
- **Query Params**: `filePath`
- **Response** (`200 OK`):
```json
{
  "filePath": "src/main/java/com/petclinic/repository/OwnerRepository.java",
  "language": "java",
  "content": "package com.petclinic.repository;\n\nimport org.springframework.data.repository.Repository;\n..."
}
```
