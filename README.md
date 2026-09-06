# CodeFlow Studio 🚀 (v4.1.0 Release)
> **Understand Spring Boot + React codebases visually — without reading hundreds of files.**

[![Version](https://img.shields.io/badge/version-4.1.0-indigo.svg)](README.md)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](README.md)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2%2B-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)

---

## 🎬 Live Product Demonstration

![CodeFlow Studio Live Demo](docs/media/codeflow.gif)

> 💡 *Watch CodeFlow Studio in action: Tracing feature-segregated execution flows, dynamic endpoint parsing, claymorphic HLD architecture canvas, runtime tracing replay, and interactive 5-mode File Tree Explorer.*

---

## 💡 Problem → Solution

| ❌ The Problem | ✅ The CodeFlow Solution |
| :--- | :--- |
| Developers spend hours jumping between hundreds of files trying to figure out how a feature works. | **Instant Visual Mapping**: Import any repo and immediately see end-to-end execution flows from React UI buttons down to SQL queries. |
| Onboarding new developers on large Spring Boot + React codebases takes weeks. | **Interactive AST Navigation**: Click any architectural node (Controller, Service, Repository, Table) to view code, execution paths, and interview explanations. |
| Hard to spot hidden security risks, slow queries, or latency spikes across layers. | **Deep Developer & Telemetry Suite**: Built-in API Metrics Dashboard, Request/Response Sequence Tracer, 24h Latency Heatmap, Runtime Tracing Replay, SecurityFilterChain analyzer, ER Diagram builder, SQL query translator, and 5-mode File Tree AST visualizer. |

---

## ✨ What's New in v4.1.0 (Full-Stack Visualizations Release)

### 1. 🎯 API Metrics & Telemetry Dashboard (NEW)
- **Live Endpoint Telemetry**: Real-time response time monitoring, P95/P99 latency bars, 24h throughput counts, and SLA status indicators.
- **Search & Method Filtering**: Instantly search by path or controller, filter by HTTP verbs (`ALL`, `GET`, `POST`, `PUT`, `DELETE`), and sort by P95 latency, volume, or error rate.
- **Summary KPI Bar**: Tracks total endpoints, average P95 response times against SLA targets (<300ms), 24h invocation volumes, and global availability error rates.

### 2. 🔀 Full-Stack Request/Response Sequence Flow Diagram (NEW)
- **7-Swimlane Architectural Tracer**: Maps requests across `User Browser` ➔ `React 19 SPA` ➔ `API Gateway` ➔ `OrderController` ➔ `OrderService` ➔ `OrderRepository` ➔ `PostgreSQL 16`.
- **Directional Animated Connectors**: Visualizes outbound HTTP requests, internal Spring AOP proxy transaction boundaries, JDBC query dispatches, and return/hydration flows.
- **VCR Playback Engine**: Step-by-step interactive player with Play/Pause, Step Forward/Back, and Reset controls.
- **Hop Payload & Framework Context Inspector**: Expandable inspection drawer exposing transmission payloads, DTO schemas, and Spring/JVM internal mechanics at each hop.

### 3. 🔥 24-Hour Latency Distribution Heatmap (NEW)
- **Temporal Heatmap Matrix**: 24-hour UTC quantile matrix across all REST API endpoints.
- **Color-Graded Spectrum**: Visual latency gradient from Cyan (`<100ms`) to Red (`>600ms Critical`) with pulsing alerts on high-latency bottleneck slots.
- **Interactive Tooltips & Drawers**: Hover or click any time slot cell to inspect peak RPS, exact P95 execution duration, hourly volume, and error counts.

---

## ⚡ Next-Gen Tech Stack Upgrade (v4.0.0 Core)

- ⚛️ **React 19 (`19.2.8`)**: Powered by React 19 Fiber architecture with optimized concurrent rendering.
- ⚡ **Vite 8 (`8.2.2`)**: Rolldown Rust-based bundler achieving production builds in **430ms** (2.7x faster).
- 🟦 **TypeScript 7 (`7.0.2`)**: Go-based compiler rewrite with instantaneous type validation.
- 🎨 **Lucide React 1.x (`1.41.0`)**: Modern ESM/CJS tree-shakeable icon suite.
- 🛡️ **Zero Vulnerabilities**: 100% clean `npm audit` across all dependencies.

---

## 🎨 4 Theme View Options System

- 🌑 **Night View (Midnight Dark)**: Default high-contrast dark theme with neon cyan, purple, and pink accents.
- ☀️ **Normal View (Clean Slate)**: Crisp light theme (`#ffffff`), dark slate text (`#0f172a`), and clear borders.
- 🧼 **Neumorphic Soft View (Soft Light Mode)**: True 3D Neumorphism design system (`#e0e5ec`, extruded soft shadows `9px 9px 18px #a3b1c6, -9px -9px 18px #ffffff`, inset pill tags).
- 🧊 **Glassmorphism Gel View (Glossy Gel Mode)**: Translucent frosted glass paneling (`backdrop-filter: blur(20px)`), glossy blue gel pill badges with top reflection rims.

---

## 🛠️ Complete Feature Suite

1. **✨ Execution Flow Explorer**: Feature-segregated execution scenarios with linear 5-column HLD diagram and side-by-side inspector drawer.
2. **🎯 API Metrics Dashboard**: Real-time latency distributions, throughput analytics, and endpoint status monitors.
3. **🔀 Sequence Diagram**: 7-Swimlane request/response lifecycle flow with interactive playback.
4. **🔥 Latency Heatmap**: 24-hour temporal quantile heatmap matrix for bottleneck discovery.
5. **⚡ Runtime Tracing Replay**: Interactive VCR-style execution player with scrubber and live telemetry gauge bar.
6. **🔐 Security Flow Analysis**: Spring Security filter chain order visualizer (`CorsFilter`, `CsrfFilter`, `JwtAuthenticationFilter`).
7. **🗄️ ER Diagram Explorer**: `@Entity` relationship graph with column data types and foreign key constraints.
8. **📦 Dependency Explorer**: `pom.xml` Maven starter analyzer with auto-configuration mechanics.
9. **🧠 AI Assistant**: Contextual code analysis assistant for architectural reviews and interview prep.
10. **📁 Codebase & File Tree Explorer**: 5 visualization modes: Interactive File Tree, ASCII Tree, Emoji Tree, Mermaid AST Diagram, and Galaxy 2D Canvas View.
11. **📄 Markdown Documentation Exporter**: 1-click generation and download of architectural specifications.

---

## 🏗️ Architecture

```
   ┌─────────────────────────────────────────────────────────────┐
   │                    React 19 + TypeScript 7                  │
   │       TailwindCSS • Lucide Icons • Vite 8 (Rolldown)        │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ REST API
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                Spring Boot 3.2+ (Java 21)                   │
   │  JavaParser • JGit • Maven Model Parser • Spring Data JPA   │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ Persistence
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                    PostgreSQL / H2 Database                 │
   └─────────────────────────────────────────────────────────────┘
```

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
*Frontend client runs on `http://localhost:3000`*

---

## 🗺️ Product Roadmap (v1.0 to v10.0)

| Version | Release Stage | Core Capabilities & Scope |
| :--- | :--- | :--- |
| **v1.0** | **MVP Release** | Spring Boot + React + Maven parsing, GitHub URL & ZIP ingestion, ERD, Security Flow, Dependency Explorer. |
| **v2.0** | **AST & Feature Flow** | Feature-Segregated Flow Explorer, Claymorphic HLD Canvas, 5-mode File Tree Explorer, Monaco Viewer. |
| **v3.0** | **Runtime Tracing & 4-Theme UI** | Live Controller ➔ Service ➔ Repository ➔ DB execution tracing, interactive replay player, 4 Theme Views, linear HLD layout. |
| **v4.0** | **React 19 + Vite 8 Core** | Major platform upgrade to React 19, Vite 8 (Rolldown), TypeScript 7, Lucide React 1.x. |
| **v4.1 (Current)** | **Full-Stack Visualizations** | API Metrics Dashboard, 7-Swimlane Sequence Flow Diagram, 24-Hour Latency Heatmap, Opaque Modal Theme Isolation. |
| **v5.0** | **React Runtime Explorer** | Virtual DOM reconciliation tracer, React state mutation visualization, and Axios request/response interrupter. |
| **v6.0** | **AI Explanations** | Integrated RAG engine powered by `Spring AI` (Gemini / OpenAI / Ollama) for automated architecture document generation. |
| **v7.0** | **VS Code Extension** | Native IDE side-panel extension for direct visual execution flow exploration inside VS Code. |
| **v8.0** | **Chrome Extension** | Browser extension for GitHub repository pages to view interactive flow maps directly on github.com. |
| **v9.0** | **Team Collaboration** | Multi-user shared workspaces, live architectural annotations, and team review comments. |
| **v10.0** | **Enterprise Edition** | Local Desktop Application (Electron / Tauri) with 100% offline analysis (zero cloud code uploads) and custom enterprise parser plugins. |

---

## 📋 License

MIT License © 2026 CodeFlow Studio Team.
