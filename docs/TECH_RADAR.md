# 📡 Full-Stack Technology Radar & Evolution Guide

A deep-dive reference tracking the current production versions and upcoming generational shifts across my entire technology stack — from languages and frameworks to databases, infrastructure, and developer ergonomics.

---

## 🧭 Overview

| Category | Technologies Tracked |
| :--- | :--- |
| **🦀 Languages & Runtimes** | Python, Rust |
| **⚡ Frameworks & Async Engines** | FastAPI, Django, Tokio, Axum, Iced |
| **🗄️ Databases & Caching** | PostgreSQL, Redis, SQLite, Turso (libSQL), MySQL, MongoDB |
| **🚀 Infrastructure & Messaging** | Docker, RabbitMQ |
| **💻 Editors, OS & Tooling** | Neovim, VS Code, Tmux, Omarchy Linux (Hyprland) |

---

<!-- START_FULL_TECH_RADAR -->
## 1. 🦀 Languages & Runtimes

### 🐍 Python
<div align="left">
  <img src="https://img.shields.io/badge/Python_3.14-Current_Stable-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.14" />
  &nbsp;
  <img src="https://img.shields.io/badge/Python_3.15-Coming_Soon-F7C844?style=flat-square&logo=python&logoColor=black" alt="Python 3.15" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: 3.14** | Typing & Metaprogramming | 1. **Deferred Annotations (PEP 649):** Type hints evaluated lazily on demand without runtime cost.<br>2. **Template Strings (PEP 750):** Native `t-strings` for injection-safe, structured templating.<br>3. **Tier-2 JIT Optimizations:** Micro-op tracing and deep interpreter tail-call speedups. |
| **🚀 Next: 3.15** | Subinterpreters & JIT Maturity | 1. **Standard Free-Threading Stability:** Full ecosystem C-extension stabilization for No-GIL.<br>2. **Advanced Tier-2 Trace JIT:** Native machine-code generation for hot instruction traces.<br>3. **Zero-Cost Exception Refinements:** Near-zero overhead for try/except blocks on happy paths. |

<br />

### 🦀 Rust
<div align="left">
  <img src="https://img.shields.io/badge/Rust_1.98-Current_Stable-000000?style=flat-square&logo=rust&logoColor=white" alt="Rust 1.98" />
  &nbsp;
  <img src="https://img.shields.io/badge/Rust_1.99+-In_Pipeline-DEA584?style=flat-square&logo=rust&logoColor=black" alt="Rust 1.99+" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: 1.98 / Edition 2024** | Concurrency & Ergonomics | 1. **Async Closures:** Ergonomic borrow capturing across await points in `async |x|`.<br>2. **Let Chains:** Flattened conditional matching (`if let Some(x) = opt && x > 0`).<br>3. **`gen` Blocks & Yield:** First-class coroutine iterators without handwritten state machine boilerplate. |
| **🚀 Next: 1.99+** | Memory Safety & Expressiveness | 1. **Async Drop:** Automated asynchronous destructor cleanup for sockets and DB transactions.<br>2. **Dyn Trait Upcasting:** Native sub-to-super trait coercion without manual wrapper shims.<br>3. **Advanced Const Generics:** Compile-time evaluations and arbitrary expressions in types. |

---

## 2. ⚡ Frameworks & Async Engines

### ⚡ FastAPI
<div align="left">
  <img src="https://img.shields.io/badge/FastAPI_v0.141.1-Current_Stable-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  &nbsp;
  <img src="https://img.shields.io/badge/FastAPI_1.0-Roadmap-004D40?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI 1.0" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v0.141.1** | Pydantic v2 & Async Lifespan | 1. **Pydantic v2 Core Acceleration:** Rust-compiled data validation and parsing with sub-millisecond serialization.<br>2. **Lifespan State Management:** Async context managers replacing legacy startup and shutdown hooks.<br>3. **Enhanced Background Tasks:** Improved exception bubbling and cancellation propagation in async handlers. |
