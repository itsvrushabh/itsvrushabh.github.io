#!/usr/bin/env python3
"""
Automated Repositories Catalog Bot for itsvrushabh
Queries GitHub API in real-time, categorizes repositories into logical domains,
and generates docs/REPOSITORIES.md with rich descriptions and architecture tags.
"""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
REPOSITORIES_MD_PATH = REPO_ROOT / "docs" / "REPOSITORIES.md"

CATALOG_START = "<!-- START_REPOSITORIES_CATALOG -->"
CATALOG_END = "<!-- END_REPOSITORIES_CATALOG -->"
GITHUB_USER = "itsvrushabh"

# Curated metadata dictionary providing high-quality descriptions and tags
CUSTOM_METADATA = {
    "asyncfsm": {
        "category": "rust",
        "description": "Asynchronous finite-state machine parsing engine with streaming token processing.",
        "focus": "Concurrency, State Machines, Tokio",
    },
    "hello-rocket": {
        "category": "rust",
        "description": "Type-safe asynchronous web microservice experiments with Rocket.",
        "focus": "Routing, Middleware, Microservices",
    },
    "textfsm-rs": {
        "category": "rust",
        "description": "High-performance Rust implementation of the TextFSM template parser.",
        "focus": "Parsing, Networking Templates, CLI",
    },
    "DineInTakeOut": {
        "category": "rust",
        "description": "Restaurant dining and takeout order lifecycle management service built in Rust.",
        "focus": "Systems Architecture, Backend Service",
    },
    "fastapi-template": {
        "category": "python",
        "description": "Production-ready, asynchronous REST API boilerplate with SQLAlchemy, Redis, and Docker.",
        "focus": "Async SQLAlchemy, Redis, Docker, OpenAPI",
    },
    "python-patterns": {
        "category": "python",
        "description": "Clean-code reference implementations of architectural and behavioral design patterns.",
        "focus": "Clean Architecture, OOP, Design Patterns",
    },
    "Tasker": {
        "category": "python",
        "description": "Automated workflow runner and background task orchestrator.",
        "focus": "Automation, Workflows, Scripting",
    },
    "snowflake-sqlalchemy": {
        "category": "python",
        "description": "Snowflake database dialect extensions and connection pooling optimizations.",
        "focus": "Database Dialects, SQLAlchemy, Cloud Data",
    },
    "laya_demo": {
        "category": "python",
        "description": "Python data pipeline exploration and algorithmic testbed.",
        "focus": "Data Processing, Prototyping",
    },
    "todo": {
        "category": "python",
        "description": "Minimalist task tracking backend service and CLI interface.",
        "focus": "CLI, CRUD, Python",
    },
    "rabbitmq-cluster": {
        "category": "distributed",
        "description": "Multi-node RabbitMQ message broker cluster with automated HAProxy load balancing.",
        "focus": "High Availability, Message Queues, Clustering",
    },
    "ente_local_without_s3": {
        "category": "distributed",
        "description": "End-to-end encrypted local-first private storage engine operating without cloud S3.",
        "focus": "Local-First Storage, E2EE, Security",
    },
    "nvim": {
        "category": "tooling",
        "description": "LazyVim configuration tailored for Omarchy Linux with Rust Analyzer, Pyright, and Treesitter.",
        "focus": "LazyVim, Treesitter, LSP, Tokio/Python Ergonomics",
    },
    "tmux": {
        "category": "tooling",
        "description": "Tmux terminal multiplexer setup featuring custom Omarchy Tokyo Night statusline.",
        "focus": "Session Ergonomics, Omarchy, Extended Keys",
    },
    "tonarchy": {
        "category": "tooling",
        "description": "Workstation provisioning, system tweaks, and custom tools for Omarchy Linux.",
        "focus": "Omarchy Linux, Hyprland, System Customization",
    },
    "init_me": {
        "category": "tooling",
        "description": "Automated system initialization and dotfile bootstrapper.",
        "focus": "Dotfiles, System Bootstrap, Lua",
    },
    "linux": {
        "category": "tooling",
        "description": "Linux kernel source exploration and systems programming reference.",
        "focus": "Kernel Internals, Systems Programming",
    },
    "FTracker": {
        "category": "apps",
        "description": "Personal finance and monthly budget management application.",
        "focus": "Full-Stack, Financial Tracking, UI",
    },
    "expense-organizer": {
        "category": "apps",
        "description": "Mobile expense classification and receipt accounting utility.",
        "focus": "Flutter / Dart, Mobile, Expense Tracking",
    },
    "hotel-management": {
        "category": "apps",
        "description": "Full-lifecycle hotel booking, reservation, and room management system.",
        "focus": "TypeScript, Full-Stack, Web App",
    },
    "DinningIn": {
        "category": "apps",
        "description": "Table management and guest reservation coordination application.",
        "focus": "Full-Stack, Service Management",
    },
    "itsvrushabh": {
        "category": "meta",
        "description": "Personal GitHub profile configuration, automated Tech Radar, and live CI workflows.",
        "focus": "GitHub Actions, CI/CD, Profile Automation",
    },
}

