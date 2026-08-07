# CodeFlow Studio 🚀
### *Google Maps for Source Code* — Interactive Execution Flow Explorer for Spring Boot & React

CodeFlow Studio is an enterprise-grade visual code comprehension application designed to help developers instantly understand any Java Spring Boot + React project without manually reading hundreds of files.

---

## 🌟 Key Features

- **⚡ Instant Ingestion**: Import any project via **GitHub Repository URL** or **ZIP Upload**.
- **🔍 End-to-End AST Parsing**: Parses `pom.xml`, Java `@RestController`, `@Service`, `@Repository`, `@Entity`, and React JSX components.
- **🗺️ Interactive HLD Architecture Canvas**: Visual 5-column architecture canvas (Clients → API Gateway → Controllers → Services → DB & Cache) with SVG data flow arrows and numbered step circles.
- **⏯️ Execution Step Replay Timeline**: Play, pause, step forward/backward, and adjust playback speed (1x, 2x, 3x) to watch HTTP requests travel through the architecture.
- **📝 Integrated Monaco Code Viewer**: View and copy full file source code directly from the database with line highlights and annotation breakdowns.
- **🔎 Global Search & Jump**: Live search bar to search and jump to any Controller, Service, Repository, Endpoint, or Entity table.
- **📚 Interview Q&A Engine**: Expert-curated interview questions and detailed answers specific to every component type.
- **📦 Dependency Explorer**: Visual breakdown of Maven starters and internal Spring framework mechanics.

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

## 📋 Release Versions & Branches

- **`main` / `v1.0-mvp`**: Core MVP Release containing end-to-end parsing pipeline, HLD Canvas, Step Replay Timeline, Monaco Code Viewer, and Search.
- **`v1.1-docs`**: Comprehensive System Architecture, PRD, SRS, LLD, and Database Design Documentation in `/docs`.
- **`v2.0-roadmap`**: Feature specifications for Runtime Bytecode Tracing (ByteBuddy/OpenTelemetry) & AI Assistant module.

---

## 📄 License
MIT License © 2026 CodeFlow Studio Team