| **🚀 Next: v1.0 Milestone** | Enterprise Protocol Standards | 1. **Full OpenAPI 3.1 Spec Integration:** Native multi-file schemas and advanced discriminator polymorphic models.<br>2. **Native Server-Sent Events (SSE):** First-class streaming responses for real-time AI and messaging pipelines.<br>3. **WebSocket Auto-Reconnect Protocols:** Built-in heartbeats and automatic backoff negotiation. |

<br />

### 🎸 Django
<div align="left">
  <img src="https://img.shields.io/badge/Django_v6.1-Current_Stable-092E20?style=flat-square&logo=django&logoColor=white" alt="Django" />
  &nbsp;
  <img src="https://img.shields.io/badge/Django_v6.2+-Next_Gen-0C4B33?style=flat-square&logo=django&logoColor=white" alt="Django Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v6.1** | Native Background Workers & Async ORM | 1. **Native Background Tasks Engine:** Asynchronous task queue and worker architecture integrated into core without external Celery brokers.<br>2. **Composite Primary Keys & Query Optimizations:** Native multi-column primary keys and advanced subquery unrolling in ORM.<br>3. **Zero-Threadpool Async Streaming:** Async streaming HTTP responses executing natively on event loops without sync-to-async thread handoffs. |
| **🚀 Next: v6.2+** | Full Async Writes & OpenTelemetry Core | 1. **Non-Blocking Write Queries:** Native asynchronous write pipelines (`acreate`, `abulk_create`, `aupdate`) bypassing thread pool overhead.<br>2. **Built-in OpenTelemetry Instrumentation:** Distributed tracing and metrics exported directly from Django core request-response lifecycle.<br>3. **Reactive Form Components:** Component-based template rendering with declarative reactive client-side bindings. |

<br />

### ⚙️ Tokio
<div align="left">
  <img src="https://img.shields.io/badge/Tokio_v1.53.1-Current_Stable-000000?style=flat-square&logo=tokio&logoColor=white" alt="Tokio" />
  &nbsp;
  <img src="https://img.shields.io/badge/Tokio_v1.54+-Next_Gen-1D212A?style=flat-square&logo=tokio&logoColor=white" alt="Tokio Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v1.53.1** | Scheduler Work-Stealing & Diagnostics | 1. **Multi-Threaded Work-Stealing Optimization:** Reduced lock contention across high-core CPU sockets.<br>2. **Task Dump Diagnostics:** On-demand stack dumps of stuck asynchronous tasks for deadlock debugging.<br>3. **Cooperative Budget Tuning:** Granular control over worker yields to prevent starving compute tasks. |
| **🚀 Next: v1.54+** | I/O Ring Architecture | 1. **Native Linux `io_uring` Backend:** Zero-copy async I/O replacing epoll for ultra-low latency syscalls.<br>2. **Hierarchical Timing Wheels:** Sub-millisecond timer resolution with constant-time `O(1)` scheduling.<br>3. **Thread-Level Affinity Pinning:** Native task affinities to lock worker threads to dedicated CPU cores. |

<br />

### 🛡️ Axum
<div align="left">
  <img src="https://img.shields.io/badge/Axum_v0.8.9-Current_Stable-000000?style=flat-square&logo=rust&logoColor=white" alt="Axum" />
  &nbsp;
  <img src="https://img.shields.io/badge/Axum_v0.9.x-In_Development-333333?style=flat-square&logo=rust&logoColor=white" alt="Axum Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v0.8.9** | Type-Safe Routing & Tower 0.5 | 1. **Tower 0.5 Ecosystem Alignment:** Clean composition of middleware, rate limiters, and timeouts.<br>2. **Zero-Allocation Radix Router:** High-speed path matching avoiding heap allocations.<br>3. **Nested State Extraction:** Type-safe sub-state slicing for modular microservice endpoints. |
| **🚀 Next: v0.9.x** | HTTP/3 & Stream Zero-Copy | 1. **Native HTTP/3 & QUIC Support:** Multiplexed streaming without head-of-line blocking.<br>2. **Compile-Time Route Validation:** Type-checked route paths eliminating broken URL string typos at build time.<br>3. **Zero-Copy Stream Piping:** Direct socket-to-socket forwarding for high-bandwidth proxying. |

