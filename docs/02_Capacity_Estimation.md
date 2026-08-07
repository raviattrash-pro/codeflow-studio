# CodeFlow Studio - Capacity Estimation & Systems Engineering

This document details the quantitative system capacity estimations, workload profiles, storage footprints, compute resources, memory allocations, and network ingress/egress requirements for **CodeFlow Studio**.

---

## 1. Traffic & User Workload Scale

### Core Metrics Assumption
- **Monthly Active Users (MAU)**: 100,000 users
- **Daily Active Users (DAU)**: 10,000 users (10% of MAU)
- **Daily Repository Ingestions / Analysis Sessions**: 25,000 analysis jobs / day (avg. 2.5 repo analyses per DAU)
- **Peak Traffic Multiplier**: 2.5x average load

### Request Throughput Calculations

#### 1. Analysis Job Ingestion (Write / Heavy Processing)
$$\text{Average Job RPS} = \frac{25,000 \text{ jobs}}{86,400 \text{ sec}} \approx 0.29 \text{ jobs/sec}$$

$$\text{Peak Job RPS} = 0.29 \times 2.5 \approx 0.725 \text{ jobs/sec} \ (\approx 43.5 \text{ jobs/min})$$

#### 2. Interactive Graph UI Interactions (Read Heavy - API Queries & Node Inspections)
- Average visual graph clicks / API queries per analysis session: 40 requests
- Total Daily API Read Requests = $25,000 \text{ sessions} \times 40 \text{ queries} = 1,000,000 \text{ requests/day}$

$$\text{Average Read RPS} = \frac{1,000,000}{86,400} \approx 11.57 \text{ req/sec}$$

$$\text{Peak Read RPS} = 11.57 \times 2.5 \approx 28.9 \text{ req/sec} \ (\approx 30 \text{ RPS})$$

---

## 2. Storage Estimation

### A. Ephemeral Disk Storage (Source Code Parsing Workspace)
- Average repository ZIP size: **15 MB**
- Maximum repository size cap: **100 MB**
- Ephemeral workspace holds code during parsing (avg. 10 seconds duration per job).
- At peak analysis rate ($0.725 \text{ jobs/sec}$ with avg 10s retention):
  $$\text{Concurrent Active Workspaces} = 0.725 \text{ jobs/sec} \times 10 \text{ sec} \approx 8 \text{ active jobs}$$
  $$\text{Peak Ephemeral Disk Footprint} = 8 \text{ jobs} \times 100 \text{ MB} = \mathbf{800 \text{ MB ephemeral scratch disk}}$$

### B. Permanent Database Storage (PostgreSQL)
We store metadata, project nodes, relationships, and parsed graph JSON.

- **Project Metadata Record**: ~1 KB
- **Node Metadata** (per parsed class/method/component/table): 500 bytes (avg 300 nodes per project) $\rightarrow 150 \text{ KB per project}$
- **Edge / Relationship Record**: 200 bytes (avg 500 edges per project) $\rightarrow 100 \text{ KB per project}$
- **Compressed JSON Visual Graph Payload**: ~250 KB per project
- **Total Storage per Analyzed Project**: $1 + 150 + 100 + 250 = \mathbf{501 \text{ KB} \approx 0.5 \text{ MB}}$

#### Cumulative Database Growth
$$\text{Daily DB Storage Growth} = 25,000 \text{ projects/day} \times 0.5 \text{ MB} = \mathbf{12.5 \text{ GB / day}}$$
$$\text{Monthly DB Storage Growth} = 12.5 \text{ GB} \times 30 = \mathbf{375 \text{ GB / month}}$$
$$\text{Annual DB Storage Growth} = 375 \text{ GB} \times 12 = \mathbf{4.5 \text{ TB / year}}$$

*(Note: Applying a 30-day retention policy for non-bookmarked guest analyses reduces active DB storage requirements to ~375 GB).*

---

## 3. Memory (RAM) Allocation Estimation

### Parser Engine JVM Memory Requirements
- JavaParser AST construction in memory: ~5x source code text size.
- Average repository source code text size: 10 MB.
- Heap allocated per active thread parse: $10 \text{ MB} \times 5 = 50 \text{ MB heap}$.
- React/Babel JS parser allocation: ~30 MB heap per thread.
- Spring Boot base overhead: 512 MB heap.

$$\text{Max Concurrent Threads per Instance} = 10$$
$$\text{Memory required per Worker} = 512 \text{ MB} + (10 \text{ threads} \times (50 \text{ MB} + 30 \text{ MB})) = \mathbf{1.312 \text{ GB RAM}}$$
- Recommended deployment specification: **2 GB RAM per Spring Boot worker container instance**.

---

## 4. Network Bandwidth & Ingress / Egress

### Ingress (Data Received by Server)
- Source code downloads (GitHub git clone HTTPS + ZIP uploads):
  $$\text{Daily Ingress Volume} = 25,000 \text{ jobs} \times 15 \text{ MB avg repo} = \mathbf{375 \text{ GB / day}}$$
  $$\text{Average Ingress Bandwidth} = \frac{375 \text{ GB} \times 8 \text{ Gb/GB}}{86,400 \text{ sec}} \approx \mathbf{34.72 \text{ Mbps}}$$
  $$\text{Peak Ingress Bandwidth} = 34.72 \times 2.5 = \mathbf{86.8 \text{ Mbps}}$$

### Egress (Data Sent to User Browser)
- Frontend SPA static bundle asset downloads (cached via CDN): Negligible backend load.
- Graph JSON REST API responses (avg 250 KB compressed per graph load):
  $$\text{Daily Egress Volume} = 1,000,000 \text{ requests} \times 250 \text{ KB} = \mathbf{250 \text{ GB / day}}$$
  $$\text{Average Egress Bandwidth} = \frac{250 \text{ GB} \times 8 \text{ Gb/GB}}{86,400 \text{ sec}} \approx \mathbf{23.15 \text{ Mbps}}$$
  $$\text{Peak Egress Bandwidth} = 23.15 \times 2.5 = \mathbf{57.87 \text{ Mbps}}$$

---

## 5. Summary Hardware Requirement Matrix

| Resource Dimension | Average Baseline | Peak Capacity Requirement | Recommended Production Provisioning |
|---|---|---|---|
| **App Server Compute** | 0.29 jobs/sec | 0.73 jobs/sec | 3x Spring Boot Replicas (2 vCPU, 2GB RAM each) |
| **Database Compute** | 11.5 RPS Read | 30 RPS Read | Neon PostgreSQL Primary (2 vCPU, 4GB RAM) |
| **Ephemeral Workspace Disk** | 300 MB | 800 MB | 5 GB SSD scratch volume per worker node |
| **Database Storage** | 12.5 GB / day | 375 GB / month | 500 GB Auto-scaling SSD Storage |
| **Network Ingress** | 34.7 Mbps | 86.8 Mbps | 1 Gbps Network NIC |
| **Network Egress** | 23.1 Mbps | 57.9 Mbps | Cloudflare CDN caching layer |
