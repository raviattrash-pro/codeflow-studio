# CodeFlow Studio 🚀 (v2.3.0)
### *Google Maps for Source Code* — Interactive Execution Flow Explorer for Spring Boot & React

CodeFlow Studio is an enterprise-grade visual code comprehension application designed to help developers instantly understand any Java Spring Boot + React project without manually reading hundreds of files.

---

## 🌟 Key Features (v2.3.0 Release)

- **📦 Feature-Segregated Execution Flow Explorer**:
  - Automatically parses Spring `@RestController` endpoints from any imported codebase into dedicated **Feature Scenarios** (e.g., Auth Flow, File Management, Orders & Checkout).
  - **Searchable Feature Dropdown**: Filter through 90+ endpoints instantly by controller name, URL path, or HTTP method (`GET`, `POST`, `PUT`, `DELETE`).
  - **Per-Feature Architecture Diagrams**: Renders a dedicated 5-column architecture diagram and step timeline specific to the selected feature.

- **🗺️ Claymorphic HLD Architecture Canvas & Step Inspector**:
  - Visual 5-column architecture canvas (**Clients → API Gateway → Controllers → Services → DB & Cache**) with claymorphic cards and animated connection lines.
  - **Full-Detail Slide-Over Inspector Drawer**: Clicking any box or step opens an always-expanded inspector drawer (`w-[450px]`) detailing:
    - 📌 **Component Header & Source Code Link** (Direct access to Monaco Code Viewer)
    - ⚡ **Purpose & Role in Architecture**
    - 🔄 **Data Flow Execution Path** (Step-by-step inputs, validation, and SQL queries)
    - ✨ **Framework Annotations & Internal Mechanics** (`@RestController`, `@Service`, `@Transactional`, `@Repository`, `@Entity`, etc.)
    - 📚 **Interview Q&A Engine** (Curated questions and detailed answers)

- **📁 Interactive File Tree Explorer (5 View Modes)**:
  - Backend API `GET /api/v1/projects/{projectId}/file-tree` builds a nested AST file tree.
  - **5 Visualization Modes**:
    1. 📂 **Interactive File Tree** (Collapsible folder hierarchy with file size & line count)
    2. 📝 **ASCII Tree** (Plain text copyable ASCII directory tree)
    3. 🎨 **Emoji Tree** (Visually rich emoji file system view)
    4. 🧜‍♂️ **Mermaid AST Diagram** (Flowchart diagram tree)
    5. 🌌 **Galaxy 2D Canvas View** (Interactive 2D starfield particle view)

- **⚡ Instant Repository Ingestion**:
  - Import any project via **GitHub Repository URL** or **ZIP Upload**.
  - Parses `pom.xml`, Java AST files, React components, Axios REST API calls, and database schema mappings.

- **🛡️ Integrated Developer Suite**:
  - **ER Diagram Explorer**: Visual entity relationship mapping.
  - **Security Flow Explorer**: Step-by-step SecurityFilterChain and JWT token evaluation.
  - **SQL Explorer**: Spring Data JPA query translation & HQL breakdown.
  - **AI Assistant Modal**: Contextual code explanation & refactoring advice.
  - **Dependency Explorer**: Breakdown of Maven starters & Spring transitive dependencies.
  - **Export Markdown**: 1-click architectural documentation download (`architecture-export.md`).

---

## 🏗️ Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────────┐
   │                    React 18 + TypeScript                    │
   │       TailwindCSS • Lucide Icons • Monaco Editor            │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ REST API
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                Spring Boot 3.2 (Java 21)                    │
   │  JavaParser • JGit • Maven Model Parser • Spring Data JPA   │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ Persistence
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                    PostgreSQL / H2 Database                 │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** & **npm**
- **Java 17 / 21** & **Maven**

### 1. Backend Setup (Spring Boot)
```bash
cd codeflow-backend
mvn clean spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 2. Frontend Setup (React + Vite)
```bash
cd codeflow-frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 📋 Release Versions & Branch Structure

- **`main`**: Latest production release (`v2.3.0`).
- **`v2.3-prd-features`**: Feature-Segregated Flow Explorer, Dynamic Endpoint Parser, File Tree Modal (5 View Modes), Claymorphic HLD Canvas, and modal layout bounds fixes.
- **`v2.2-prd-enrichments`**: ERD Modal scrolling, solid modal backdrops, compact header dropdowns, and Blob markdown exporter.
- **`v2.1-prd-features`**: AI Assistant, Security Flow Explorer, and SQL Query Translator.
- **`v2.0-upgrade`**: Upgraded JavaParser AST engine, Spring Boot 3 support, and Monaco viewer integration.
- **`v1.1-docs`**: Architectural PRD, SRS, LLD, and Database Design Documentation in `/docs`.
- **`v1.0-mvp`**: Core MVP Release containing end-to-end parsing pipeline and basic HLD canvas.

---

## 📄 License
MIT License © 2026 CodeFlow Studio Team
