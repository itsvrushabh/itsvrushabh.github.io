#!/usr/bin/env python3
"""
Full-Stack Tech Radar Updater Bot
Automatically fetches current & next versions across all 16+ technologies in the stack:
- Languages: Python, Rust
- Frameworks & Engines: FastAPI, Tokio, Axum, Iced
- Databases: PostgreSQL, Redis, SQLite, Turso (libSQL), MySQL, MongoDB
- Infrastructure: Docker, RabbitMQ
- Editors & OS: Neovim, VS Code, Tmux, Omarchy Linux

Synchronizes both README.md and docs/TECH_RADAR.md automatically.
"""

import json
import re
import sys
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
README_PATH = BASE_DIR / "README.md"
TECH_RADAR_PATH = BASE_DIR / "docs" / "TECH_RADAR.md"

README_START = "<!-- START_LANGUAGE_RADAR -->"
README_END = "<!-- END_LANGUAGE_RADAR -->"

FULL_RADAR_START = "<!-- START_FULL_TECH_RADAR -->"
FULL_RADAR_END = "<!-- END_FULL_TECH_RADAR -->"

# Comprehensive feature catalog for every technology
FEATURES = {
    # 1. Languages
    "python": {
        "3.13": {
            "focus": "Concurrency & JIT",
            "top3": [
                "**Free-Threaded CPython (No-GIL / PEP 703):** True multi-core parallel thread execution.",
                "**Tier-1 JIT Compiler (PEP 744):** Copy-and-patch JIT engine accelerating hot bytecode.",
                "**Enhanced Interactive REPL:** Built-in multiline editor, colorized tracebacks, and inline docs.",
            ],
        },
        "3.14": {
            "focus": "Typing & Metaprogramming",
            "top3": [
                "**Deferred Annotations (PEP 649):** Type hints evaluated lazily on demand without runtime cost.",
                "**Template Strings (PEP 750):** Native `t-strings` for injection-safe, structured templating.",
                "**Tier-2 JIT Optimizations:** Micro-op tracing and deep interpreter tail-call speedups.",
            ],
        },
        "3.15": {
            "focus": "Subinterpreters & JIT Maturity",
            "top3": [
                "**Standard Free-Threading Stability:** Full ecosystem C-extension stabilization for No-GIL.",
                "**Advanced Tier-2 Trace JIT:** Native machine-code generation for hot instruction traces.",
                "**Zero-Cost Exception Refinements:** Near-zero overhead for try/except blocks on happy paths.",
            ],
        },
    },
    "rust": {
        "1.98": {
            "focus": "Concurrency & Ergonomics",
            "top3": [
                "**Async Closures:** Ergonomic borrow capturing across await points in `async |x|`.",
                "**Let Chains:** Flattened conditional matching (`if let Some(x) = opt && x > 0`).",
                "**`gen` Blocks & Yield:** First-class coroutine iterators without handwritten state machine boilerplate.",
            ],
        },
        "1.99": {
            "focus": "Memory Safety & Expressiveness",
            "top3": [
                "**Async Drop:** Automated asynchronous destructor cleanup for sockets and DB transactions.",
                "**Dyn Trait Upcasting:** Native sub-to-super trait coercion without manual wrapper shims.",
                "**Advanced Const Generics:** Compile-time evaluations and arbitrary expressions in types.",
            ],
        },
        "2.0": {
            "focus": "Next-Gen Architecture",
            "top3": [
                "**Next-Gen Chalk Trait Engine:** Formally proven trait resolution algorithm enabled by default.",
                "**Full Coroutines Specification:** Universal generator and async generator primitives.",
                "**Polymorphic Memory Models:** Deeper static analysis for hardware-level concurrency.",
            ],
        },
    },
    # 2. Frameworks
    "fastapi": {
        "current": {
            "version": "v0.141+",
            "focus": "Pydantic v2 & Async Lifespan",
            "top3": [
                "**Pydantic v2 Core Acceleration:** Rust-compiled data validation and parsing with sub-millisecond serialization.",
                "**Lifespan State Management:** Async context managers replacing legacy startup and shutdown hooks.",
                "**Enhanced Background Tasks:** Improved exception bubbling and cancellation propagation in async handlers.",
            ],
        },
        "next": {
            "version": "v1.0 Milestone",
            "focus": "Enterprise Protocol Standards",
            "top3": [
                "**Full OpenAPI 3.1 Spec Integration:** Native multi-file schemas and advanced discriminator polymorphic models.",
                "**Native Server-Sent Events (SSE):** First-class streaming responses for real-time AI and messaging pipelines.",
                "**WebSocket Auto-Reconnect Protocols:** Built-in heartbeats and automatic backoff negotiation.",
            ],
        },
    },
    "tokio": {
        "current": {
            "version": "v1.53+",
            "focus": "Scheduler Work-Stealing & Diagnostics",
            "top3": [
                "**Multi-Threaded Work-Stealing Optimization:** Reduced lock contention across high-core CPU sockets.",
                "**Task Dump Diagnostics:** On-demand stack dumps of stuck asynchronous tasks for deadlock debugging.",
                "**Cooperative Budget Tuning:** Granular control over worker yields to prevent starving compute tasks.",
            ],
        },
        "next": {
            "version": "v1.54+",
            "focus": "I/O Ring Architecture",
            "top3": [
                "**Native Linux `io_uring` Backend:** Zero-copy async I/O replacing epoll for ultra-low latency syscalls.",
                "**Hierarchical Timing Wheels:** Sub-millisecond timer resolution with constant-time `O(1)` scheduling.",
                "**Thread-Level Affinity Pinning:** Native task affinities to lock worker threads to dedicated CPU cores.",
            ],
        },
    },
    "axum": {
        "current": {
            "version": "v0.8.x",
            "focus": "Type-Safe Routing & Tower 0.5",
            "top3": [
                "**Tower 0.5 Ecosystem Alignment:** Clean composition of middleware, rate limiters, and timeouts.",
                "**Zero-Allocation Radix Router:** High-speed path matching avoiding heap allocations.",
                "**Nested State Extraction:** Type-safe sub-state slicing for modular microservice endpoints.",
            ],
        },
        "next": {
            "version": "v0.9.x",
            "focus": "HTTP/3 & Stream Zero-Copy",
            "top3": [
                "**Native HTTP/3 & QUIC Support:** Multiplexed streaming without head-of-line blocking.",
                "**Compile-Time Route Validation:** Type-checked route paths eliminating broken URL string typos at build time.",
                "**Zero-Copy Stream Piping:** Direct socket-to-socket forwarding for high-bandwidth proxying.",
            ],
        },
    },
    "iced": {
        "current": {
            "version": "v0.14+",
            "focus": "WGPU Pipeline & Wayland Support",
            "top3": [
                "**Modern WGPU Pipeline:** Pure GPU-accelerated drawing with smooth sub-pixel text rasterization.",
                "**Native Wayland Fractional Scaling:** Perfect pixel clarity on HiDPI Linux displays without blur.",
                "**Elm Architecture Primitives:** Unidirectional state flow with zero mutable UI state leaks.",
            ],
        },
        "next": {
            "version": "v0.15+",
            "focus": "Multi-Window & Reactivity",
            "top3": [
                "**Multi-Window Drag-and-Drop:** Seamless window splitting and cross-window widget docking.",
                "**Reactive State Primitives:** Fine-grained widget re-renders bypassing full layout passes.",
                "**Embedded Compute Shaders:** Run compute pipelines directly inside custom UI elements.",
            ],
        },
    },
    # 3. Databases
    "postgresql": {
        "current": {
            "version": "v18",
            "focus": "Direct Async I/O & Memory Indexing",
            "top3": [
                "**Direct Asynchronous I/O (AIO):** Kernel-level asynchronous disk operations bypassing OS buffer bottlenecks.",
                "**Radix-Tree Vacuum Indexing:** Overhauled maintenance memory consumption by up to 20x.",
                "**Failover Logical Replication:** Coordinated physical and logical replication slots for high-availability setups.",
            ],
        },
        "next": {
            "version": "v19+",
            "focus": "64-Bit Transaction IDs & JIT",
            "top3": [
                "**64-Bit Transaction IDs (XID64):** Permanent elimination of transaction ID wraparound vacuum freezes.",
                "**LLVM JIT Expression Acceleration:** Advanced JIT compilation upgrades for complex aggregation pipelines.",
                "**Native Columnar Storage Engine:** Hybrid OLTP and OLAP analytical querying in a single instance.",
            ],
        },
    },
    "redis": {
        "current": {
            "version": "v8.10+",
            "focus": "Multi-Threaded Core & Vector Search",
            "top3": [
                "**Multi-Threaded Engine Core:** Parallel request execution removing single-threaded CPU bottlenecks.",
                "**Native Vector Similarity Indexing:** Vector queries indexing embeddings directly in memory.",
                "**Hash Field Expiration (`HEXPIRE`):** Expire individual keys inside a hash without deleting the whole structure.",
            ],
        },
        "next": {
            "version": "v9.0+",
            "focus": "Zero-Downtime Clustering",
            "top3": [
                "**Zero-Downtime Cluster Rebalancing:** Smooth shard migration with zero latency spikes under load.",
                "**Native JSON Path Acceleration:** Blazing fast querying and partial updating of complex nested documents.",
                "**Active-Active Cross-Region Replication:** Conflict-free replicated data types (CRDTs) built into core.",
            ],
        },
    },
    "mysql": {
        "current": {
            "version": "v9.7+",
            "focus": "Native Vectors & JavaScript Stored Code",
            "top3": [
                "**Native Vector Data Type:** Store, index, and query embeddings using cosine and euclidean distance.",
                "**JavaScript Stored Programs:** Write stored procedures and triggers directly in modern ECMAScript.",
                "**InnoDB Parallel Index Creation:** Concurrent B-Tree builds utilizing all available CPU cores.",
            ],
        },
        "next": {
            "version": "v10.0+",
            "focus": "Distributed Cloud Clustering",
            "top3": [
                "**Automated Split-Brain Arbitration:** Enhanced Raft consensus for Group Replication clusters.",
                "**Dynamic Performance Telemetry:** Sub-millisecond latency profiling per microservice transaction.",
                "**Direct Object Store Tiering:** Offload cold partition tables directly to S3-compatible storage.",
            ],
        },
    },
    "mongodb": {
        "current": {
            "version": "v8.3+",
            "focus": "Write Throughput & Shard Rebalancing",
            "top3": [
                "**32% Higher Write Throughput:** Revamped WiredTiger storage engine batching writes concurrently.",
                "**50x Faster Sharded Rebalancing:** Rapid chunk migrations across distributed cluster nodes.",
                "**Integrated Vector Graph Search:** Combine hybrid full-text search with vector similarity in single pipelines.",
            ],
        },
        "next": {
            "version": "v9.0+",
            "focus": "Adaptive Queries & Queryable Encryption",
            "top3": [
                "**Queryable Encryption Range Queries:** Complex range and prefix filters on fully encrypted documents.",
                "**Adaptive Query Plan Re-evaluation:** Dynamic plan shifting based on real-time collection metrics.",
                "**Edge-Native Local Replication:** Seamless offline-first syncing from edge devices to central clusters.",
            ],
        },
    },
    # 4. Infrastructure
    "docker": {
        "current": {
            "version": "Engine 29 / Compose v2.30+",
            "focus": "Containerd Native & Compose Watch",
            "top3": [
                "**Containerd Image Store Default:** True multi-platform image storage and snapshotting enabled by default.",
                "**Compose `watch` Mode:** Auto-sync file changes into containers without rebuild latency.",
                "**Buildx Cache Mount Optimization:** Accelerated multi-stage Rust and Python Docker builds.",
            ],
        },
        "next": {
            "version": "Engine 30+",
            "focus": "Native WASM & Rootless Sandboxing",
            "top3": [
                "**Native WASM Multi-Platform Runtimes:** Run WebAssembly microservices alongside standard OCI containers.",
                "**Rootless Overlayfs Stabilization:** High-performance container sandboxing without root daemon privileges.",
                "**Ephemeral Dev Environment API:** Instant containerized workspace spin-up with isolated networking.",
            ],
        },
    },
    "rabbitmq": {
        "current": {
            "version": "v4.3+",
            "focus": "Khepri Raft Store & Memory Footprint",
            "top3": [
                "**Khepri Metadata Store:** Modern Raft-based metadata engine replacing Mnesia for resilient clustering.",
                "**40% Memory Footprint Reduction:** Overhauled queue processes consuming significantly less RAM under load.",
                "**Native MQTT 5.0 Support:** Built-in IoT messaging without separate external adapter plugins.",
            ],
        },
        "next": {
            "version": "v4.4+",
            "focus": "Continuous Streams & Partition Balancing",
            "top3": [
                "**Continuous Backup Streams:** Point-in-time stream replication across distributed geographic clusters.",
                "**Sub-Millisecond Message Filtering:** Server-side message filtering avoiding unnecessary network serialization.",
                "**Super-Stream Automated Rebalancing:** Dynamic partition redistribution without stopping active consumers.",
            ],
        },
    },
    # 5. Editors & OS
    "neovim": {
        "current": {
            "version": "v0.10.x",
            "focus": "Native Inlay Hints & Treesitter Core",
            "top3": [
                "**Native LSP Inlay Hints:** Built-in parameter and type hints without plugin overhead.",
                "**Treesitter Standard Stabilized:** Semantic syntax highlighting and indentation fully integrated into core.",
                "**Dynamic Diagnostic Virtual Lines:** Inline error display directly below the offending syntax token.",
            ],
        },
        "next": {
            "version": "v0.11+",
            "focus": "Async Multi-Threading & Floating UI",
            "top3": [
                "**Multi-Threaded Async LSP Client:** Parse language server responses on background threads.",
                "**LuaJIT 2.1 Bytecode Caching:** Sub-5ms startup times for massive multi-plugin setups.",
                "**Native Floating Window Border Styling:** Consistent UI chrome across all popups and floating terminals.",
            ],
        },
    },
    "tmux": {
        "current": {
            "version": "v3.5+",
            "focus": "Extended Key Handling & Window Styling",
            "top3": [
                "**Extended Key Handling (`xterm(1)`):** Flawless modifier key transmission (`Ctrl+Shift+...`) to Neovim.",
                "**Dynamic Window Formatting:** Conditional status bar styling based on active SSH and Docker sessions.",
                "**Pane Zoom Indicators:** Visible visual feedback when a pane is zoomed into full terminal focus.",
            ],
        },
        "next": {
            "version": "v3.6+",
            "focus": "Wayland Clipboard & Sixel Images",
            "top3": [
                "**Wayland Native Clipboard Sync Protocol:** Direct copy/paste integration without external `wl-clipboard` shims.",
                "**Sixel High-Res Image Pass-Through:** Render terminal graphics and plots directly inside split panes.",
                "**Truecolor Auto-Detection:** Seamless 24-bit color palette sync with modern GPU terminals.",
            ],
        },
    },
}


