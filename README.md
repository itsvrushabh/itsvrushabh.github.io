<div align="center">
  <!-- 🖥️ Workstation & Dotfiles Setup -->
  <p>
    <a href="https://omarchy.org/"><img src="https://img.shields.io/badge/OS-Omarchy%20Linux-101014?style=for-the-badge&logo=arch-linux&logoColor=9ece6a" alt="Omarchy Linux" /></a>
    <a href="https://hyprland.org/"><img src="https://img.shields.io/badge/WM-Hyprland-101014?style=for-the-badge&logo=wayland&logoColor=00c8ff" alt="Hyprland" /></a>
    <a href="https://github.com/itsvrushabh/nvim"><img src="https://img.shields.io/badge/Editor-Neovim-101014?style=for-the-badge&logo=neovim&logoColor=57a143" alt="Neovim Config" /></a>
    <a href="https://github.com/itsvrushabh/tmux"><img src="https://img.shields.io/badge/Multiplexer-Tmux-101014?style=for-the-badge&logo=tmux&logoColor=1bb954" alt="Tmux Config" /></a>
  </p>
  <sub>⚡ Daily Driver: <b>Omarchy Linux</b> + <b>Hyprland</b> · Dotfiles: <a href="https://github.com/itsvrushabh/nvim"><b>nvim (LazyVim)</b></a> · <a href="https://github.com/itsvrushabh/tmux"><b>tmux (Omarchy theme)</b></a></sub>

  <br />

  <details>
    <summary><b>🖥️ Click to inspect Workstation Ergonomics & Dotfiles Specs</b></summary>
    <br />
    <div align="left">