<br />

### 🧊 Iced (Rust GUI)
<div align="left">
  <img src="https://img.shields.io/badge/Iced_v0.14.0-Current_Stable-2F5C8F?style=flat-square&logo=rust&logoColor=white" alt="Iced" />
  &nbsp;
  <img src="https://img.shields.io/badge/Iced_v0.15+-Upcoming-1D3557?style=flat-square&logo=rust&logoColor=white" alt="Iced Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v0.14.0** | WGPU Pipeline & Wayland Support | 1. **Modern WGPU Pipeline:** Pure GPU-accelerated drawing with smooth sub-pixel text rasterization.<br>2. **Native Wayland Fractional Scaling:** Perfect pixel clarity on HiDPI Linux displays without blur.<br>3. **Elm Architecture Primitives:** Unidirectional state flow with zero mutable UI state leaks. |
| **🚀 Next: v0.15+** | Multi-Window & Reactivity | 1. **Multi-Window Drag-and-Drop:** Seamless window splitting and cross-window widget docking.<br>2. **Reactive State Primitives:** Fine-grained widget re-renders bypassing full layout passes.<br>3. **Embedded Compute Shaders:** Run compute pipelines directly inside custom UI elements. |

---

## 3. 🗄️ Databases & Caching

### 🐘 PostgreSQL
<div align="left">
  <img src="https://img.shields.io/badge/PostgreSQL_v18-Current_Stable-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  &nbsp;
  <img src="https://img.shields.io/badge/PostgreSQL_v19-Next_Major-1E3C59?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v18** | Direct Async I/O & Memory Indexing | 1. **Direct Asynchronous I/O (AIO):** Kernel-level asynchronous disk operations bypassing OS buffer bottlenecks.<br>2. **Radix-Tree Vacuum Indexing:** Overhauled maintenance memory consumption by up to 20x.<br>3. **Failover Logical Replication:** Coordinated physical and logical replication slots for high-availability setups. |
| **🚀 Next: v19** | 64-Bit Transaction IDs & JIT | 1. **64-Bit Transaction IDs (XID64):** Permanent elimination of transaction ID wraparound vacuum freezes.<br>2. **LLVM JIT Expression Acceleration:** Advanced JIT compilation upgrades for complex aggregation pipelines.<br>3. **Native Columnar Storage Engine:** Hybrid OLTP and OLAP analytical querying in a single instance. |

<br />

### 🔴 Redis
<div align="left">
  <img src="https://img.shields.io/badge/Redis_v8.10-Current_Stable-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  &nbsp;
  <img src="https://img.shields.io/badge/Redis_v9.0+-Next_Gen-9E2A2B?style=flat-square&logo=redis&logoColor=white" alt="Redis Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v8.10** | Multi-Threaded Core & Vector Search | 1. **Multi-Threaded Engine Core:** Parallel request execution removing single-threaded CPU bottlenecks.<br>2. **Native Vector Similarity Indexing:** Vector queries indexing embeddings directly in memory.<br>3. **Hash Field Expiration (`HEXPIRE`):** Expire individual keys inside a hash without deleting the whole structure. |
| **🚀 Next: v9.0+** | Zero-Downtime Clustering | 1. **Zero-Downtime Cluster Rebalancing:** Smooth shard migration with zero latency spikes under load.<br>2. **Native JSON Path Acceleration:** Blazing fast querying and partial updating of complex nested documents.<br>3. **Active-Active Cross-Region Replication:** Conflict-free replicated data types (CRDTs) built into core. |

<br />

### 🪶 SQLite & ⚡ Turso (libSQL)
<div align="left">
  <img src="https://img.shields.io/badge/SQLite_3.46+-Current_Stable-07405E?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
  &nbsp;
  <img src="https://img.shields.io/badge/Turso_libSQL-Edge_Native-4FF8D2?style=flat-square&logo=turso&logoColor=black" alt="Turso" />