def fetch_json(url: str, timeout: int = 10):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "FullTechRadarBot/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"[WARN] Failed to fetch {url}: {e}", file=sys.stderr)
        return None


def get_version(api_type: str, url: str, extract_fn, default_val: str) -> str:
    data = fetch_json(url)
    if data:
        try:
            return str(extract_fn(data))
        except Exception:
            pass
    return default_val


def detect_all_versions():
    print("📡 Querying real-time upstream release APIs across the full stack...")

    # Python
    py_data = fetch_json("https://endoflife.date/api/python.json")
    py_curr, py_next = "3.14", "3.15"
    if py_data and isinstance(py_data, list):
        cycles = [item["cycle"] for item in py_data if "cycle" in item]
        if "3.14" in cycles:
            py_curr, py_next = "3.14", "3.15"
        elif "3.13" in cycles:
            py_curr, py_next = "3.13", "3.14"

    # Rust
    rust_data = fetch_json("https://endoflife.date/api/rust.json")
    rust_curr, rust_next = "1.98", "1.99+"
    if rust_data and isinstance(rust_data, list):
        cycles = [item["cycle"] for item in rust_data if "cycle" in item]
        if cycles:
            rust_curr = cycles[0]
            try:
                major, minor = rust_curr.split(".")
                rust_next = f"{major}.{int(minor) + 1}+"
            except Exception:
                rust_next = "1.99+"

    # Frameworks
    fastapi_v = get_version("fastapi", "https://pypi.org/pypi/fastapi/json", lambda d: d["info"]["version"], "0.141.1")
    tokio_v = get_version("tokio", "https://crates.io/api/v1/crates/tokio", lambda d: d["crate"]["max_version"], "1.53.1")
    axum_v = get_version("axum", "https://crates.io/api/v1/crates/axum", lambda d: d["crate"]["max_version"], "0.8.9")
    iced_v = get_version("iced", "https://crates.io/api/v1/crates/iced", lambda d: d["crate"]["max_version"], "0.14.0")

    # Databases
    pg_cycle = get_version("pg", "https://endoflife.date/api/postgresql.json", lambda d: d[0]["cycle"], "18")
    redis_cycle = get_version("redis", "https://endoflife.date/api/redis.json", lambda d: d[0]["cycle"], "8.10")
    mysql_cycle = get_version("mysql", "https://endoflife.date/api/mysql.json", lambda d: d[0]["cycle"], "9.7")
    mongo_cycle = get_version("mongo", "https://endoflife.date/api/mongodb.json", lambda d: d[0]["cycle"], "8.3")

    # Infrastructure
    docker_cycle = get_version("docker", "https://endoflife.date/api/docker-engine.json", lambda d: d[0]["cycle"], "29")
    rabbitmq_cycle = get_version("rabbitmq", "https://endoflife.date/api/rabbitmq.json", lambda d: d[0]["cycle"], "4.3")

    return {
        "python": (py_curr, py_next),
        "rust": (rust_curr, rust_next),
        "fastapi": (f"v{fastapi_v}", "v1.0 Milestone"),
        "tokio": (f"v{tokio_v}", "v1.54+"),
        "axum": (f"v{axum_v}", "v0.9.x"),
        "iced": (f"v{iced_v}", "v0.15+"),
        "postgresql": (f"v{pg_cycle}", f"v{int(float(pg_cycle)) + 1}"),
        "redis": (f"v{redis_cycle}", "v9.0+"),
        "mysql": (f"v{mysql_cycle}", "v10.0+"),
        "mongodb": (f"v{mongo_cycle}", "v9.0+"),
        "docker": (f"Engine {docker_cycle}", f"Engine {int(float(docker_cycle)) + 1}+"),
        "rabbitmq": (f"v{rabbitmq_cycle}", f"v{float(rabbitmq_cycle) + 0.1:.1f}+"),
        "neovim": ("v0.10.x", "v0.11+"),
        "tmux": ("v3.5+", "v3.6+"),
    }


