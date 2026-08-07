# CodeFlow Studio - High-Level Design (HLD)

This document describes the high-level architecture, system topology, component interactions, and data flow pipelines for **CodeFlow Studio**.

---

## 1. System Architecture Topology

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                 React 19 + TypeScript SPA (Cloudflare Pages)                |  |
|  |  +------------------+  +--------------------+  +-------------------------+  |  |
|  |  |  React Flow Graph|  | Monaco Code Editor |  | Component & ER Inspector|  |  |
|  |  +------------------+  +--------------------+  +-------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                     HTTPS | REST API / WebSockets
                                           v
+-----------------------------------------------------------------------------------+
|                             BACKEND ENGINE LAYER                                  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                     Spring Boot 3.2 Backend Service                         |  |
|  |                                                                             |  |
|  |  +-------------------------+            +--------------------------------+  |  |
|  |  | Ingestion Controller    |            | Async Analysis Task Executor   |  |  |
|  |  +------------+------------+            +---------------+----------------+  |  |
|  |               |                                         |                   |  |
|  |               v                                         v                   |  |
|  |  +-------------------------+            +--------------------------------+  |  |
|  |  | Git / ZIP Fetcher       |            | Multi-Language Static Parser   |  |  |
|  |  | (JGit / ZipInputStream) |            | - Maven Model Parser           |  |  |
|  |  +------------+------------+            | - JavaParser (AST Builder)     |  |  |
|  |               |                         | - React TypeScript AST Parser  |  |  |
|  |               v                         +---------------+----------------+  |  |
|  |  +-------------------------+                            |                   |  |
|  |  | Ephemeral Workspace Scratch|                            v                   |  |
|  |  | (Auto-cleaned after parse)|            +--------------------------------+  |  |
|  |  +-------------------------+            | Relationship Graph Resolver    |  |  |
|  |                                         +---------------+----------------+  |  |
|  +---------------------------------------------------------|-------------------+  |
+------------------------------------------------------------|----------------------+
                                                             |
                                                             v
+-----------------------------------------------------------------------------------+
|                                 DATA LAYER                                        |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                   Neon PostgreSQL Relational Database                       |  |
|  |  - Project Metadata       - Nodes & Edges          - ER Schema Tables       |  |
|  |  - Dependencies           - Full Graph JSON        - User Preferences       |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. End-to-End Data Flow Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React SPA
    participant Backend as Spring Boot Controller
    participant Worker as Async Parser Worker
    participant Disk as Ephemeral Workspace
    participant DB as Neon PostgreSQL

    User->>Frontend: Submit GitHub URL or Upload ZIP
    Frontend->>Backend: POST /api/v1/projects/github (or /upload)
    Backend->>DB: Create Project record (Status: QUEUED)
    Backend-->>Frontend: Return 202 Accepted (projectId & status)
    Backend->>Worker: Dispatch Async Ingestion Task

    loop Status Polling / WebSocket
        Frontend->>Backend: GET /api/v1/projects/{id}/status
        Backend-->>Frontend: Status: PROCESSING (Progress: 45%)
    end

    Worker->>Disk: Clone Git Repo via JGit (or extract ZIP)
    Worker->>Worker: Execute Maven Model Parser (pom.xml)
    Worker->>Worker: Execute JavaParser AST on *.java files
    Worker->>Worker: Execute TSX AST Parser on *.tsx/*.jsx files
    Worker->>Worker: Execute JPA AST Parser on @Entity files
    Worker->>Worker: Run Cross-Layer Relationship Resolver
    Worker->>DB: Save Parsed Nodes, Edges, Dependencies & ERD
    Worker->>Disk: Purge Ephemeral Source Files (Auto-cleanup)
    Worker->>DB: Update Project Status to COMPLETED

    Frontend->>Backend: GET /api/v1/projects/{id}/graph
    Backend->>DB: Read Cached Graph Nodes & Edges
    Backend-->>Frontend: Return React Flow JSON
    Frontend->>User: Render Interactive Visual Code Map
```

---

## 3. Core Component Breakdown

### 3.1 Ingestion Service
- Accepts git repository URLs or multipart ZIP files.
- Employs strict path sanitization to prevent path traversal vulnerability (`zipEntry.getName().contains("..")`).
- Interacts with **Ephemeral Scratch Volume** to write extracted source files temporarily.

### 3.2 Static Parsing Engine
- **Maven Parser**: Inspects `pom.xml` using `org.apache.maven:maven-model` to capture Spring Boot versions, starters, and dependency trees.
- **Java AST Parser**: Leverages `com.github.javaparser:javaparser-symbol-solver-core` to scan annotations (`@RestController`, `@Service`, `@Repository`, `@Entity`), methods, variables, and cross-class imports.
- **React Parser**: Leverages Node.js CLI script or Regex/AST regex-based AST scanner to parse TypeScript React components, routes, state hooks, and HTTP API clients (`axios.get/post`).

### 3.3 Relationship Graph Resolver Engine
Matches backend REST endpoints to frontend API calls via heuristic path matching:
1. Extract Spring Controller request mapping path: e.g., `@RequestMapping("/api/users")` + `@GetMapping("/{id}")` $\rightarrow$ `GET /api/users/{id}`.
2. Extract React client HTTP invocation path: e.g., `axios.get('/api/users/' + userId)` $\rightarrow$ regex match `GET /api/users/{id}`.
3. Establish directed graph edge: `[ReactComponent.tsx] -> [GET /api/users/{id}] -> [UserController.java] -> [UserService.java] -> [UserRepository.java] -> [users Table]`.

### 3.4 Storage & Graph Renderer
- Stores final graphs in Neon PostgreSQL as normalized tables (`project_nodes`, `project_edges`, `project_dependencies`) and as a denormalized JSON payload for fast client retrieval.
- Frontend uses **React Flow** with custom SVG node types for visually distinctive layer rendering.