</div>

| Technology | Status | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **SQLite (Core)** | Current: **3.46+** | 1. **JSONB Binary Representation:** High-speed binary JSON format significantly accelerating query parsing.<br>2. **Query Planner Subquery Unrolling:** Automatic unrolling of correlated subqueries into efficient joins.<br>3. **PRAGMA Optimize Enhancements:** Intelligent, non-blocking index statistics gathering. |
| **Turso (libSQL)** | Architecture | 1. **Embedded Replicas:** Read from local memory while syncing writes asynchronously to the cloud.<br>2. **Native Vector Extensions:** Zero-latency vector similarity search embedded directly in the SQLite engine.<br>3. **Multi-Region Active-Active:** Instant global read replicas with automatic database branching. |

<br />

### 🐬 MySQL
<div align="left">
  <img src="https://img.shields.io/badge/MySQL_v9.7-Current_Stable-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
  &nbsp;
  <img src="https://img.shields.io/badge/MySQL_v10.0+-Next_Gen-204561?style=flat-square&logo=mysql&logoColor=white" alt="MySQL Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v9.7** | Native Vectors & JavaScript Stored Code | 1. **Native Vector Data Type:** Store, index, and query embeddings using cosine and euclidean distance.<br>2. **JavaScript Stored Programs:** Write stored procedures and triggers directly in modern ECMAScript.<br>3. **InnoDB Parallel Index Creation:** Concurrent B-Tree builds utilizing all available CPU cores. |
| **🚀 Next: v10.0+** | Distributed Cloud Clustering | 1. **Automated Split-Brain Arbitration:** Enhanced Raft consensus for Group Replication clusters.<br>2. **Dynamic Performance Telemetry:** Sub-millisecond latency profiling per microservice transaction.<br>3. **Direct Object Store Tiering:** Offload cold partition tables directly to S3-compatible storage. |

<br />

### 🍃 MongoDB
<div align="left">
  <img src="https://img.shields.io/badge/MongoDB_v8.3-Current_Stable-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  &nbsp;
  <img src="https://img.shields.io/badge/MongoDB_v9.0+-Next_Gen-255E26?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v8.3** | Write Throughput & Shard Rebalancing | 1. **32% Higher Write Throughput:** Revamped WiredTiger storage engine batching writes concurrently.<br>2. **50x Faster Sharded Rebalancing:** Rapid chunk migrations across distributed cluster nodes.<br>3. **Integrated Vector Graph Search:** Combine hybrid full-text search with vector similarity in single pipelines. |
| **🚀 Next: v9.0+** | Adaptive Queries & Queryable Encryption | 1. **Queryable Encryption Range Queries:** Complex range and prefix filters on fully encrypted documents.<br>2. **Adaptive Query Plan Re-evaluation:** Dynamic plan shifting based on real-time collection metrics.<br>3. **Edge-Native Local Replication:** Seamless offline-first syncing from edge devices to central clusters. |

---

## 4. 🚀 Infrastructure & Message Brokers

### 🐳 Docker & Docker Compose
<div align="left">
  <img src="https://img.shields.io/badge/Docker_Engine 29-Current_Stable-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  &nbsp;
  <img src="https://img.shields.io/badge/Docker_Engine 30+-Next_Gen-1D70B8?style=flat-square&logo=docker&logoColor=white" alt="Docker Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: Engine 29** | Containerd Native & Compose Watch | 1. **Containerd Image Store Default:** True multi-platform image storage and snapshotting enabled by default.<br>2. **Compose `watch` Mode:** Auto-sync file changes into containers without rebuild latency.<br>3. **Buildx Cache Mount Optimization:** Accelerated multi-stage Rust and Python Docker builds. |
| **🚀 Next: Engine 30+** | Native WASM & Rootless Sandboxing | 1. **Native WASM Multi-Platform Runtimes:** Run WebAssembly microservices alongside standard OCI containers.<br>2. **Rootless Overlayfs Stabilization:** High-performance container sandboxing without root daemon privileges.<br>3. **Ephemeral Dev Environment API:** Instant containerized workspace spin-up with isolated networking. |