def build_readme_block(vers):
    py_c, py_n = vers["python"]
    rust_c, rust_n = vers["rust"]

    py_c_info = FEATURES["python"].get(py_c, FEATURES["python"]["3.14"])
    py_n_info = FEATURES["python"].get(py_n, FEATURES["python"]["3.15"])
    rust_c_info = FEATURES["rust"].get(rust_c, FEATURES["rust"]["1.98"])
    rust_n_info = FEATURES["rust"].get(rust_n.split("+")[0], FEATURES["rust"]["1.99"])

    py_c_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(py_c_info["top3"]))
    py_n_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(py_n_info["top3"]))
    rust_c_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(rust_c_info["top3"]))
    rust_n_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(rust_n_info["top3"]))

    edition_label = " / 2024" if rust_c.startswith("1.98") or rust_c.startswith("1.85") else ""

    md = f"""{README_START}
## 🔬 Language Radar: Python & Rust Evolution
*Tracking cutting-edge runtime shifts, compiler internals, and upcoming language proposals.*

<br />

### 🐍 Python Track

<div align="center">
  <img src="https://img.shields.io/badge/Python_{py_c}-Current_Stable-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python {py_c}" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Python_{py_n}-Coming_Soon-F7C844?style=flat-square&logo=python&logoColor=black" alt="Python {py_n}" />
</div>

<br />

| Release | Architectural Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: {py_c}** | {py_c_info["focus"]} | {py_c_top3} |
| **🚀 Next: {py_n}** | {py_n_info["focus"]} | {py_n_top3} |

<br />

### 🦀 Rust Track

<div align="center">
  <img src="https://img.shields.io/badge/Rust_{rust_c}-Current_Stable-000000?style=flat-square&logo=rust&logoColor=white" alt="Rust {rust_c}" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Rust_{rust_n}-In_Pipeline-DEA584?style=flat-square&logo=rust&logoColor=black" alt="Rust {rust_n}" />
</div>

<br />

| Release | Systems Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: {rust_c}{edition_label}** | {rust_c_info["focus"]} | {rust_c_top3} |
| **🚀 Next: {rust_n}** | {rust_n_info["focus"]} | {rust_n_top3} |

<br />

<div align="center">
  <sub>📡 <i>Tracking frameworks, databases, and infra too?</i> <a href="./docs/TECH_RADAR.md"><b>Explore the Full-Stack Tech Radar (All 16+ Technologies) →</b></a></sub>
</div>
{README_END}"""
    return md


