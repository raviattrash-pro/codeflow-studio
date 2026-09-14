# CodeFlow Studio 🚀 (v5.0.0 Release)
> **Observe, Replay & Master Real Code Execution — From React 19 Virtual DOM Reconciliation down to Hibernate SQL in Milliseconds.**

[![Version](https://img.shields.io/badge/version-5.0.0-indigo.svg)](README.md)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](README.md)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2%2B-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

---

## 🎬 Live Interactive Workbench & Studio Showcase

![CodeFlow Studio Live Demo](docs/media/codeflow.gif)

> 💡 *CodeFlow Studio v5.0 brings full-stack observability to Spring Boot 3 + React 19 architectures. Step through client-side React Fiber re-renders, Hook mutations, and Axios interceptors, alongside backend Spring Security filter chains, JPA execution traces, and database schemas.*

---

## ✨ What's New in v5.0.0 (React Runtime Explorer Release)

### 1. ⚛️ React 19 Virtual DOM & Fiber Tree Visualizer (NEW)
- **Component Hierarchy & Re-render Diagnostics**: Visualizes the live React 19 Fiber tree (`App` ➔ `QueryClientProvider` ➔ `CheckoutPage` ➔ `OrderSummary` ➔ `PaymentForm` ➔ `SubmitButton`).
- **Re-render Cause Analysis**: Color-coded render indicators with exact causal breakdowns (*State update in useMutation*, *Prop change: isLoading*, *Context broadcast*).
- **Sub-Millisecond Timing Metrics**: Mount and re-render duration gauges for every individual component node.

### 2. 🪝 Hook Lifecycle & State Mutation Scrubber (NEW)
- **Interactive VCR Timeline Player**: Step forward and backward through React state transitions (`useState`, `useReducer`, `useMutation`, `useEffect`, `useOptimistic`).
- **State Diff Inspector**: Side-by-side visual diffs comparing `stateBefore` and `stateAfter` with syntax highlighting.
- **Source Code Snippet Viewer**: Embedded code previews with 1-click clipboard copying.

### 3. 🌐 Full Client-Side Axios & Fetch Interceptor Pipeline (NEW)
- **6-Stage Client Execution Flow**: `USER_EVENT` ➔ `REQUEST_INTERCEPTOR` (JWT Bearer injection) ➔ `NETWORK_TRANSPORT` (28.4ms TLS 1.3) ➔ `RESPONSE_INTERCEPTOR` ➔ `CACHE_UPDATE` (TanStack Query invalidation) ➔ `DOM_COMMIT`.

---

## 🛠️ Complete Suite of 12 Visual Architecture Tools

Every tool operates in **Interactive Demo Mode** (zero backend setup required) or against real ingested repositories:

| # | Tool / Modal | Component | Description & Scope |
|---|---|---|---|
| **1** | **⚛️ React 19 Runtime Explorer** | `ReactRuntimeExplorerModal.tsx` | Virtual DOM Fiber reconciliation, Hook state mutation timeline, and Axios interceptor pipeline. |
| **2** | **⚡ Runtime Tracing Replay** | `RuntimeTracingModal.tsx` | Step-by-step VCR player playback from React UI down to Controller, Service, Hibernate, and PostgreSQL. |
| **3** | **📊 API Metrics & Telemetry** | `ApiMetricsDashboardModal.tsx` | Real-time P50/P90/P95/P99 response times, throughput RPS, SLA status, and error rate tracking. |
| **4** | **🔀 7-Swimlane Sequence Tracer** | `SequenceDiagramModal.tsx` | 12-hop asynchronous request and response lifecycle mapping across 7 architectural swimlanes. |
| **5** | **🔥 24-Hour Latency Heatmap** | `LatencyHeatmapModal.tsx` | 24-hour hourly quantile matrix with color-coded buckets and hover tooltips for bottleneck discovery. |
| **6** | **🗄️ Database ERD & Schema** | `ErDiagramModal.tsx` | `@Entity` relational table diagrams with column data types, primary keys, and foreign key linkages. |
| **7** | **🔐 Spring Security 6 Pipeline** | `SecurityExplorerModal.tsx` | 6-stage stateless filter chain inspection (`CorsFilter`, `JwtAuthenticationFilter`, `SecurityContextHolder`). |
| **8** | **💻 Live SQL Query Explorer** | `SqlExplorerModal.tsx` | Captured JPA prepared statements (SELECT, INSERT, UPDATE) with execution durations and row counts. |
| **9** | **📦 Maven Dependency Graph** | `DependencyExplorerModal.tsx` | `pom.xml` starter analyzer explaining auto-configuration mechanics (Web, JPA, Security, PostgreSQL). |
| **10** | **📁 5-Mode File Tree Visualizer** | `FileTreeModal.tsx` | 5 visualization modes: Interactive File Tree, ASCII Tree, Emoji Tree, Mermaid AST Diagram, and Galaxy 2D Canvas. |
| **11** | **🤖 AI Architecture Assistant** | `AiAssistantModal.tsx` | Automated code explanations, compliance auditing, query reviews, and interview question preparation. |
| **12** | **📝 Monaco Source Code Viewer** | `MonacoViewerModal.tsx` | Embedded code viewer with syntax highlighting for Controllers, Services, Repositories, and Config files. |

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
| **v5.0 (Current)** | **React Runtime Explorer** | Virtual DOM Fiber tree reconciliation, Hook state mutation timeline, and Axios request/response interceptors. |
| **v6.0** | **AI Explanations & Spring AI RAG** | Integrated RAG engine powered by Spring AI (Gemini / OpenAI / Ollama) for automated architecture document generation. |
| **v7.0** | **VS Code Extension** | Native IDE side-panel extension for direct visual execution flow exploration inside VS Code. |
| **v8.0** | **Chrome Extension** | Browser extension for GitHub repository pages to view interactive flow maps directly on github.com. |
| **v9.0** | **Team Collaboration** | Multi-user shared workspaces, live architectural annotations, and team review comments. |
| **v10.0** | **Enterprise Desktop** | Electron / Tauri Desktop app with 100% offline analysis (zero cloud code uploads). |

---

## 📋 License

MIT License © 2026 CodeFlow Studio Team.