| Layer | Technology | Key Features & Architecture |
| :--- | :--- | :--- |
| **Operating System** | [**Omarchy Linux**](https://omarchy.org/) | Rolling-release Arch base with Linux 6.12+ `sched-ext` user-space scheduler for ultra-low latency response. |
| **Compositor / WM** | [**Hyprland**](https://hyprland.org/) | Hardware-accelerated Wayland tiling compositor, tear-free gaming/display protocol, Tokyo Night palette. |
| **Editor** | [**Neovim (LazyVim)**](https://github.com/itsvrushabh/nvim) | Configured with `rust-analyzer`, `pyright`, Treesitter syntax parsing, and native LSP inlay hints. |
| **Multiplexer** | [**Tmux**](https://github.com/itsvrushabh/tmux) | Custom Omarchy Tokyo Night statusline, extended xterm key handling (`Ctrl+Shift`), session persistence. |
| **Workstation Scripts**| [**tonarchy**](https://github.com/itsvrushabh/tonarchy) | Automated system provisioning, sound, keymaps, and desktop workflow helpers. |

    </div>
  </details>

  <br />

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/itsvrushabh/itsvrushabh/output/github-contribution-grid-snake-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/itsvrushabh/itsvrushabh/output/github-contribution-grid-snake.svg" />
    <img alt="GitHub Contribution Snake" src="https://raw.githubusercontent.com/itsvrushabh/itsvrushabh/output/github-contribution-grid-snake-dark.svg" width="100%" />
  </picture>

  # 👋 Hey, I'm Vrushabh

  **Backend Developer | API Designer | Rust Enthusiast**

  I’m passionate about building scalable, fast, and reliable backend systems. Whether it’s designing clean REST APIs, optimizing database connection pools, or deploying distributed services with Docker — I enjoy working across the stack to deliver resilient backend solutions.
</div>

<br />

<div align="center">
  <h2>⚙️ Tech Stack</h2>

  <p><b>Languages, Runtimes, Infra & Tools</b></p>
  <img src="https://skillicons.dev/icons?i=rust,py,fastapi,django,docker,rabbitmq,linux,neovim,vscode,vscodium,sublime,git&theme=dark" alt="Languages, Tools and Editors" />
  
  <br /><br />
  <p><b>Databases & Caching</b></p>
  <img src="https://skillicons.dev/icons?i=postgres,mysql,sqlite,redis,mongodb&theme=dark" alt="Databases and Caching" />

  <br /><br />
  <sub>Also working with <b>Tokio</b>, <b>Axum</b>, <b>Iced</b>, <b>Turso</b>, and <b>Tmux</b> · <a href="./docs/ARCHITECTURE.md">Read Architecture & Stack Notes →</a></sub>
</div>

---

<!-- START_LANGUAGE_RADAR -->
## 🔬 Language Radar: Python & Rust Evolution
*Tracking cutting-edge runtime shifts, compiler internals, and upcoming language proposals.*

<br />

### 🐍 Python Track

<div align="center">
  <img src="https://img.shields.io/badge/Python_3.14-Current_Stable-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.14" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Python_3.15-Coming_Soon-F7C844?style=flat-square&logo=python&logoColor=black" alt="Python 3.15" />
</div>

<br />

| Release | Architectural Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: 3.14** | Typing & Metaprogramming | 1. **Deferred Annotations (PEP 649):** Type hints evaluated lazily on demand without runtime cost.<br>2. **Template Strings (PEP 750):** Native `t-strings` for injection-safe, structured templating.<br>3. **Tier-2 JIT Optimizations:** Micro-op tracing and deep interpreter tail-call speedups. |
| **🚀 Next: 3.15** | Subinterpreters & JIT Maturity | 1. **Standard Free-Threading Stability:** Full ecosystem C-extension stabilization for No-GIL.<br>2. **Advanced Tier-2 Trace JIT:** Native machine-code generation for hot instruction traces.<br>3. **Zero-Cost Exception Refinements:** Near-zero overhead for try/except blocks on happy paths. |

<br />

### 🦀 Rust Track

<div align="center">
  <img src="https://img.shields.io/badge/Rust_1.98-Current_Stable-000000?style=flat-square&logo=rust&logoColor=white" alt="Rust 1.98" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Rust_1.99+-In_Pipeline-DEA584?style=flat-square&logo=rust&logoColor=black" alt="Rust 1.99+" />
</div>

<br />

| Release | Systems Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: 1.98 / 2024** | Concurrency & Ergonomics | 1. **Async Closures:** Ergonomic borrow capturing across await points in `async |x|`.<br>2. **Let Chains:** Flattened conditional matching (`if let Some(x) = opt && x > 0`).<br>3. **`gen` Blocks & Yield:** First-class coroutine iterators without handwritten state machine boilerplate. |
| **🚀 Next: 1.99+** | Memory Safety & Expressiveness | 1. **Async Drop:** Automated asynchronous destructor cleanup for sockets and DB transactions.<br>2. **Dyn Trait Upcasting:** Native sub-to-super trait coercion without manual wrapper shims.<br>3. **Advanced Const Generics:** Compile-time evaluations and arbitrary expressions in types. |

<br />

<div align="center">
  <sub>📡 <i>Tracking frameworks, databases, and infra too?</i> <a href="./docs/TECH_RADAR.md"><b>Explore the Full-Stack Tech Radar (All 16+ Technologies) →</b></a></sub>
</div>
<!-- END_LANGUAGE_RADAR -->

<br />

<div align="center">
  <h2>📊 GitHub Activity & Language Distribution</h2>

  <img src="https://streak-stats.demolab.com/?user=itsvrushabh&theme=tokyonight" alt="GitHub Streak" />
  &nbsp;&nbsp;
  <img src="https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=itsvrushabh&layout=compact&theme=tokyonight&hide_border=true&langs_count=6" alt="Top Languages" />

  <br /><br />

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./profile-3d-contrib/profile-night-view.svg" />
    <source media="(prefers-color-scheme: light)" srcset="./profile-3d-contrib/profile-green-animate.svg" />
    <img alt="3D Contribution Graph" src="./profile-3d-contrib/profile-night-view.svg" width="100%" />
  </picture>
</div>

---

<div align="center">
  <h2>🌟 Featured Flagship Projects</h2>
  <p>Production boilerplates, asynchronous state engines, and distributed messaging architectures.</p>

  <a href="https://github.com/itsvrushabh/asyncfsm">
    <img src="https://github-readme-stats-eight-theta.vercel.app/api/pin/?username=itsvrushabh&repo=asyncfsm&theme=tokyonight&hide_border=true" alt="asyncfsm" />
  </a>
  &nbsp;
  <a href="https://github.com/itsvrushabh/fastapi-template">
    <img src="https://github-readme-stats-eight-theta.vercel.app/api/pin/?username=itsvrushabh&repo=fastapi-template&theme=tokyonight&hide_border=true" alt="fastapi-template" />
  </a>
  
  <br /><br />

  <a href="https://github.com/itsvrushabh/DineInTakeOut">
    <img src="https://github-readme-stats-eight-theta.vercel.app/api/pin/?username=itsvrushabh&repo=DineInTakeOut&theme=tokyonight&hide_border=true" alt="DineInTakeOut" />
  </a>
  &nbsp;
  <a href="https://github.com/itsvrushabh/nvim">
    <img src="https://github-readme-stats-eight-theta.vercel.app/api/pin/?username=itsvrushabh&repo=nvim&theme=tokyonight&hide_border=true" alt="nvim" />
  </a>
</div>

<br />

---

## 📐 Engineering Philosophy & System Design

```mermaid
flowchart LR
    Client([Client / Web]) -->|Reverse Proxy| Gateway[HAProxy / Gateway]
    Gateway -->|Async HTTP| Svc[FastAPI / Django / Axum]
    Svc <-->|Cache / Ephemeral| Cache[(Redis)]
    Svc <-->|Connection Pool| DB[(PostgreSQL)]
    Svc -->|Message Queue| Queue[(RabbitMQ)]
    Queue --> Worker[Async Workers]
```

* ⚡ **Zero-Allocation Critical Paths:** Leveraging Rust and Axum/Tokio when sub-millisecond throughput and deterministic memory consumption are paramount.
* 🛡️ **Resilient Distributed State:** Multi-node RabbitMQ message brokering, Redis cache-aside strategies, and robust connection pooling (`asyncpg`, `sqlx`).
* 🔒 **Strict Type Contracts:** End-to-end type safety from compile-time borrow checks in Rust to Pydantic runtime models and PEP 649 annotations in Python.

---

## 📌 Projects & Deep Dives

Check out my **Pinned Repositories** on this profile for active flagship projects. For deeper dives and the full index, explore below:

<div align="center">

| Section | Description | Link |
| :--- | :--- | :---: |
| 📡 **Full-Stack Tech Radar** | Current & upcoming versions + top 3 innovations across all 16+ tools | [**View Tech Radar →**](./docs/TECH_RADAR.md) |
| 📚 **Complete Repository Catalog** | Categorized list of all open-source repositories, forks, and tools | [**View Catalog →**](./docs/REPOSITORIES.md) |
| 📐 **Architecture & Stack Notes** | Design principles, concurrency models, and preferred system topology | [**Read Architecture →**](./docs/ARCHITECTURE.md) |

</div>

---

<br />

<div align="center">
  <img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=tokyonight" alt="Quote of the Day" />

  <h2>🤝 Connect with me</h2>
  
  <a href="https://github.com/itsvrushabh"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://linkedin.com/in/itsvrushabh"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="mailto:itsvrushabh@gmail.com"><img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail" /></a>

  <br /><br />
  <img src="https://komarev.com/ghpvc/?username=itsvrushabh&label=&color=7aa2f7&style=flat-square" alt="Views" />
</div>

---
> ⚡ Fun Fact: I love building backend systems that *just work* — fast, fault-tolerant, and future-proof.