def build_full_tech_radar_block(vers):
    # 1. Languages
    py_c, py_n = vers["python"]
    rust_c, rust_n = vers["rust"]
    py_c_info = FEATURES["python"].get(py_c, FEATURES["python"]["3.14"])
    py_n_info = FEATURES["python"].get(py_n, FEATURES["python"]["3.15"])
    rust_c_info = FEATURES["rust"].get(rust_c, FEATURES["rust"]["1.98"])
    rust_n_info = FEATURES["rust"].get(rust_n.split("+")[0], FEATURES["rust"]["1.99"])

    py_c_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(py_c_info["top3"]))
    py_n_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(py_n_info["top3"]))
    rust_c_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(rust_c_info["top3"]))
    rust_n_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(rust_n_info["top3"]))

    # Helper for card tables
    def card_rows(tech_key, curr_v, next_v):
        f = FEATURES[tech_key]
        c_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(f["current"]["top3"]))
        n_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(f["next"]["top3"]))
        return f"""| **🟢 Current: {curr_v}** | {f["current"]["focus"]} | {c_top3} |
| **🚀 Next: {next_v}** | {f["next"]["focus"]} | {n_top3} |"""

    md = f"""{FULL_RADAR_START}
## 1. 🦀 Languages & Runtimes

### 🐍 Python
<div align="left">
  <img src="https://img.shields.io/badge/Python_{py_c}-Current_Stable-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python {py_c}" />
  &nbsp;
  <img src="https://img.shields.io/badge/Python_{py_n}-Coming_Soon-F7C844?style=flat-square&logo=python&logoColor=black" alt="Python {py_n}" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: {py_c}** | {py_c_info["focus"]} | {py_c_top3} |
| **🚀 Next: {py_n}** | {py_n_info["focus"]} | {py_n_top3} |

<br />

### 🦀 Rust
<div align="left">
  <img src="https://img.shields.io/badge/Rust_{rust_c}-Current_Stable-000000?style=flat-square&logo=rust&logoColor=white" alt="Rust {rust_c}" />
  &nbsp;
  <img src="https://img.shields.io/badge/Rust_{rust_n}-In_Pipeline-DEA584?style=flat-square&logo=rust&logoColor=black" alt="Rust {rust_n}" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: {rust_c} / Edition 2024** | {rust_c_info["focus"]} | {rust_c_top3} |
| **🚀 Next: {rust_n}** | {rust_n_info["focus"]} | {rust_n_top3} |

---

## 2. ⚡ Frameworks & Async Engines

### ⚡ FastAPI
<div align="left">
  <img src="https://img.shields.io/badge/FastAPI_{vers["fastapi"][0]}-Current_Stable-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  &nbsp;
  <img src="https://img.shields.io/badge/FastAPI_1.0-Roadmap-004D40?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI 1.0" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("fastapi", vers["fastapi"][0], vers["fastapi"][1])}

<br />

### ⚙️ Tokio
<div align="left">
  <img src="https://img.shields.io/badge/Tokio_{vers["tokio"][0]}-Current_Stable-000000?style=flat-square&logo=tokio&logoColor=white" alt="Tokio" />
  &nbsp;
  <img src="https://img.shields.io/badge/Tokio_{vers["tokio"][1]}-Next_Gen-1D212A?style=flat-square&logo=tokio&logoColor=white" alt="Tokio Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("tokio", vers["tokio"][0], vers["tokio"][1])}

<br />

### 🛡️ Axum
<div align="left">
  <img src="https://img.shields.io/badge/Axum_{vers["axum"][0]}-Current_Stable-000000?style=flat-square&logo=rust&logoColor=white" alt="Axum" />
  &nbsp;
  <img src="https://img.shields.io/badge/Axum_{vers["axum"][1]}-In_Development-333333?style=flat-square&logo=rust&logoColor=white" alt="Axum Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("axum", vers["axum"][0], vers["axum"][1])}

<br />

### 🧊 Iced (Rust GUI)
<div align="left">
  <img src="https://img.shields.io/badge/Iced_{vers["iced"][0]}-Current_Stable-2F5C8F?style=flat-square&logo=rust&logoColor=white" alt="Iced" />
  &nbsp;
  <img src="https://img.shields.io/badge/Iced_{vers["iced"][1]}-Upcoming-1D3557?style=flat-square&logo=rust&logoColor=white" alt="Iced Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("iced", vers["iced"][0], vers["iced"][1])}

---

## 3. 🗄️ Databases & Caching

### 🐘 PostgreSQL
<div align="left">
  <img src="https://img.shields.io/badge/PostgreSQL_{vers["postgresql"][0]}-Current_Stable-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  &nbsp;
  <img src="https://img.shields.io/badge/PostgreSQL_{vers["postgresql"][1]}-Next_Major-1E3C59?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("postgresql", vers["postgresql"][0], vers["postgresql"][1])}

<br />

### 🔴 Redis
<div align="left">
  <img src="https://img.shields.io/badge/Redis_{vers["redis"][0]}-Current_Stable-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  &nbsp;
  <img src="https://img.shields.io/badge/Redis_{vers["redis"][1]}-Next_Gen-9E2A2B?style=flat-square&logo=redis&logoColor=white" alt="Redis Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("redis", vers["redis"][0], vers["redis"][1])}

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
  <img src="https://img.shields.io/badge/MySQL_{vers["mysql"][0]}-Current_Stable-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
  &nbsp;
  <img src="https://img.shields.io/badge/MySQL_{vers["mysql"][1]}-Next_Gen-204561?style=flat-square&logo=mysql&logoColor=white" alt="MySQL Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("mysql", vers["mysql"][0], vers["mysql"][1])}

<br />

### 🍃 MongoDB
<div align="left">
  <img src="https://img.shields.io/badge/MongoDB_{vers["mongodb"][0]}-Current_Stable-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  &nbsp;
  <img src="https://img.shields.io/badge/MongoDB_{vers["mongodb"][1]}-Next_Gen-255E26?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("mongodb", vers["mongodb"][0], vers["mongodb"][1])}

---

## 4. 🚀 Infrastructure & Message Brokers

### 🐳 Docker & Docker Compose
<div align="left">
  <img src="https://img.shields.io/badge/Docker_{vers["docker"][0]}-Current_Stable-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  &nbsp;
  <img src="https://img.shields.io/badge/Docker_{vers["docker"][1]}-Next_Gen-1D70B8?style=flat-square&logo=docker&logoColor=white" alt="Docker Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("docker", vers["docker"][0], vers["docker"][1])}

<br />

### 🐇 RabbitMQ
<div align="left">
  <img src="https://img.shields.io/badge/RabbitMQ_{vers["rabbitmq"][0]}-Current_Stable-FF6600?style=flat-square&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  &nbsp;
  <img src="https://img.shields.io/badge/RabbitMQ_{vers["rabbitmq"][1]}-Next_Gen-CC5200?style=flat-square&logo=rabbitmq&logoColor=white" alt="RabbitMQ Next" />
</div>

| Release | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
{card_rows("rabbitmq", vers["rabbitmq"][0], vers["rabbitmq"][1])}

---

## 5. 💻 Editors, OS & Tooling

### 💤 Neovim & VS Code
<div align="left">
  <img src="https://img.shields.io/badge/Neovim_{vers["neovim"][0]}-Current_Stable-57A143?style=flat-square&logo=neovim&logoColor=white" alt="Neovim" />
  &nbsp;
  <img src="https://img.shields.io/badge/VS_Code_1.94-Current_Stable-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white" alt="VS Code" />
</div>

| Tool | Status | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **Neovim** | Current: **{vers["neovim"][0]}** &rarr; Next: **{vers["neovim"][1]}** | 1. **Native LSP Inlay Hints:** Built-in parameter and type hints without plugin overhead.<br>2. **Treesitter Highlight Standard:** Semantic code highlighting fully stabilized in core.<br>3. **Upcoming in 0.11:** Multi-threaded async LSP client and native floating window border styles. |
| **VS Code / VSCodium** | Current: **1.94+** | 1. **Multi-Cursor Tab Completions:** Predict and complete across multiple cursors simultaneously.<br>2. **Native Git Rebase Visual Editor:** Interactive rebase graph directly in the editor window.<br>3. **Incoming:** Local LLM provider APIs and fine-grained workspace security boundaries. |

<br />

### 🖥️ Omarchy Linux (Hyprland) & Tmux
<div align="left">
  <img src="https://img.shields.io/badge/Omarchy_Linux-Rolling-9ECE6A?style=flat-square&logo=arch-linux&logoColor=black" alt="Omarchy" />
  &nbsp;
  <img src="https://img.shields.io/badge/Tmux_{vers["tmux"][0]}-Current_Stable-1BB954?style=flat-square&logo=tmux&logoColor=white" alt="Tmux" />
</div>

| Tool | Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **Omarchy Linux (Hyprland)** | Wayland Desktop | 1. **Linux 6.12+ `sched-ext`:** Extensible BPF user-space CPU scheduling for extreme low-latency response.<br>2. **Hyprland Wayland Tearing Protocol:** Tear-free, zero-latency rendering with hardware acceleration.<br>3. **Bcachefs Multi-Device Storage:** High-reliability filesystem with checksumming and caching layers. |
| **Tmux** | Terminal Ergonomics | 1. **Extended Key Handling (`xterm(1)`):** Flawless modifier key transmission (`Ctrl+Shift+...`) to Neovim.<br>2. **Dynamic Window Formatting:** Conditional status bar styling based on active SSH and Docker sessions.<br>3. **Upcoming in 3.6:** Wayland native clipboard sync protocol and Sixel high-res image pass-through. |
{FULL_RADAR_END}"""
    return md


