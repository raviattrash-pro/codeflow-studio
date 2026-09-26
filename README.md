# CodeFlow Studio 🚀 (v10.0.0 Release — Enterprise Desktop & Offline Air-Gap)
> **Observe, Replay & Master Real Code Execution — Standalone Tauri v2 Desktop App, 100% Offline Air-Gapped Analysis, Self-Hosted Enterprise Docker Cluster & CI/CD Architecture Gating Bot.**

[![Version](https://img.shields.io/badge/version-10.0.0-indigo.svg)](README.md)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](README.md)
[![Tauri](https://img.shields.io/badge/Tauri-v2.5-orange.svg)](https://tauri.app/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2%2B-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Enterprise-blue.svg)](https://www.docker.com/)

---

## 🎬 Live Interactive Workbench & Studio Showcase

<p align="center">
  <img src="docs/media/codeflow-studio-hd.gif" alt="CodeFlow Studio Live Demo — 30 Specialized Visual Architecture Tools" width="100%" />
</p>

> 💡 *CodeFlow Studio v10.0 expands to **30 Visual Architecture & Intelligence Tools** distributed across 4 dedicated domain categories: DevOps & Cloud, Architecture & Governance, Runtime & Flow, and APIs & Data.*

---

## ✨ What's New in v10.0.0 (Enterprise Desktop & Offline Air-Gap Suite)

### 1. 🖥️ Native Tauri v2 Desktop Standalone Application (NEW)
- **High-Performance Rust Core**: Lightweight native desktop app (~3MB binary overhead) wrapping React 19 + Vite 8.
- **Embedded Spring Boot Sidecar**: Tauri automatically launches and monitors the backend JAR as a native background sidecar process on `localhost:18080`.
- **Zero-Config Local Storage**: Automatically boots an embedded file-based H2 database (`~/.codeflow-studio/data/codeflow`) with zero external database prerequisites.

### 2. 📴 100% Offline Air-Gapped Analysis Mode (NEW)
- **Zero-Cloud Dependency**: Fully capable of analyzing sensitive repositories inside air-gapped enterprise environments and secure enclaves.
- **Local Ollama AI Integration**: Connects to local Ollama LLMs (`codellama`, `llama3`) running on `localhost:11434` without internet connectivity.
- **Dynamic Offline Status Bar**: Real-time connection quality indicator notifying engineers when running in Air-Gap Mode.

### 3. 🐳 Self-Hosted Enterprise Docker Cluster (NEW)
- **One-Command Deployment**: Complete multi-container orchestration with `docker compose up -d`.
- **Production-Tuned Containers**: Multi-stage Spring Boot 3.2 backend (Temurin 21) with layertools caching + Alpine Nginx frontend SPA reverse proxy.
- **Dedicated PostgreSQL 16**: Bundled persistent relational storage with pre-configured healthchecks and automated network isolation.

### 4. 🤖 CI/CD Architecture Gating Bot & GitHub Actions Workflow (NEW)
- **Automated PR Merge Gating**: Analyzes pull requests against configurable architecture rules in `arch-rules.json`.
- **Sticky PR Feedback Comments**: Automatically creates or updates a clean markdown scorecard on GitHub PRs with commit tracking.
- **Policy Enforcement**: Fails the build if critical rules are violated (e.g. Controller-Repository bypass, circular dependencies).

### 5. 🚧 CI/CD Architecture Gate Dashboard (Tool #30) (NEW)
- **Interactive In-Studio Rule Auditor**: Evaluates project AST against 6 core enterprise architectural rules:
  1. `LAYER-001`: Controller-Repository Separation
  2. `CYCLE-001`: Circular Dependency Detection (DFS Graph Traversal)
  3. `LAYER-002`: Service-Controller Boundary Separation
  4. `JPA-001`: JPA Entity & Primary Key Annotation Compliance
  5. `API-001`: REST Endpoint Kebab-Case Naming
  6. `SEC-001`: Mutating Endpoint Security Annotation Coverage
- **1-Click Markdown Dossier Export**: Generate compliance audit reports ready for CI/CD documentation.

---

## 🛠️ Complete Suite of 30 Visual Architecture Tools

Every tool operates in **Interactive Demo Mode** (zero backend setup required) or against real ingested repositories:

| # | Tool / Modal | Domain Category | Component | Description & Scope |
|---|---|---|---|---|
| **1** | **🚧 CI/CD Architecture Gate** | Architecture & Health | `ArchGateModal.tsx` | Static AST rules auditor enforcing layer separation, acyclic graphs, JPA & security rules. |
| **2** | **💻 VS Code IDE Sidecar** | Runtime & Flow | `VsCodeSidecarModal.tsx` | Bidirectional WebSocket LSP sidecar & extension manifest compiler. |
| **3** | **🌐 Chrome Extension Injector** | Runtime & Flow | `ChromeExtensionModal.tsx` | Manifest V3 extension injecting interactive flow badges into GitHub PRs. |
| **4** | **👥 WebRTC Live Collab** | Architecture & Health | `LiveCollabModal.tsx` | P2P multi-cursor review room, live chat, and shared whiteboard pins. |
| **5** | **🛡️ Zero-Trust Compliance Matrix** | Architecture & Health | `ComplianceMatrixModal.tsx` | Static AST auditor validating SOC2, ISO 27001, HIPAA, and GDPR controls. |
| **6** | **⚡ GraphQL SDL & gRPC Synthesizer** | APIs & Data | `GraphqlGrpcModal.tsx` | Synthesizes GraphQL SDL & gRPC Proto3 schemas from Spring REST controllers. |
| **7** | **🕸️ Service Mesh & Istio Topology** | DevOps & Cloud | `ServiceMeshModal.tsx` | Multi-service traffic visualizer, Envoy proxy sidecars & Istio YAML generator. |
| **8** | **⚡ Git PR Architecture Drift** | DevOps & Cloud | `ArchitectureDriftModal.tsx` | Compare PR branches against main to detect layer boundary breaches and API drift. |
| **9** | **🧪 Automated Test Generator** | DevOps & Cloud | `TestSuiteGeneratorModal.tsx` | Generate RestAssured Java tests and Playwright TypeScript suites with auth headers. |
| **10** | **☁️ Cloud IaC & Docker Synthesizer** | DevOps & Cloud | `CloudInfraSynthesizerModal.tsx` | Synthesize Docker Compose, AWS Terraform modules & Kubernetes manifests from AST. |
| **11** | **🔄 Kafka & WebSocket Streams** | DevOps & Cloud | `EventStreamVisualizerModal.tsx` | Visualize Kafka topics, consumer groups, and live WebSocket / SSE channels. |
| **12** | **🧩 OpenTelemetry Tracing** | DevOps & Cloud | `DistributedTracingModal.tsx` | Multi-service span waterfall with automated critical-path bottleneck isolation. |
| **13** | **🎙️ Voice Architecture Copilot** | DevOps & Cloud | `VoiceCopilotModal.tsx` | Speak natural voice commands to audit DB, simulate chaos & trigger AI remediation. |
| **14** | **📊 Health Scorecard HUD** | Architecture & Health | `ArchitectureScorecardModal.tsx` | Real-time Security (94%), SQL (88%), CVE (98%), and React 19 (92%) audit dials. |
| **15** | **🖼️ 4K C4 Blueprint Exporter** | Architecture & Health | `ArchitectureBlueprintExportModal.tsx` | Export C4 Level 1/2/3 diagrams, 4K SVG vector blueprints, and Mermaid RFC specs. |
| **16** | **💥 Chaos Simulator** | Architecture & Health | `ChaosSimulatorModal.tsx` | Resilience4j fault injection, circuit breaker state machine, and fallback telemetry. |
| **17** | **🤖 AI Architecture Assistant** | Architecture & Health | `AiAssistantModal.tsx` | Automated code explanations, compliance auditing, query reviews, and interview prep. |
| **18** | **📦 Maven Dependency Graph** | Architecture & Health | `DependencyExplorerModal.tsx` | `pom.xml` starter analyzer explaining auto-configuration mechanics (Web, JPA, Security). |
| **19** | **⚛️ React 19 Runtime Explorer** | Runtime & Flow | `ReactRuntimeExplorerModal.tsx` | Virtual DOM Fiber tree reconciliation, Hook state mutation timeline, and Axios interceptors. |
| **20** | **⚡ Runtime Tracing Replay** | Runtime & Flow | `RuntimeTracingModal.tsx` | Step-by-step VCR playback from React UI down to Controller, Service, Hibernate, and DB. |
| **21** | **🔀 7-Swimlane Sequence Tracer** | Runtime & Flow | `SequenceDiagramModal.tsx` | Asynchronous request and response lifecycle mapping across 7 architectural swimlanes. |
| **22** | **🔥 24-Hour Latency Heatmap** | Runtime & Flow | `LatencyHeatmapModal.tsx` | 24-hour hourly quantile matrix with color-coded buckets and hover tooltips. |
| **23** | **📊 API Metrics & Telemetry** | Runtime & Flow | `ApiMetricsDashboardModal.tsx` | Real-time P50/P90/P95/P99 response times, throughput RPS, and error rate tracking. |
| **24** | **⚡ Java DTO ➔ TypeScript** | APIs & Data | `TypeScriptGeneratorModal.tsx` | Auto-convert JPA entities and records to strict TypeScript interfaces and Zod schemas. |
| **25** | **🌐 REST API Sandbox & cURL** | APIs & Data | `ApiSandboxModal.tsx` | Test Spring Boot endpoints, inject JWT headers, and export cURL / Axios / Python snippets. |
| **26** | **🗄️ Database ERD & Schema** | APIs & Data | `ErDiagramModal.tsx` | `@Entity` relational table diagrams with column data types and foreign key linkages. |
| **27** | **💻 Live SQL Query Explorer** | APIs & Data | `SqlExplorerModal.tsx` | Captured JPA prepared statements (SELECT, INSERT, UPDATE) with execution durations. |
| **28** | **🔐 Spring Security 6 Pipeline** | APIs & Data | `SecurityExplorerModal.tsx` | 6-stage stateless filter chain inspection (`CorsFilter`, `JwtAuthenticationFilter`, etc.). |
| **29** | **📁 5-Mode File Tree Visualizer** | APIs & Data | `FileTreeModal.tsx` | Interactive File Tree, ASCII Tree, Emoji Tree, Mermaid AST Diagram, and Galaxy Canvas. |
| **30** | **🔍 Global Command Palette** | Navigation & Search | `CommandPaletteModal.tsx` | Global spotlight search (`Ctrl+K`) across all 30 tools, scenarios, themes, and AI actions. |

---

## 🎨 Design Philosophy & Architecture

CodeFlow Studio integrates three modern frontend and interaction design philosophies:

- **1. Emil Kowalski Motion Craft** (`emilkowalski/skill`): Spring physics curves (`--ease-spring`), interactive VCR scrubbers, and live code inspectors.
- **2. Impeccable Anti-Slop Aesthetic** (`impeccable.style`): Obsidian palette (`#070a12`), engineering blueprint dot matrix grid (`blueprint-grid`), macOS traffic light chrome (🔴 🟡 🟢), and tactile keycaps (`[D]`, `[I]`, `[Space]`, `[Ctrl K]`).
- **3. Taste Skill Micro-Feedback** (`tasteskill.dev`): Show-don't-tell interactive workbench with 5 live views, 4 scenario presets, and 4 domain header categories.

---

## 🚀 Deployment & Quick Start Options

### Option A: Self-Hosted Enterprise Docker (Recommended for Teams)
```bash
# 1. Clone repository
git clone https://github.com/raviattrash-pro/codeflow-studio.git
cd codeflow-studio

# 2. Configure environment
cp .env.example .env

# 3. Launch the full enterprise stack
docker compose up -d --build
```
*Frontend runs on `http://localhost:80`, Backend runs on `http://localhost:8080`, PostgreSQL on port `5432`.*

---

### Option B: Native Tauri v2 Desktop App
```bash
cd codeflow-frontend

# Run desktop in live dev mode
npm run desktop:dev

# Build release desktop installer (.exe / .msi)
npm run desktop:build
```

---

### Option C: Standard Developer Setup

#### 1. Backend Setup (Spring Boot)
```bash
cd codeflow-backend
mvn clean spring-boot:run
```
*Backend server runs on `http://localhost:8080`*

#### 2. Frontend Setup (React 19 + Vite 8)
```bash
cd codeflow-frontend
npm install
npm run dev
```
*Frontend client runs on `http://localhost:3000` (or `5173`)*

---

## 🗺️ Product Roadmap (v1.0 to v11.0)

| Version | Release Stage | Core Capabilities & Scope |
| :--- | :--- | :--- |
| **v1.0** | **MVP Release** | Spring Boot + React + Maven parsing, GitHub URL & ZIP ingestion, ERD, Security Flow. |
| **v2.0** | **AST & Feature Flow** | Feature-Segregated Flow Explorer, Claymorphic HLD Canvas, 5-mode File Tree Explorer. |
| **v3.0** | **Runtime Tracing** | Live Controller ➔ Service ➔ Repository ➔ DB execution tracing, interactive replay player. |
| **v4.0** | **React 19 + Vite 8** | Platform upgrade to React 19, Vite 8 (Rolldown), TypeScript 7, Lucide React 1.x. |
| **v4.2** | **Handcrafted UI & Workbench** | Emil Kowalski spring motion, Impeccable obsidian blueprint canvas, Taste Skill 5-view live interactive workbench. |
| **v5.0** | **React Runtime Explorer** | Virtual DOM Fiber tree reconciliation, Hook state mutation timeline, and Axios request/response interceptors. |
| **v6.0** | **AI Explanations & Spring AI RAG** | Integrated RAG engine powered by Spring AI (Gemini / OpenAI / Ollama) for automated architecture document generation. |
| **v7.0** | **Enterprise Architecture Suite** | Global Command Palette (`Ctrl+K`), Health Scorecard HUD, REST API Sandbox, DTO ➔ TypeScript Generator, Chaos Simulator, 4K C4 Blueprint Exporter. |
| **v8.0** | **Cloud, DevOps & Voice Suite** | Git PR Drift Detection, Automated Test Generator (RestAssured/Playwright), Cloud IaC & Docker Synthesizer, Event Streams (Kafka/WS), Voice Copilot, OTel Distributed Tracing. |
| **v9.0** | **IDE Sidecar, Browser Extension & Collab** | Native VS Code Extension side-panel, Chrome Extension for GitHub repositories, WebRTC Live Collab Review Room, Zero-Trust Compliance Matrix, GraphQL/gRPC Synthesizer & Istio Service Mesh. |
| **v10.0 (Current)** | **Enterprise Desktop & Offline Air-Gap** | Standalone Tauri v2 Desktop application with 100% offline air-gapped analysis, self-hosted enterprise Docker cluster & automated CI/CD gating bot. |
| **v11.0 (Future)** | **Autonomous Self-Healing & AI Agents** | Autonomous PR remediation agents, multi-agent refactoring swarm, automated code migrations & real-time CVE auto-patching. |

---

## 📋 License

MIT License © 2026 CodeFlow Studio Team.
