# CodeFlow Studio 🚀 (v8.0.0 Release — Cloud, DevOps & Voice Architecture Suite)
> **Observe, Replay & Master Real Code Execution — Git PR Drift, Automated Test Generator, Cloud IaC / Docker Synthesizer, Kafka / WebSocket Streams, Voice Copilot & OpenTelemetry Distributed Tracing.**

[![Version](https://img.shields.io/badge/version-8.0.0-indigo.svg)](README.md)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](README.md)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2%2B-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

---

## 🎬 Live Interactive Workbench & Studio Showcase

![CodeFlow Studio Live Demo](docs/media/codeflow.gif)

> 💡 *CodeFlow Studio v8.0 delivers an end-to-end Cloud, DevOps & Voice Architecture Suite: Git PR Architecture Drift Detection, Automated RestAssured / Playwright Test Generation, Cloud IaC & Docker Compose Synthesis, Kafka / WebSocket Stream Visualizer, Voice Copilot, and OpenTelemetry Distributed Tracing.*

---

## ✨ What's New in v8.0.0 (Cloud, DevOps & Voice Architecture Suite)

### 1. ⚡ Git PR Architecture Drift Inspector (NEW)
- **Visual Branch Comparison**: Compare `main` against pull request branches (`feat/checkout-v2`).
- **Graph Delta Visualizer**: Color-coded nodes highlighting newly added routes, excised legacy APIs, and **Layer Boundary Violations** (e.g. Controllers bypassing the `@Service` layer).
- **Automated GitHub PR Comment**: 1-click generation of senior architect PR review assessments.

### 2. 🧪 Automated E2E Test Suite Generator (NEW)
- **Java RestAssured & Spring MockMvc**: 1-click test generation with `@SpringBootTest`, auth bearer token injection, and body assertions.
- **TypeScript Playwright / Vitest API Tests**: Strict contract tests with schema validations.

### 3. ☁️ Cloud IaC & Docker Compose Synthesizer (NEW)
- **Multi-Container Docker Compose**: Production setup with PostgreSQL 16 health checks, Redis 7, and networking.
- **AWS Terraform Modules**: ECS Fargate + RDS PostgreSQL infrastructure automation.
- **Kubernetes Helm Manifests**: Generates Deployments, Services, and liveness/readiness probes.

### 4. 🔄 Event Streams & Kafka / WebSocket Visualizer (NEW)
- **Topic & Consumer Group Telemetry**: Visualize Kafka producers, consumer lag, Spring `@MessageMapping`, and `SseEmitter` event channels.
- **Live Event Publisher Sandbox**: Publish test event payloads and monitor real-time consumer latency.

### 5. 🎙️ Voice Architecture Copilot (NEW)
- **Hands-Free Web Speech API**: Speak natural voice commands (*"Audit database entity relationships"*, *"Simulate Redis failure"*, *"Switch to Glassmorphism view"*).

### 6. 🧩 OpenTelemetry (OTel) Distributed Tracing (NEW)
- **Multi-Service Span Waterfall**: Trace requests from React Frontend down to API Gateway, Order Service, Stripe Gateway, and PostgreSQL.
- **Critical Path Bottleneck Isolation**: Automated highlighting of the dominating latency bottleneck span.

---

## 🛠️ Complete Suite of 23 Visual Architecture Tools

Every tool operates in **Interactive Demo Mode** (zero backend setup required) or against real ingested repositories:

| # | Tool / Modal | Component | Description & Scope |
|---|---|---|---|
| **1** | **⚡ Git PR Architecture Drift** | `ArchitectureDriftModal.tsx` | Compare PR branches against main to detect layer boundary breaches and API drift. |
| **2** | **🧪 Automated Test Generator** | `TestSuiteGeneratorModal.tsx` | Generate RestAssured Java tests and Playwright TypeScript suites with auth headers. |
| **3** | **☁️ Cloud IaC & Docker Synthesizer** | `CloudInfraSynthesizerModal.tsx` | Synthesize Docker Compose, AWS Terraform modules & Kubernetes manifests from AST. |
| **4** | **🔄 Kafka & WebSocket Streams** | `EventStreamVisualizerModal.tsx` | Visualize Kafka topics, consumer groups, and live WebSocket / SSE channels. |
| **5** | **🎙️ Voice Architecture Copilot** | `VoiceCopilotModal.tsx` | Speak natural voice commands to audit DB, simulate chaos & trigger AI remediation. |
| **6** | **🧩 OpenTelemetry Distributed Tracing** | `DistributedTracingModal.tsx` | Multi-service span waterfall with automated critical-path bottleneck isolation. |
| **7** | **🔍 Global Command Palette** | `CommandPaletteModal.tsx` | Global spotlight search (`Ctrl+K`) across all 23 tools, scenarios, themes, and AI actions. |
| **8** | **📊 Health Scorecard HUD** | `ArchitectureScorecardModal.tsx` | Real-time Security (94%), SQL (88%), CVE (98%), and React 19 (92%) audit dials. |
| **9** | **🌐 REST API Sandbox & cURL** | `ApiSandboxModal.tsx` | Test Spring Boot endpoints, inject JWT headers, and export cURL / Axios / Python snippets. |
| **10** | **⚡ Java DTO ➔ TypeScript** | `TypeScriptGeneratorModal.tsx` | Auto-convert JPA entities and records to strict TypeScript interfaces and Zod schemas. |
| **11** | **💥 Chaos Simulator** | `ChaosSimulatorModal.tsx` | Resilience4j fault injection, circuit breaker state machine, and fallback telemetry. |
| **12** | **🖼️ 4K C4 Blueprint Exporter** | `ArchitectureBlueprintExportModal.tsx` | Export C4 Level 1/2/3 diagrams, 4K SVG vector blueprints, and Mermaid RFC specs. |
| **13** | **⚛️ React 19 Runtime Explorer** | `ReactRuntimeExplorerModal.tsx` | Virtual DOM Fiber reconciliation, Hook state mutation timeline, and Axios interceptors. |
| **14** | **⚡ Runtime Tracing Replay** | `RuntimeTracingModal.tsx` | Step-by-step VCR playback from React UI down to Controller, Service, Hibernate, and DB. |
| **15** | **📊 API Metrics & Telemetry** | `ApiMetricsDashboardModal.tsx` | Real-time P50/P90/P95/P99 response times, throughput RPS, and error rate tracking. |
| **16** | **🔀 7-Swimlane Sequence Tracer** | `SequenceDiagramModal.tsx` | Asynchronous request and response lifecycle mapping across 7 architectural swimlanes. |
| **17** | **🔥 24-Hour Latency Heatmap** | `LatencyHeatmapModal.tsx` | 24-hour hourly quantile matrix with color-coded buckets and hover tooltips. |
| **18** | **🗄️ Database ERD & Schema** | `ErDiagramModal.tsx` | `@Entity` relational table diagrams with column data types and foreign key linkages. |
| **19** | **🔐 Spring Security 6 Pipeline** | `SecurityExplorerModal.tsx` | 6-stage stateless filter chain inspection (`CorsFilter`, `JwtAuthenticationFilter`, etc.). |
| **20** | **💻 Live SQL Query Explorer** | `SqlExplorerModal.tsx` | Captured JPA prepared statements (SELECT, INSERT, UPDATE) with execution durations. |
| **21** | **📦 Maven Dependency Graph** | `DependencyExplorerModal.tsx` | `pom.xml` starter analyzer explaining auto-configuration mechanics (Web, JPA, Security). |
| **22** | **📁 5-Mode File Tree Visualizer** | `FileTreeModal.tsx` | Interactive File Tree, ASCII Tree, Emoji Tree, Mermaid AST Diagram, and Galaxy Canvas. |
| **23** | **🤖 AI Architecture Assistant** | `AiAssistantModal.tsx` | Automated code explanations, compliance auditing, query reviews, and interview prep. |

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