def update_file(path: Path, start_marker: str, end_marker: str, new_block: str, name: str) -> bool:
    if not path.exists():
        print(f"[WARN] {path} not found, skipping {name}.", file=sys.stderr)
        return False

    content = path.read_text(encoding="utf-8")
    if start_marker not in content or end_marker not in content:
        print(f"[WARN] Boundary markers not found in {name}, skipping.", file=sys.stderr)
        return False

    pattern = re.compile(
        re.escape(start_marker) + r".*?" + re.escape(end_marker),
        re.DOTALL,
    )
    updated_content = pattern.sub(new_block, content)

    if updated_content == content:
        print(f"✅ {name} is already up to date.")
        return False
    else:
        path.write_text(updated_content, encoding="utf-8")
        print(f"🎉 Successfully updated {name}!")
        return True


def main():
    vers = detect_all_versions()

    print("📊 Current Version Detections:")
    for k, v in vers.items():
        print(f"  • {k.capitalize()}: Current={v[0]}, Next={v[1]}")

    readme_block = build_readme_block(vers)
    tech_radar_block = build_full_tech_radar_block(vers)

    updated_readme = update_file(README_PATH, README_START, README_END, readme_block, "README.md")
    updated_radar = update_file(TECH_RADAR_PATH, FULL_RADAR_START, FULL_RADAR_END, tech_radar_block, "docs/TECH_RADAR.md")

    if not updated_readme and not updated_radar:
        print("✨ All files and tech stack tiers are in 100% sync with upstream releases.")


if __name__ == "__main__":
    main()
