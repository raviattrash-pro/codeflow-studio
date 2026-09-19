# CodeFlow Studio 🚀 (v9.0.0 Release — IDE Sidecar, Browser Extension & Collab Suite)
> **Observe, Replay & Master Real Code Execution — VS Code Sidecar, Chrome Extension, WebRTC Live Collab, Zero-Trust Compliance Matrix, GraphQL/gRPC Synthesizer & Multi-Repo Service Mesh.**

[![Version](https://img.shields.io/badge/version-9.0.0-indigo.svg)](README.md)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](README.md)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2%2B-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

---

## 🎬 Live Interactive Workbench & Studio Showcase

![CodeFlow Studio Live Demo](docs/media/codeflow.gif)

> 💡 *CodeFlow Studio v9.0 expands to **29 Visual Architecture & Intelligence Tools** distributed across 4 dedicated domain categories: DevOps & Cloud, Architecture & Governance, Runtime & Flow, and APIs & Data.*

---

## ✨ What's New in v9.0.0 (IDE Sidecar, Extension & Real-Time Collab Suite)

### 1. 💻 VS Code IDE Sidecar & Extension Manifest Generator (NEW)
- **Bidirectional WebSocket LSP Sidecar**: Connects your local editor (`ws://127.0.0.1:4000`) directly to CodeFlow Studio.
- **Active-Editor Synchronization**: Highlighting a Java Controller or TypeScript Hook in VS Code instantly focuses that node in the Studio canvas.
- **1-Click Extension Package**: Auto-synthesizes full `package.json` manifest and `extension.ts` TypeScript runtime source.

### 2. 🌐 Chrome Extension & GitHub DOM Overlay Injector (NEW)
- **Manifest V3 Extension**: Injects interactive `[⚡ View Flow]` badges directly onto GitHub pull request diffs and repository file trees.
- **In-Browser Flow Radar**: Renders live component relationships inside GitHub without leaving the browser tab.

### 3. 👥 WebRTC Live Collab & Interactive Review Room (NEW)
- **Zero-Relay P2P Architecture Review**: Multi-cursor broadcasting with live WebRTC data channels.
- **Shared Canvas Markups & Chat**: Pin review comments, vote on architecture RFCs, and collaborate across distributed engineering teams.

### 4. 🛡️ Zero-Trust SOC2 / ISO 27001 / HIPAA Compliance Matrix (NEW)
- **Static AST Policy Auditor**: Automated validation of TLS 1.3, JWT RS256/HS256, SQL injection defense, and password hashing (BCrypt).
- **1-Click Markdown Audit Dossier**: Export executive compliance assessments for auditor review.

### 5. ⚡ GraphQL SDL & gRPC Protobuf v3 Schema Synthesizer (NEW)
- **GraphQL Schema Definition Language (SDL)**: Generates complete `type Query`, `type Mutation`, and input types from Spring Boot REST controllers.
- **Proto3 Interface Definition**: Generates production-ready gRPC `service` and `message` definitions.

### 6. 🕸️ Multi-Repo Service Mesh & Istio Topology Synthesizer (NEW)
- **Multi-Service Traffic Matrix**: Visualizes microservice inter-service calls, mTLS encryption status, and circuit breakers.
- **Istio & Envoy Synthesizer**: Auto-generates Istio `VirtualService`, `DestinationRule`, and Envoy proxy sidecar configurations.

---

## 🛠️ Complete Suite of 29 Visual Architecture Tools

Every tool operates in **Interactive Demo Mode** (zero backend setup required) or against real ingested repositories:

| # | Tool / Modal | Domain Category | Component | Description & Scope |
|---|---|---|---|---|
| **1** | **💻 VS Code IDE Sidecar** | Runtime & Flow | `VsCodeSidecarModal.tsx` | Bidirectional WebSocket LSP sidecar & extension manifest compiler. |
| **2** | **🌐 Chrome Extension Injector** | Runtime & Flow | `ChromeExtensionModal.tsx` | Manifest V3 extension injecting interactive flow badges into GitHub PRs. |
| **3** | **👥 WebRTC Live Collab** | Architecture & Health | `LiveCollabModal.tsx` | P2P multi-cursor review room, live chat, and shared whiteboard pins. |
| **4** | **🛡️ Zero-Trust Compliance Matrix** | Architecture & Health | `ComplianceMatrixModal.tsx` | Static AST auditor validating SOC2, ISO 27001, HIPAA, and GDPR controls. |
| **5** | **⚡ GraphQL SDL & gRPC Synthesizer** | APIs & Data | `GraphqlGrpcModal.tsx` | Synthesizes GraphQL SDL & gRPC Proto3 schemas from Spring REST controllers. |
| **6** | **🕸️ Service Mesh & Istio Topology** | DevOps & Cloud | `ServiceMeshModal.tsx` | Multi-service traffic visualizer, Envoy proxy sidecars & Istio YAML generator. |
| **7** | **⚡ Git PR Architecture Drift** | DevOps & Cloud | `ArchitectureDriftModal.tsx` | Compare PR branches against main to detect layer boundary breaches and API drift. |
| **8** | **🧪 Automated Test Generator** | DevOps & Cloud | `TestSuiteGeneratorModal.tsx` | Generate RestAssured Java tests and Playwright TypeScript suites with auth headers. |
| **9** | **☁️ Cloud IaC & Docker Synthesizer** | DevOps & Cloud | `CloudInfraSynthesizerModal.tsx` | Synthesize Docker Compose, AWS Terraform modules & Kubernetes manifests from AST. |
| **10** | **🔄 Kafka & WebSocket Streams** | DevOps & Cloud | `EventStreamVisualizerModal.tsx` | Visualize Kafka topics, consumer groups, and live WebSocket / SSE channels. |
| **11** | **🧩 OpenTelemetry Tracing** | DevOps & Cloud | `DistributedTracingModal.tsx` | Multi-service span waterfall with automated critical-path bottleneck isolation. |
| **12** | **🎙️ Voice Architecture Copilot** | DevOps & Cloud | `VoiceCopilotModal.tsx` | Speak natural voice commands to audit DB, simulate chaos & trigger AI remediation. |
| **13** | **📊 Health Scorecard HUD** | Architecture & Health | `ArchitectureScorecardModal.tsx` | Real-time Security (94%), SQL (88%), CVE (98%), and React 19 (92%) audit dials. |
| **14** | **🖼️ 4K C4 Blueprint Exporter** | Architecture & Health | `ArchitectureBlueprintExportModal.tsx` | Export C4 Level 1/2/3 diagrams, 4K SVG vector blueprints, and Mermaid RFC specs. |
| **15** | **💥 Chaos Simulator** | Architecture & Health | `ChaosSimulatorModal.tsx` | Resilience4j fault injection, circuit breaker state machine, and fallback telemetry. |
| **16** | **🤖 AI Architecture Assistant** | Architecture & Health | `AiAssistantModal.tsx` | Automated code explanations, compliance auditing, query reviews, and interview prep. |
| **17** | **📦 Maven Dependency Graph** | Architecture & Health | `DependencyExplorerModal.tsx` | `pom.xml` starter analyzer explaining auto-configuration mechanics (Web, JPA, Security). |
| **18** | **⚛️ React 19 Runtime Explorer** | Runtime & Flow | `ReactRuntimeExplorerModal.tsx` | Virtual DOM Fiber tree reconciliation, Hook state mutation timeline, and Axios interceptors. |
| **19** | **⚡ Runtime Tracing Replay** | Runtime & Flow | `RuntimeTracingModal.tsx` | Step-by-step VCR playback from React UI down to Controller, Service, Hibernate, and DB. |
| **20** | **🔀 7-Swimlane Sequence Tracer** | Runtime & Flow | `SequenceDiagramModal.tsx` | Asynchronous request and response lifecycle mapping across 7 architectural swimlanes. |
| **21** | **🔥 24-Hour Latency Heatmap** | Runtime & Flow | `LatencyHeatmapModal.tsx` | 24-hour hourly quantile matrix with color-coded buckets and hover tooltips. |
| **22** | **📊 API Metrics & Telemetry** | Runtime & Flow | `ApiMetricsDashboardModal.tsx` | Real-time P50/P90/P95/P99 response times, throughput RPS, and error rate tracking. |
| **23** | **⚡ Java DTO ➔ TypeScript** | APIs & Data | `TypeScriptGeneratorModal.tsx` | Auto-convert JPA entities and records to strict TypeScript interfaces and Zod schemas. |
| **24** | **🌐 REST API Sandbox & cURL** | APIs & Data | `ApiSandboxModal.tsx` | Test Spring Boot endpoints, inject JWT headers, and export cURL / Axios / Python snippets. |
| **25** | **🗄️ Database ERD & Schema** | APIs & Data | `ErDiagramModal.tsx` | `@Entity` relational table diagrams with column data types and foreign key linkages. |
| **26** | **💻 Live SQL Query Explorer** | APIs & Data | `SqlExplorerModal.tsx` | Captured JPA prepared statements (SELECT, INSERT, UPDATE) with execution durations. |
| **27** | **🔐 Spring Security 6 Pipeline** | APIs & Data | `SecurityExplorerModal.tsx` | 6-stage stateless filter chain inspection (`CorsFilter`, `JwtAuthenticationFilter`, etc.). |
| **28** | **📁 5-Mode File Tree Visualizer** | APIs & Data | `FileTreeModal.tsx` | Interactive File Tree, ASCII Tree, Emoji Tree, Mermaid AST Diagram, and Galaxy Canvas. |
| **29** | **🔍 Global Command Palette** | Navigation & Search | `CommandPaletteModal.tsx` | Global spotlight search (`Ctrl+K`) across all 29 tools, scenarios, themes, and AI actions. |

---

## 🎨 Design Philosophy & Architecture

CodeFlow Studio integrates three modern frontend and interaction design philosophies:

- **1. Emil Kowalski Motion Craft** (`emilkowalski/skill`): Spring physics curves (`--ease-spring`), interactive VCR scrubbers, and live code inspectors.
- **2. Impeccable Anti-Slop Aesthetic** (`impeccable.style`): Obsidian palette (`#070a12`), engineering blueprint dot matrix grid (`blueprint-grid`), macOS traffic light chrome (🔴 🟡 🟢), and tactile keycaps (`[D]`, `[I]`, `[Space]`, `[Ctrl K]`).
- **3. Taste Skill Micro-Feedback** (`tasteskill.dev`): Show-don't-tell interactive workbench with 5 live views, 4 scenario presets, and 4 domain header categories.

---

## 📱 Mobile Responsiveness & 1-Tap Access

- **⚡ Mobile 1-Tap Quick-Launch Tools Grid**: 2-column launcher grid displayed directly on mobile screens (<640px).
- **🍔 Complete Mobile Drawer Navigation**: Slide-out drawer (`<Menu />`) with all 29 tools distributed across 4 domain categories.
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
| **v6.0** | **AI Explanations & Spring AI RAG** | Integrated RAG engine powered by Spring AI (Gemini / OpenAI / Ollama) for automated architecture document generation. |
| **v7.0** | **Enterprise Architecture Suite** | Global Command Palette (`Ctrl+K`), Health Scorecard HUD, REST API Sandbox, DTO ➔ TypeScript Generator, Chaos Simulator, 4K C4 Blueprint Exporter. |
| **v8.0** | **Cloud, DevOps & Voice Suite** | Git PR Drift Detection, Automated Test Generator (RestAssured/Playwright), Cloud IaC & Docker Synthesizer, Event Streams (Kafka/WS), Voice Copilot, OTel Distributed Tracing. |
| **v9.0 (Current)** | **IDE Sidecar, Browser Extension & Collab** | Native VS Code Extension side-panel, Chrome Extension for GitHub repositories, WebRTC Live Collab Review Room, Zero-Trust Compliance Matrix, GraphQL/gRPC Synthesizer & Istio Service Mesh. |
| **v10.0 (Future)** | **Enterprise Desktop & Offline Air-Gap** | Electron / Tauri Desktop standalone application with 100% offline air-gapped analysis, self-hosted enterprise cluster & automated CI/CD gating bot. |

---

## 📋 License

MIT License © 2026 CodeFlow Studio Team.
