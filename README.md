# CodeFlow Studio 🚀 (v3.0.0 Release)
> **Understand Spring Boot + React codebases visually — without reading hundreds of files.**

[![Version](https://img.shields.io/badge/version-3.0.0-indigo.svg)](README.md)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](README.md)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

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
| Hard to spot hidden security risks or unoptimized database calls across layers. | **Deep Developer Suite**: Built-in Runtime Tracing Replay Engine, SecurityFilterChain analyzer, ER Diagram builder, SQL query translator, and 5-mode File Tree AST visualizer. |

---

## ✨ Today's New Features (v3.0.0 Major Upgrade)

### 1. ⚡ Runtime Tracing & Execution Replay Engine (NEW in v3.0.0)
- **Interactive Player Controls**: Replay captured HTTP requests with Play ▶️, Pause ⏸️, Skip Backward ⏪, Skip Forward ⏩, Reset 🔄, and Speed controls (**1x, 2x, 3x, 5x**).
- **High-Contrast Interactive Scrubber**: Draggable glowing pink range slider knob (`#ec4899`) with neon progress bar, 100% visible and responsive in all themes.
- **Live Telemetry Gauge Bar**: Real-time telemetry monitoring displaying P95 latency (`42ms`), HTTP status (`200 OK`), active worker thread (`http-nio-8080`), and database query counter (`1 SELECT, 1 UPDATE`).
- **5-Column Pipeline & Multi-Tab Inspector**: Clickable pipeline step cards fitting 100% cleanly without container overflow, paired with a 3-tab inspector (Execution Action, Payload DTO, and Hibernate SQL Query).

### 2. 🎨 4 Theme View Options System (Full-App Transformation)
- 🌑 **Night View (Midnight Dark)**: Default high-contrast dark theme with neon cyan, purple, and pink accents.
- ☀️ **Normal View (Clean Slate)**: Crisp light theme (`#ffffff`), dark slate text (`#0f172a`), and clear borders.
- 🧼 **Neumorphic Soft View (Soft Light Mode)**: True 3D Neumorphism design system (`#e0e5ec`, extruded soft shadows `9px 9px 18px #a3b1c6, -9px -9px 18px #ffffff`, inset pill tags).
- 🧊 **Glassmorphism Gel View (Glossy Gel Mode)**: Translucent frosted glass paneling (`backdrop-filter: blur(20px)`), glossy blue gel pill badges with top reflection rims.
- **100% Dynamic UI Transformation**: Headers, Dashboard Chips, HLD Architectural Cards, Control Toolbars, and 100% of Tool Modals dynamically adapt to your selected theme.

### 3. 📐 100% Linear 5-Column Architectural Pipeline
- **Straight End-to-End Pipeline**: Perfect 5-column layout (**CLIENTS ➔ API GATEWAY ➔ CONTROLLERS ➔ SERVICES ➔ DB & CACHE**).
- **Sleek Centered Step Badges**: Numbered step circles `(1)`, `(2)`, `(3)`, `(4)`, `(5)` centered directly on connection lines with zero card text collision.

### 4. 🚪 Non-Colliding Side-by-Side Inspector Drawer
- Converted floating overlays into a dedicated right-hand column (`w-96 shrink-0`), allowing the 5-column HLD diagram to flex smoothly on the left without any card blocking or text bleed-through.

### 5. 🎮 One-Click Instant Interactive Demo Mode
- **Zero-Setup Demo Loader**: Click **"🎮 Launch Interactive Demo Flow"** on the welcome screen or header to instantly test a fully populated 5-column microservice (`E-Commerce Store Microservice`).

### 6. 🛡️ Solid Non-Transparent Dropdown Panels & Text Contrast Audit
- Enforced solid background panels for Theme View, Tools, and Feature Search dropdown menus (`opacity: 1`, `zIndex: 999999`) with high-contrast text rendering.

---

## 🛠️ Complete Feature Suite

### 1. ✨ Execution Flow Explorer
- **Feature-Segregated Flow Scenarios**: Automatically groups Spring `@RestController` endpoints into real application features (e.g. Authentication Flow, Cart Checkout, Payment Processing).
- **Searchable Endpoint Selector**: Filter through endpoints instantly by controller name, URL path, or HTTP method (`GET`, `POST`, `PUT`, `DELETE`).
- **Always-Expanded Inspector Drawer**: Slide-over panel featuring Data Flow Execution Paths, Framework Annotations (`@RestController`, `@Service`, `@Transactional`), and Interview Q&A Engine.

### 2. 🔐 Security Flow Analysis
- Visualizes Spring Security filter chain order (`CorsFilter`, `CsrfFilter`, `JwtAuthenticationFilter`, `UserDetailsService`, `SecurityContextHolder`).

### 3. 🗄️ ER Diagram Explorer
- Automatically extracts `@Entity` relationships (`@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@OneToOne`) with column data types and primary/foreign keys.

### 4. 📦 Dependency Explorer
- Parses `pom.xml` to extract Maven starters, Spring dependencies, and transitive packages.

### 5. 🧠 AI Assistant
- Contextual code analysis assistant for architectural explanations, refactoring recommendations, and interview prep.

### 6. 📁 Codebase & File Tree Explorer (5 View Modes)
- Directory tree supporting 5 visualization modes: Interactive File Tree, ASCII Tree, Emoji Tree, Mermaid AST Diagram, and Galaxy 2D Canvas View.

---

## 🏗️ Architecture

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
   └──────────────────────────────┬──────────────────────────────┘
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

### 2. Frontend Setup (React + Vite)
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
| **v3.0 (Current v3.0.0)** | **Runtime Tracing & 4-Theme UI** | Live Controller ➔ Service ➔ Repository ➔ DB execution tracing, interactive replay player (Play/Pause/Step/Speed), 4 Theme View Options, linear HLD layout, side drawer inspector, and one-click demo mode. |
| **v4.0** | **SQL Explorer** | Automated SQL query capture, execution time breakdown, rows returned, and Hibernate dirty-checking analyzer. |
| **v5.0** | **React Runtime Explorer** | Virtual DOM reconciliation tracer, React state mutation visualization, and Axios request/response interrupter. |
| **v6.0** | **AI Explanations** | Integrated RAG engine powered by `Spring AI` (Gemini / OpenAI / Ollama) for automated architecture document generation and code Q&A. |
| **v7.0** | **VS Code Extension** | Native IDE side-panel extension for direct visual execution flow exploration inside VS Code. |
| **v8.0** | **Chrome Extension** | Browser extension for GitHub repository pages to view interactive flow maps directly on github.com. |
| **v9.0** | **Team Collaboration** | Multi-user shared workspaces, live architectural annotations, and team review comments. |
| **v10.0** | **Enterprise Edition** | Local Desktop Application (Electron / Tauri) with 100% offline analysis (zero cloud code uploads) and custom enterprise parser plugins (Python, Node.js, .NET). |

---

## 📋 Release Branches

- **`main`**: Production release (`v3.0.0`).
- **`v3.0-runtime-tracing`**: Latest v3.0.0 release featuring Runtime Tracing & Execution Replay Engine, 4 Theme View System, linear HLD canvas, side-by-side inspector drawer, and one-click interactive demo mode.
- **`v2.3-prd-features`**: Feature-Segregated Flow Explorer, Dynamic Endpoint Parser, File Tree Modal (5 View Modes), Claymorphic HLD Canvas, and modal layout bounds fixes.
- **`v2.2-prd-enrichments`**: ERD Modal scrolling, solid modal backdrops, compact header dropdowns, and Blob markdown exporter.
- **`v2.1-prd-features`**: AI Assistant, Security Flow Explorer, and SQL Query Translator.
