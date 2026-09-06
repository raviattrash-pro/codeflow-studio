# CodeFlow Studio 🚀 (v4.2.0 Release)
> **Observe, Replay & Master Real Code Execution — From HTTP Request down to Hibernate SQL in Milliseconds.**

[![Version](https://img.shields.io/badge/version-4.2.0-indigo.svg)](README.md)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](README.md)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2%2B-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

---

## 🎬 Live Interactive Workbench & Studio Showcase

![CodeFlow Studio Live Demo](docs/media/codeflow.gif)

> 💡 *CodeFlow Studio transforms complex Spring Boot + React architectures into live, interactive visual execution flows. Step through runtime call-stacks, inspect Spring Security 6 filter chains, audit database schemas, and debug performance bottlenecks.*

---

## 🎨 Design Philosophy & Architecture (v4.2.0 UI Overhaul)

CodeFlow Studio v4.2.0 integrates three modern frontend and interaction design philosophies:

| Design Methodology | Where Applied | Key Capabilities & Visual Details |
| :--- | :--- | :--- |
| **1. Emil Kowalski Motion Craft**<br>`emilkowalski/skill` | Hero Workbench, Modals, Navigation | • **Spring Physics Curves**: Custom `--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275)` for fluid dialogs and dropdown menus.<br>• **Interactive Scrubber**: Live step-by-step VCR player with auto-advancing ticker and manual stepping (`[Space]` shortcut).<br>• **Dynamic Code Inspector**: Clicking any architectural node dynamically inspects real Java/TypeScript code, annotations (`@RestController`, `@Transactional`, `@PreAuthorize`), and execution timings. |
| **2. Impeccable Anti-Slop Aesthetic**<br>`impeccable.style` | Obsidian Canvas, Window Frames, Typography | • **Obsidian Palette**: Deep `#070a12` background paired with a fine-grain engineering blueprint dot matrix grid (`blueprint-grid`).<br>• **macOS Traffic Light Chrome**: Realistic top frame with 🔴 🟡 🟢 controls, active breadcrumbs, and live status pills (`● 200 OK • 28.4ms`).<br>• **Tactile Keycaps**: Real physical-depth keycaps (`[D]` Demo, `[I]` Ingest, `[Space]` Step).<br>• **Technical Typography**: JetBrains Mono for call stacks, SQL queries, and telemetry metrics. |
| **3. Taste Skill Micro-Feedback**<br>`tasteskill.dev` | Live Workbench, Preset Scenarios, Mobile | • **Show-Don't-Tell Sandbox**: 5 live switchable views right on the landing page (*Architecture Flow*, *Trace Replay*, *Security Chain*, *Relational SQL*, *Latency Matrix*).<br>• **4 Scenario Presets**: Instant switching between *🛒 Checkout Flow*, *🔐 JWT Auth*, *📦 Inventory Cache*, and *📊 Telemetry Stream*.<br>• **100% Offline Demo Mode**: All 11 tools operate without requiring a running backend. |

---

## 📱 Mobile Responsiveness & 1-Tap Access (NEW)

- **⚡ Mobile 1-Tap Quick-Launch Tools Grid**: On mobile screens (<640px), a dedicated 2-column launcher grid appears right below the hero buttons, letting phone users tap directly into any of the 11 tools without endless scrolling.
- **🍔 Complete Mobile Drawer Navigation**: The hamburger menu (`<Menu />`) provides immediate access to all 11 architecture tools, theme view switchers, and the 1-click Demo launcher.
- **🎨 Contrast-Safe Responsive Layout**: Compact padding (`p-3.5`) and responsive typography ensure all node inspectors and telemetry tiles scale cleanly on 360px–430px viewports.

---

## 🛠️ Complete Suite of 11 Visual Architecture Tools

Every tool operates in **Interactive Demo Mode** (zero backend setup required) or against real ingested repositories:

| # | Tool / Modal | Component | Description & Scope |
|---|---|---|---|
| **1** | **⚡ Runtime Tracing Replay** | `RuntimeTracingModal.tsx` | Step-by-step VCR player playback from React UI down to Controller, Service, Hibernate, and PostgreSQL. |
| **2** | **📊 API Metrics & Telemetry** | `ApiMetricsDashboardModal.tsx` | Real-time P50/P90/P95/P99 response times, throughput RPS, SLA status, and error rate tracking. |
| **3** | **🔀 7-Swimlane Sequence Tracer** | `SequenceDiagramModal.tsx` | 12-hop asynchronous request and response lifecycle mapping across 7 architectural swimlanes. |
| **4** | **🔥 24-Hour Latency Heatmap** | `LatencyHeatmapModal.tsx` | 24-hour hourly quantile matrix with color-coded buckets and hover tooltips for bottleneck discovery. |
| **5** | **🗄️ Database ERD & Schema** | `ErDiagramModal.tsx` | `@Entity` relational table diagrams with column data types, primary keys, and foreign key linkages. |
| **6** | **🔐 Spring Security 6 Pipeline** | `SecurityExplorerModal.tsx` | 6-stage stateless filter chain inspection (`CorsFilter`, `JwtAuthenticationFilter`, `SecurityContextHolder`). |
| **7** | **💻 Live SQL Query Explorer** | `SqlExplorerModal.tsx` | Captured JPA prepared statements (SELECT, INSERT, UPDATE) with execution durations and row counts. |
| **8** | **📦 Maven Dependency Graph** | `DependencyExplorerModal.tsx` | `pom.xml` starter analyzer explaining auto-configuration mechanics (Web, JPA, Security, PostgreSQL). |
| **9** | **📁 5-Mode File Tree Visualizer** | `FileTreeModal.tsx` | 5 visualization modes: Interactive File Tree, ASCII Tree, Emoji Tree, Mermaid AST Diagram, and Galaxy 2D Canvas. |
| **10** | **🤖 AI Architecture Assistant** | `AiAssistantModal.tsx` | Automated code explanations, compliance auditing, query reviews, and interview question preparation. |
| **11** | **📝 Monaco Source Code Viewer** | `MonacoViewerModal.tsx` | Embedded code viewer with syntax highlighting for Controllers, Services, Repositories, and Config files. |

---

## 🎨 4 Theme View Options

- 🌑 **Night View (Obsidian Dark)**: High-contrast dark theme (`#070a12`) with neon cyan, indigo, and pink accents.
- ☀️ **Normal View (Clean Slate)**: Crisp light theme (`#ffffff`), dark slate typography (`#0f172a`), and clear borders.
- 🧼 **Neumorphic Soft View (Soft 3D Light)**: Extruded soft shadows (`9px 9px 18px #a3b1c6`) with inset tactile pill tags.
- 🧊 **Glassmorphism Gel View (Glossy Gel Mode)**: Translucent frosted glass paneling (`backdrop-filter: blur(20px)`) and glossy gel pill badges.

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
| **v4.1** | **Full-Stack Visuals** | API Metrics Dashboard, 7-Swimlane Sequence Flow Diagram, 24-Hour Latency Heatmap. |
| **v4.2 (Current)** | **Handcrafted UI & Workbench** | Emil Kowalski spring motion, Impeccable obsidian blueprint canvas, Taste Skill 5-view live interactive workbench, 4 scenario presets, and mobile 1-tap fast access grid. |
| **v5.0** | **React Runtime Explorer** | Virtual DOM reconciliation tracer, React state mutation visualization, and Axios interrupter. |
| **v6.0** | **AI Explanations** | Integrated RAG engine powered by Spring AI (Gemini / OpenAI / Ollama). |
| **v7.0** | **VS Code Extension** | Native IDE side-panel extension for direct visual execution flow exploration inside VS Code. |
| **v8.0** | **Chrome Extension** | Browser extension for GitHub repository pages to view interactive flow maps directly on github.com. |
| **v9.0** | **Team Collaboration** | Multi-user shared workspaces, live architectural annotations, and team review comments. |
| **v10.0** | **Enterprise Desktop** | Electron / Tauri Desktop app with 100% offline analysis (zero cloud code uploads). |

---

## 📋 License

MIT License © 2026 CodeFlow Studio Team.