<br />

### 🐇 RabbitMQ
<div align="left">
  <img src="https://img.shields.io/badge/RabbitMQ_v4.3-Current_Stable-FF6600?style=flat-square&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  &nbsp;
  <img src="https://img.shields.io/badge/RabbitMQ_v4.4+-Next_Gen-CC5200?style=flat-square&logo=rabbitmq&logoColor=white" alt="RabbitMQ Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: v4.3** | Khepri Raft Store & Memory Footprint | 1. **Khepri Metadata Store:** Modern Raft-based metadata engine replacing Mnesia for resilient clustering.<br>2. **40% Memory Footprint Reduction:** Overhauled queue processes consuming significantly less RAM under load.<br>3. **Native MQTT 5.0 Support:** Built-in IoT messaging without separate external adapter plugins. |
| **🚀 Next: v4.4+** | Continuous Streams & Partition Balancing | 1. **Continuous Backup Streams:** Point-in-time stream replication across distributed geographic clusters.<br>2. **Sub-Millisecond Message Filtering:** Server-side message filtering avoiding unnecessary network serialization.<br>3. **Super-Stream Automated Rebalancing:** Dynamic partition redistribution without stopping active consumers. |

---

## 5. 💻 Editors, OS & Tooling

### 💤 Neovim & VS Code
<div align="left">
  <img src="https://img.shields.io/badge/Neovim_v0.10.x-Current_Stable-57A143?style=flat-square&logo=neovim&logoColor=white" alt="Neovim" />
  &nbsp;
  <img src="https://img.shields.io/badge/VS_Code_1.94-Current_Stable-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white" alt="VS Code" />
</div>

| Tool | Status | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **Neovim** | Current: **v0.10.x** &rarr; Next: **v0.11+** | 1. **Native LSP Inlay Hints:** Built-in parameter and type hints without plugin overhead.<br>2. **Treesitter Highlight Standard:** Semantic code highlighting fully stabilized in core.<br>3. **Upcoming in 0.11:** Multi-threaded async LSP client and native floating window border styles. |
| **VS Code / VSCodium** | Current: **1.94+** | 1. **Multi-Cursor Tab Completions:** Predict and complete across multiple cursors simultaneously.<br>2. **Native Git Rebase Visual Editor:** Interactive rebase graph directly in the editor window.<br>3. **Incoming:** Local LLM provider APIs and fine-grained workspace security boundaries. |

<br />

### 🖥️ Omarchy Linux (Hyprland) & Tmux
<div align="left">
  <img src="https://img.shields.io/badge/Omarchy_Linux-Rolling-9ECE6A?style=flat-square&logo=arch-linux&logoColor=black" alt="Omarchy" />
  &nbsp;
  <img src="https://img.shields.io/badge/Tmux_v3.5+-Current_Stable-1BB954?style=flat-square&logo=tmux&logoColor=white" alt="Tmux" />
</div>

| Tool | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **Omarchy Linux (Hyprland)** | Wayland Desktop | 1. **Linux 6.12+ `sched-ext`:** Extensible BPF user-space CPU scheduling for extreme low-latency response.<br>2. **Hyprland Wayland Tearing Protocol:** Tear-free, zero-latency rendering with hardware acceleration.<br>3. **Bcachefs Multi-Device Storage:** High-reliability filesystem with checksumming and caching layers. |
| **Tmux** | Terminal Ergonomics | 1. **Extended Key Handling (`xterm(1)`):** Flawless modifier key transmission (`Ctrl+Shift+...`) to Neovim.<br>2. **Dynamic Window Formatting:** Conditional status bar styling based on active SSH and Docker sessions.<br>3. **Upcoming in 3.6:** Wayland native clipboard sync protocol and Sixel high-res image pass-through. |
<!-- END_FULL_TECH_RADAR -->

---

[← Back to Profile Overview](../README.md)
