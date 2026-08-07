# CodeFlow Studio - Product Requirements Document (PRD) & Requirements Specification

## 1. Overview & Vision
**CodeFlow Studio** is an interactive, visual code intelligence platform designed to parse full-stack projects (initially Java Spring Boot + React + Maven + SQL) and generate interactive end-to-end execution flow diagrams ("Google Maps for Source Code"). It enables software engineers, architects, and engineering managers to visualize how data flows from user interactions in React down to database tables and back.

---

## 2. Functional Requirements (FR)

### FR-1: Project Ingestion & Source Code Input
- **FR-1.1**: Public GitHub repository ingestion via HTTPS clone URL (using JGit).
- **FR-1.2**: Compressed archive (.ZIP) file upload support up to 100 MB.
- **FR-1.3**: Automatic post-analysis cleanup of raw cloned/extracted source code to guarantee security and minimize storage overhead.
- **FR-1.4**: Asynchronous background job processing for project parsing with real-time status updates via WebSockets/polling.

### FR-2: Technology Stack & Dependency Detection
- **FR-2.1**: Automated detection of backend components (`pom.xml` analysis: Spring Boot version, Java version, Spring Web, Spring Security, Spring Data JPA, Jackson, Tomcat).
- **FR-2.2**: Automated detection of frontend components (`package.json` analysis: React version, TypeScript, Vite/Next.js, Axios, React Query, Redux/Context API).
- **FR-2.3**: Automated detection of database technologies (`@Entity`, `application.properties` / `application.yml` inspection: PostgreSQL, MySQL).
- **FR-2.4**: Rich dependency metadata rendering (clicking a dependency explains its role, underlying classes, annotations, and interview concepts).

### FR-3: Multi-Layer Static Parsing
- **FR-3.1 Maven/Build Parser**: Extracts plugins, parent projects, build profiles, direct and transitive dependencies.
- **FR-3.2 Java Backend Parser**: Analyzes Spring annotations (`@RestController`, `@Service`, `@Repository`, `@Entity`, `@Bean`, `@Autowired`, `@RequestMapping`, `@GetMapping`, `@PostMapping`). Builds ASTs to extract package names, class names, method signatures, return types, injected fields, and imports.
- **FR-3.3 React Frontend Parser**: Parses JS/TSX files for component hierarchies, custom hooks, state variables, routes (`react-router`), and HTTP client invocations (`axios.get/post`, `fetch`).
- **FR-3.4 Database ERD Engine**: Maps `@Entity`, `@Table`, and JPA relationship annotations (`@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@OneToOne`) to generate interactive Entity-Relationship Diagrams.

### FR-4: Relationship Engine & Cross-Layer Linkage
- **FR-4.1**: Linkage of React event handlers / API call sites to Spring Boot RestController endpoints via path matching (matching request paths like `/api/v1/users` and HTTP verbs `GET`, `POST`, `PUT`, `DELETE`).
- **FR-4.2**: Linkage of Controllers to Services, Services to Repositories, and Repositories to Database Tables.
- **FR-4.3**: Bidirectional navigation (Forward: UI Button -> Axios -> Endpoint -> Controller -> Service -> DB Table; Reverse: DB Table -> Repository -> Service -> Controller -> UI Component).

### FR-5: Interactive Visual Project Explorer & Code Viewer
- **FR-5.1 Interactive Graph Canvas**: Rendered using React Flow with custom nodes representing React Components, Endpoints, Java Controllers, Services, Repositories, and SQL Tables.
- **FR-5.2 Node Inspector Panel**: Displays method details, annotations, call hierarchies, execution order, and code snippets.
- **FR-5.3 Integrated Code Viewer**: Embedded Monaco Editor with syntax highlighting, automatic line jumping, and method highlighting when selecting graph nodes.
- **FR-5.4 Global Search**: Instant fuzzy searching across Controllers, Services, Entities, Routes, Components, Dependencies, and API Endpoints.

---

## 3. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
- **NFR-1.1 Analysis Latency**: Repositories under 500 files must complete static analysis and graph construction within 8 seconds.
- **NFR-1.2 UI Rendering Performance**: Visual graph rendering must maintain 60 FPS during pan, zoom, and node selection for graphs containing up to 1,000 nodes.
- **NFR-1.3 API Response Time**: Graph data fetch APIs (`/api/v1/projects/{id}/graph`) must respond in < 150 ms for cached graphs.

### NFR-2: Scalability & Throughput
- **NFR-2.1 Concurrency**: Support up to 100 concurrent static analysis jobs without degradation using a thread-pool worker architecture.
- **NFR-2.2 Horizontal Scaling**: Stateless Spring Boot backend services designed for containerized horizontal auto-scaling on Kubernetes/Cloud platforms.

### NFR-3: Security & Privacy
- **NFR-3.1 Zero Residual Code Footprint**: Cloned repositories and extracted ZIP files must be permanently deleted from local disk immediately after AST parsing.
- **NFR-3.2 Input Sanitization & Path Traversal Defense**: Strict validation of repository URLs and ZIP file paths to prevent Directory Traversal (`../`) attacks during unzipping.
- **NFR-3.3 Resource Limits**: Maximum repo size limited to 100 MB; maximum AST node count per project limited to 50,000 to prevent Denial of Service (DoS).

### NFR-4: Reliability & Availability
- **NFR-4.1 Availability**: 99.9% uptime for core API and visualization services.
- **NFR-4.2 Graceful Parsing Degradation**: Syntax errors or unparseable files in a repository must not crash the entire ingestion pipeline; non-parseable files are logged as skipped nodes while parsing continues.

### NFR-5: Usability & Accessibility
- **NFR-5.1 Modern UI Aesthetics**: Dark mode first design, glassmorphism, responsive split view layout, clear visual differentiation for frontend vs backend vs database nodes.
- **NFR-5.2 Keyboard Shortcuts**: Global shortcut support (`Ctrl+K` for global search, `Esc` to close modal, `Space` to center canvas).

---

## 4. MVP vs Future Scope Matrix

| Feature | MVP (v1.0) | Version 2.0 (Near-term) | Version 3.0+ (Long-term) |
|---|---|---|---|
| Languages Supported | Java 21, TypeScript, JavaScript | Python, C# (.NET Core) | Go, Rust, C++ |
| Frameworks Supported | Spring Boot 3.x, React 18/19 | Angular, Vue, Express.js | Django, ASP.NET Core |
| Build Tools | Maven | Gradle | npm/pnpm workspaces |
| Input Sources | Public GitHub URL, ZIP Upload | GitHub OAuth (Private Repos) | GitLab, Bitbucket |
| Execution Tracing | Static AST Analysis | Spring AOP Runtime Tracing | OpenTelemetry / ByteBuddy |
| AI Integration | None | AI Code Explanations (Gemini) | Interactive AI Debugging |
| Platform | Web App | Desktop App (Tauri) | VS Code / Chrome Extensions |
