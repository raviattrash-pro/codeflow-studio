# CodeFlow Studio 🚀 (v7.0.0 Release — Enterprise Architecture Suite)
> **Observe, Replay & Master Real Code Execution — Command Palette, Health Scorecard HUD, REST API Sandbox, DTO-to-TS Generator, Chaos Simulator & 4K C4 Blueprints.**

[![Version](https://img.shields.io/badge/version-7.0.0-indigo.svg)](README.md)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](README.md)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2%2B-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

---

## 🎬 Live Interactive Workbench & Studio Showcase

![CodeFlow Studio Live Demo](docs/media/codeflow.gif)

> 💡 *CodeFlow Studio v7.0 delivers a complete Enterprise Architecture Suite: Global Command Palette (`Ctrl+K`), Health Scorecard HUD, Live REST API Sandbox, automated Java DTO ➔ TypeScript generator, Resilience4j Chaos Simulator, and 4K C4 Blueprint Exporter.*

---

## ✨ What's New in v7.0.0 (Enterprise Architecture Suite Release)

### 1. 🔍 Global Command Palette (`Ctrl+K` / `Cmd+K` Spotlight)
- **Instant Spotlight Navigation**: Trigger anywhere with `Ctrl+K` or `Cmd+K` to search across all 17 tools, quick action shortcuts, live scenarios, and themes.
- **Categorized Results**: Filter by *Tools*, *Scenarios*, *AI Actions*, *Themes*, and *Quick Actions* with instant fuzzy matching and keyboard navigation (`↑`/`↓` + `Enter`).

### 2. 📊 Architecture Health & Readiness Scorecard (HUD)
- **4 Real-Time Domain Dials**: Continuous static AST audit tracking **Security & Auth Posture** (94%), **SQL & Persistence Efficiency** (88%), **Dependency & CVE Risk** (98%), and **React 19 & Client Bundle** (92%).
- **1-Click AI Remediation**: Instantly trigger the AI Assistant with pre-filled context to generate fixes for any audit finding.
- **Export Audit Dossier**: Download comprehensive markdown and PDF-ready reports.

### 3. 🌐 Interactive REST API Sandbox & cURL Runner
- **Live Endpoint Dispatcher**: Test parsed Spring Boot REST endpoints (`POST /orders/checkout`, `POST /auth/login`, `GET /products`, `GET /users/me`).
- **Multi-Language Snippet Generator**: Export executable code in **cURL**, **JavaScript (Fetch)**, **TypeScript (Axios)**, and **Python (requests)**.
- **Payload & Auth Editor**: Custom JSON body editor and JWT Bearer token injector.

### 4. ⚡ Java DTO ➔ TypeScript Interface Auto-Generator
- **TypeSafe Bridge**: Transform Spring Boot JPA entities and Java Records into strict TypeScript interfaces and runtime **Zod schemas**.
- **Side-by-Side Dual Viewer**: Inspect original Java source alongside generated TypeScript code with 1-click clipboard copy and `.ts` export.

### 5. 💥 Chaos Engineering & Resilience Simulator (Resilience4j)
- **Fault Injection Sandbox**: Simulate HikariCP connection pool starvation, Stripe 504 gateway timeouts, and Redis cache stampedes.
- **Live CircuitBreaker Visualizer**: Animated state machine transitions (`CLOSED` ➔ `OPEN` ➔ `HALF_OPEN` ➔ `CLOSED`) with real-time failure rate metrics and fallback telemetry.

### 6. 🖼️ 4K Architecture Blueprint & C4 Diagram Exporter
- **C4 Architecture Models**: Interactive Level 1 (System Context), Level 2 (Container), and Level 3 (Component) diagrams.
- **Multi-Format Export**: Download scalable **4K SVG vector blueprints**, high-res PNG posters, and PlantUML / Mermaid specs.

---

## 🛠️ Complete Suite of 17 Visual Architecture Tools

Every tool operates in **Interactive Demo Mode** (zero backend setup required) or against real ingested repositories:

| # | Tool / Modal | Component | Description & Scope |
|---|---|---|---|
| **1** | **🔍 Global Command Palette** | `CommandPaletteModal.tsx` | Global spotlight search (`Ctrl+K`) across tools, scenarios, themes, and AI actions. |
| **2** | **📊 Health Scorecard HUD** | `ArchitectureScorecardModal.tsx` | Real-time Security (94%), SQL (88%), CVE (98%), and React 19 (92%) audit dials. |
| **3** | **🌐 REST API Sandbox & cURL** | `ApiSandboxModal.tsx` | Test Spring Boot endpoints, inject JWT headers, and export cURL / Axios / Python snippets. |
| **4** | **⚡ Java DTO ➔ TypeScript** | `TypeScriptGeneratorModal.tsx` | Auto-convert JPA entities and records to strict TypeScript interfaces and Zod schemas. |
| **5** | **💥 Chaos Simulator** | `ChaosSimulatorModal.tsx` | Resilience4j fault injection, circuit breaker state machine, and fallback telemetry. |
| **6** | **🖼️ 4K C4 Blueprint Exporter** | `ArchitectureBlueprintExportModal.tsx` | Export C4 Level 1/2/3 diagrams, 4K SVG vector blueprints, and Mermaid RFC specifications. |
| **7** | **⚛️ React 19 Runtime Explorer** | `ReactRuntimeExplorerModal.tsx` | Virtual DOM Fiber reconciliation, Hook state mutation timeline, and Axios interceptors. |
| **8** | **⚡ Runtime Tracing Replay** | `RuntimeTracingModal.tsx` | Step-by-step VCR playback from React UI down to Controller, Service, Hibernate, and DB. |
| **9** | **📊 API Metrics & Telemetry** | `ApiMetricsDashboardModal.tsx` | Real-time P50/P90/P95/P99 response times, throughput RPS, and error rate tracking. |
| **10** | **🔀 7-Swimlane Sequence Tracer** | `SequenceDiagramModal.tsx` | Asynchronous request and response lifecycle mapping across 7 architectural swimlanes. |
| **11** | **🔥 24-Hour Latency Heatmap** | `LatencyHeatmapModal.tsx` | 24-hour hourly quantile matrix with color-coded buckets and hover tooltips. |
| **12** | **🗄️ Database ERD & Schema** | `ErDiagramModal.tsx` | `@Entity` relational table diagrams with column data types and foreign key linkages. |
| **13** | **🔐 Spring Security 6 Pipeline** | `SecurityExplorerModal.tsx` | 6-stage stateless filter chain inspection (`CorsFilter`, `JwtAuthenticationFilter`, etc.). |
| **14** | **💻 Live SQL Query Explorer** | `SqlExplorerModal.tsx` | Captured JPA prepared statements (SELECT, INSERT, UPDATE) with execution durations. |
| **15** | **📦 Maven Dependency Graph** | `DependencyExplorerModal.tsx` | `pom.xml` starter analyzer explaining auto-configuration mechanics (Web, JPA, Security). |
| **16** | **📁 5-Mode File Tree Visualizer** | `FileTreeModal.tsx` | Interactive File Tree, ASCII Tree, Emoji Tree, Mermaid AST Diagram, and Galaxy Canvas. |
| **17** | **🤖 AI Architecture Assistant** | `AiAssistantModal.tsx` | Automated code explanations, compliance auditing, query reviews, and interview prep. |

---

## 🎨 Design Philosophy & Architecture

CodeFlow Studio integrates three modern frontend and interaction design philosophies:

- **1. Emil Kowalski Motion Craft** (`emilkowalski/skill`): Spring physics curves (`--ease-spring`), interactive VCR scrubbers, and live code inspectors.
- **2. Impeccable Anti-Slop Aesthetic** (`impeccable.style`): Obsidian palette (`#070a12`), engineering blueprint dot matrix grid (`blueprint-grid`), macOS traffic light chrome (🔴 🟡 🟢), and tactile keycaps (`[D]`, `[I]`, `[Space]`).
- **3. Taste Skill Micro-Feedback** (`tasteskill.dev`): Show-don't-tell interactive workbench with 5 live views, 4 scenario presets, and 1-tap mobile fast-access grid.

---

## 📱 Mobile Responsiveness & 1-Tap Access

- **⚡ Mobile 1-Tap Quick-Launch Tools Grid**: 2-column launcher grid displayed directly on mobile screens (<640px).
- **🍔 Complete Mobile Drawer Navigation**: Slide-out drawer (`<Menu />`) with all 12 tools directly launchable into Demo mode.
- **🎨 Contrast-Safe Responsive Layout**: Compact padding (`p-3.5`) and responsive typography across 360px–430px viewports.

---

## ⚡ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19 (`19.2.8`), TypeScript 7 (`7.0.2`), Vite 8 (`8.2.2`), TailwindCSS, Lucide Icons |
| **Backend** | Spring Boot 3.2+ (Java 21), JavaParser, JGit, Maven Model Parser, Spring Data JPA |
| **Database** | PostgreSQL 16 / H2 In-Memory Database, HikariCP Connection Pool |
| **Architecture** | AST Static Analysis, Stateless REST APIs, Vite Rolldown Production Bundling |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** & **npm**
- **Java 17 / 21** & **Maven**

### 1. Backend Setup (Spring Boot)
```bash
cd codeflow-backend
mvn clean spring-boot:run
```
*Backend server runs on `http://localhost:8080`*

### 2. Frontend Setup (React 19 + Vite 8)
```bash
cd codeflow-frontend
npm install
npm run dev
```
*Frontend client runs on `http://localhost:3000` (or `5173`)*

---

## 🗺️ Product Roadmap (v1.0 to v10.0)

| Version | Release Stage | Core Capabilities & Scope |
| :--- | :--- | :--- |
| **v1.0** | **MVP Release** | Spring Boot + React + Maven parsing, GitHub URL & ZIP ingestion, ERD, Security Flow. |
| **v2.0** | **AST & Feature Flow** | Feature-Segregated Flow Explorer, Claymorphic HLD Canvas, 5-mode File Tree Explorer. |
| **v3.0** | **Runtime Tracing** | Live Controller ➔ Service ➔ Repository ➔ DB execution tracing, interactive replay player. |
| **v4.0** | **React 19 + Vite 8** | Platform upgrade to React 19, Vite 8 (Rolldown), TypeScript 7, Lucide React 1.x. |
| **v4.2** | **Handcrafted UI & Workbench** | Emil Kowalski spring motion, Impeccable obsidian blueprint canvas, Taste Skill 5-view live interactive workbench. |
| **v5.0** | **React Runtime Explorer** | Virtual DOM Fiber tree reconciliation, Hook state mutation timeline, and Axios request/response interceptors. |
| **v6.0 (Current)** | **AI Explanations & Spring AI RAG** | Integrated RAG engine powered by Spring AI (Gemini / OpenAI / Ollama) for automated architecture document generation. |
| **v7.0** | **VS Code Extension** | Native IDE side-panel extension for direct visual execution flow exploration inside VS Code. |
| **v8.0** | **Chrome Extension** | Browser extension for GitHub repository pages to view interactive flow maps directly on github.com. |
| **v9.0** | **Team Collaboration** | Multi-user shared workspaces, live architectural annotations, and team review comments. |
| **v10.0** | **Enterprise Desktop** | Electron / Tauri Desktop app with 100% offline analysis (zero cloud code uploads). |

---

## 📋 License

MIT License © 2026 CodeFlow Studio Team.