CATEGORIES = [
    ("rust", "🦀 Rust & Systems Programming", "High-performance systems, asynchronous engines, and command-line parsers."),
    ("python", "🐍 Python & Backend Engineering", "Microservices, async REST APIs, design patterns, and task runners."),
    ("distributed", "🎯 Distributed Systems & Cloud Infrastructure", "Clustered brokers, high availability setups, and encrypted storage."),
    ("tooling", "⚙️ Workstation, Dotfiles & Developer Ergonomics", "Omarchy Linux system configs, LazyVim IDE, and Tmux workflows."),
    ("apps", "🌐 Full-Stack, Mobile & Web Applications", "End-user web apps, mobile utilities, and domain-specific platforms."),
    ("meta", "🤖 Profile Automation & Meta", "Automated GitHub bots, CI workflows, and documentation generators."),
]


def fetch_github_repos(user: str):
    """Fetch all public repositories for user from GitHub API."""
    url = f"https://api.github.com/users/{user}/repos?per_page=100&sort=pushed"
    headers = {"User-Agent": "Mozilla/5.0"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                return data
    except Exception as e:
        print(f"⚠️ Error fetching repositories from GitHub: {e}", file=sys.stderr)
        return []
    return []


def categorize_repo(repo: dict) -> str:
    name = repo["name"]
    if name in CUSTOM_METADATA and "category" in CUSTOM_METADATA[name]:
        return CUSTOM_METADATA[name]["category"]

    lang = (repo.get("language") or "").lower()
    if lang == "rust":
        return "rust"
    elif lang == "python":
        return "python"
    elif lang in ("lua", "shell", "vim script", "c", "c++"):
        return "tooling"
    elif lang in ("dart", "typescript", "javascript", "html", "css"):
        return "apps"
    return "apps"


def build_repositories_markdown(repos: list) -> str:
    # Filter out archived if needed or keep all
    total_count = len(repos)
    fork_count = sum(1 for r in repos if r.get("fork"))
    source_count = total_count - fork_count

    # Group repos by category
    grouped = {cat_id: [] for cat_id, _, _ in CATEGORIES}
    for r in repos:
        cat = categorize_repo(r)
        if cat in grouped:
            grouped[cat].append(r)
        else:
            grouped["apps"].append(r)

    now_str = datetime.now(timezone.utc).strftime("%B %Y")

    lines = [
        CATALOG_START,
        "# 📚 Complete Repository Catalog",
        "",
        '<div align="left">',
        '  <a href="https://github.com/itsvrushabh/itsvrushabh/actions/workflows/update-repositories.yml">',
        '    <img src="https://github.com/itsvrushabh/itsvrushabh/actions/workflows/update-repositories.yml/badge.svg" alt="Update Repositories Catalog Status" />',
        "  </a>",
        "  &nbsp;",
        f'  <img src="https://img.shields.io/badge/Repositories-{total_count}-7aa2f7?style=flat-square&logo=github&logoColor=white" alt="Total Repositories" />',
        "  &nbsp;",
        f'  <img src="https://img.shields.io/badge/Original_Projects-{source_count}-9ece6a?style=flat-square" alt="Original Projects" />',
        "  &nbsp;",
        f'  <img src="https://img.shields.io/badge/Forks_{fork_count}-bb9af7?style=flat-square" alt="Forks" />',
        "  &nbsp;",
        f'  <img src="https://img.shields.io/badge/Last_Sync-{now_str.replace(" ", "_")}-101014?style=flat-square" alt="Last Synced" />',
        "</div>",
        "",
        f"A dynamically synchronized directory of open-source projects, experiments, dotfiles, and contributions by [Vrushabh](https://github.com/{GITHUB_USER}). Automatically updated weekly.",
        "",
        "---",
        "",
    ]

    for cat_id, cat_title, cat_desc in CATEGORIES:
        cat_repos = grouped.get(cat_id, [])
        if not cat_repos:
            continue

        # Sort repos: custom-metadata first, then alphabetically
        def sort_key(r):
            name = r["name"]
            is_curated = name in CUSTOM_METADATA
            return (0 if is_curated else 1, name.lower())

        cat_repos.sort(key=sort_key)

        lines.append(f"### {cat_title}")
        lines.append(f"*{cat_desc}*")
        lines.append("")
        lines.append("| Repository | Description | Primary Focus | Language |")
        lines.append("| :--- | :--- | :--- | :--- |")

        for r in cat_repos:
            name = r["name"]
            html_url = r["html_url"]
            is_fork = r.get("fork", False)
            stars = r.get("stargazers_count", 0)

            # Metadata resolution
            if name in CUSTOM_METADATA:
                desc = CUSTOM_METADATA[name].get("description", r.get("description") or "Open source project.")
                focus = CUSTOM_METADATA[name].get("focus", "Systems Architecture")
            else:
                desc = r.get("description") or "Open source project."
                topics = r.get("topics") or []
                if topics:
                    focus = ", ".join(t.capitalize() for t in topics[:3])
                else:
                    focus = r.get("language") or "General"

            lang = r.get("language") or "Multi-language"

            # Badges
            badges = []
            if is_fork:
                badges.append("<sub>*(Fork)*</sub>")
            if stars > 0:
                badges.append(f"⭐ `{stars}`")

            badge_str = f" {' '.join(badges)}" if badges else ""
            repo_link = f"[**{name}**]({html_url}){badge_str}"

            lines.append(f"| {repo_link} | {desc} | {focus} | `{lang}` |")

        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("[← Back to Profile Overview](../README.md)")
    lines.append("")
    lines.append(CATALOG_END)

    return "\n".join(lines) + "\n"


def update_catalog():
    print(f"📡 Fetching public repositories for user '{GITHUB_USER}' from GitHub API...")
    repos = fetch_github_repos(GITHUB_USER)
    if not repos:
        print("❌ No repositories fetched or error occurred. Aborting update.")
        sys.exit(1)

    print(f"📦 Successfully fetched {len(repos)} repositories.")

    new_content = build_repositories_markdown(repos)

    if not REPOSITORIES_MD_PATH.exists():
        print(f"📝 Creating {REPOSITORIES_MD_PATH}...")
        REPOSITORIES_MD_PATH.write_text(new_content, encoding="utf-8")
        print("✅ docs/REPOSITORIES.md created successfully!")
        return

    existing = REPOSITORIES_MD_PATH.read_text(encoding="utf-8")

    if CATALOG_START in existing and CATALOG_END in existing:
        prefix = existing.split(CATALOG_START)[0]
        suffix = existing.split(CATALOG_END)[1]
        final_content = prefix + new_content.strip() + suffix
    else:
        final_content = new_content

    if existing.strip() == final_content.strip():
        print("✨ docs/REPOSITORIES.md is already up to date.")
        return

    REPOSITORIES_MD_PATH.write_text(final_content, encoding="utf-8")
    print("🎉 Successfully updated docs/REPOSITORIES.md!")


if __name__ == "__main__":
    update_catalog()
