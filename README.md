# Vrushabh Deshmukh - Personal Blog & Website

<!-- SYNC_STATUS_START -->
> 🔄 **Automated Telemetry:** Last verified & synced on **September 27, 2026 at 20:32 UTC** via Rust Synchronizer.
<!-- SYNC_STATUS_END -->

Personal website, engineering blog, and systems architecture portfolio live at [https://itsvrushabh.github.io](https://itsvrushabh.github.io).

Built with **Jekyll**, vanilla CSS with dark/light mode, and hosted on **GitHub Pages**.

---

## 📦 Featured Systems & Repositories

<!-- REPO_METRICS_START -->
| Project | Stars | Tech Stack | Description | Repository |
| :--- | :---: | :--- | :--- | :--- |
| **asyncfsm** | ★ 0 | `Rust` `Tokio` `Async` `Tracing` | Asynchronous finite-state machine library in Rust & Tokio for reactive orchestration, deterministic event queues, and low-latency transitions. | [Code →](https://github.com/itsvrushabh/asyncfsm) |
| **fastapi-template** | ★ 0 | `FastAPI` `PostgreSQL` `Redis` `Docker` | Production-hardened asynchronous REST microservice archetype with PostgreSQL connection pooling, Redis caching, and JWT auth. | [Code →](https://github.com/itsvrushabh/fastapi-template) |
| **DineInTakeOut** | ★ 0 | `WebSockets` `RabbitMQ` `Redis` `PostgreSQL` | Event-driven omnichannel food order routing & status coordination engine powered by WebSockets, Celery task workers, and Redis pub/sub. | [Code →](https://github.com/itsvrushabh/DineInTakeOut) |
| **nvim & omarchy-dotfiles** | ★ 0 | `Lua` `Neovim` `Hyprland` `Wayland` `Arch Linux` | Precision Linux developer ergonomics: Omarchy Linux rolling kernel, Hyprland Wayland compositor, and Neovim with rust-analyzer & inlay hints. | [Code →](https://github.com/itsvrushabh/nvim) |
<!-- REPO_METRICS_END -->

---

## ⚡ Features

- **Blazing Fast & Zero-JS Bloat:** Built with semantic HTML5, modern CSS custom properties, and minimal vanilla JavaScript.
- **Dark / Light Theme:** Adaptive Tokyo Night dark theme by default, with instant theme toggle and system preference persistence.
- **Technical Blog:** Full markdown post support with code syntax highlighting (Rouge), reading time calculation, topic tags, and client-side instant search.
- **Responsive Architecture:** Clean layout across mobile phones, tablets, and ultra-wide desktop monitors.
- **GitHub Pages Native:** Works seamlessly with GitHub Pages native Jekyll builder. No external CI compilation required.
- **SEO & Syndication:** Automated XML sitemap generation, OpenGraph/Twitter Card metadata (`jekyll-seo-tag`), and RSS feed (`feed.xml`).

---

## 📰 Latest Technical Dispatches

<!-- LATEST_POSTS_START -->
- **[Building High-Throughput Distributed APIs in Rust with Axum and Tokio](https://itsvrushabh.github.io/blog/building-high-throughput-apis-in-rust/)** (2026-03-15)  
  _How to structure an asynchronous Rust service with Axum, Tokio, connection pooling, and zero-allocation routing for sub-millisecond p99 latencies._
- **[Resilient Distributed State: Reliable Event Queues with RabbitMQ and Redis](https://itsvrushabh.github.io/blog/resilient-distributed-state-with-rabbitmq-and-redis/)** (2026-02-10)  
  _Practical strategies for cache-aside patterns, idempotent message consumption, transactional outboxes, and dealing with network partitions._
- **[Architecting Modern Async Rust Microservices: Axum, Tokio, and Zero-Copy Concurrency](https://itsvrushabh.github.io/blog/architecting-modern-async-rust-microservices/)** (2026-01-22)  
  _Structuring production-ready asynchronous Rust microservices with Axum, SQLx connection pooling, Serde zero-copy deserialization, and multi-core work stealing._
<!-- LATEST_POSTS_END -->

---

## 📁 Repository Structure

```
├── _config.yml         # Site metadata, Jekyll plugins & permalink settings
├── _includes/          # Modular HTML partials (head, navbar, footer)
│   ├── head.html
│   ├── navbar.html
│   └── footer.html
├── _layouts/           # Page and post templates
│   ├── default.html
│   ├── page.html
│   └── post.html
├── _posts/             # Markdown articles (YYYY-MM-DD-title.md)
├── assets/
│   ├── css/            # Main styles and Rouge syntax highlighting
│   └── js/             # Dark mode toggle, copy-code button, blog search
├── about/              # About me page & workstation specifications
├── blog/               # Blog archive with live search & topic filtering
├── projects/           # Featured project catalog & repository links
├── contact/            # Contact information & quick message form
├── index.html          # Homepage with hero, tech stack & latest articles
└── 404.html            # Custom 404 error page
```

---

## ✍️ Adding a New Blog Post

To publish a new article, create a new file in `_posts/` with the filename format:
`YYYY-MM-DD-your-post-title.md`

Add the YAML front matter at the top:

```markdown
---
layout: post
title: "Your Post Title Here"
date: 2026-04-01 12:00:00 +0000
category: "Systems & Backend"
tags: ["rust", "distributed-systems", "performance"]
description: "A concise summary of what this article covers."
---

Your content in standard GitHub-Flavored Markdown here...
```

Push to `main` branch, and GitHub Pages will deploy it automatically!

---

## 💻 Local Development & Preview

### Option A: Using Jekyll (Recommended)

```bash
# Build the site
jekyll build

# Run local development server with live reload
jekyll serve
```

Preview locally at: `http://localhost:4000`

### Option B: Quick Static Server (After Build)

```bash
jekyll build
python3 -m http.server 4000 -d _site
```

### Pre-Deployment Test Suite

Run the automated route, asset, Liquid template, and live HTTP server test suite:

```bash
jekyll build
npm test
```

---

## 📜 License

MIT License. See [LICENSE](./LICENSE) for details.
