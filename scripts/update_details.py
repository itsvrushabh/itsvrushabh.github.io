#!/usr/bin/env python3
"""
scripts/update_details.py
Automated script to fetch live GitHub metrics, update Jekyll data files,
and sync README.md with the latest articles and project stats.
"""

import os
import sys
import json
import re
import urllib.request
import urllib.error
from datetime import datetime, timezone

WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(WORKSPACE_DIR, "_data")
POSTS_DIR = os.path.join(WORKSPACE_DIR, "_posts")
README_PATH = os.path.join(WORKSPACE_DIR, "README.md")

GITHUB_USER = "itsvrushabh"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

FEATURED_PROJECT_CONFIGS = [
    {
        "repo": "asyncfsm",
        "tag": "ENGINE // 01",
        "name": "asyncfsm",
        "desc": "Asynchronous finite-state machine library in Rust & Python for reactive orchestration, deterministic event queues, and low-latency transitions.",
        "stack": ["Rust", "Tokio", "Python", "AsyncIO"],
        "url": "https://github.com/itsvrushabh/asyncfsm"
    },
    {
        "repo": "fastapi-template",
        "tag": "MICROSERVICE // 02",
        "name": "fastapi-template",
        "desc": "Production-hardened asynchronous REST microservice archetype with PostgreSQL connection pooling, Redis caching, and JWT auth.",
        "stack": ["FastAPI", "PostgreSQL", "Redis", "Docker", "Pydantic"],
        "url": "https://github.com/itsvrushabh/fastapi-template"
    },
    {
        "repo": "DineInTakeOut",
        "tag": "REAL-TIME // 03",
        "name": "DineInTakeOut",
        "desc": "Event-driven omnichannel food order routing & status coordination engine powered by WebSockets, Celery task workers, and Redis pub/sub.",
        "stack": ["Python", "WebSockets", "RabbitMQ", "Redis", "PostgreSQL"],
        "url": "https://github.com/itsvrushabh/DineInTakeOut"
    },
    {
        "repo": "nvim",
        "tag": "COCKPIT // 04",
        "name": "nvim & omarchy-dotfiles",
        "desc": "Precision Linux developer ergonomics: Omarchy Linux rolling kernel, Hyprland Wayland compositor, and Neovim with rust-analyzer & pyright.",
        "stack": ["Lua", "Neovim", "Hyprland", "Wayland", "Arch Linux"],
        "url": "https://github.com/itsvrushabh/nvim"
    }
]

def make_github_request(url):
    headers = {
        "User-Agent": "itsvrushabh-portfolio-updater/1.0",
        "Accept": "application/vnd.github.v3+json"
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[WARN] HTTP Error {e.code} for {url}: {e.reason}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[WARN] Failed to fetch {url}: {e}", file=sys.stderr)
        return None

def fetch_github_data():
    print(f"Fetching GitHub user profile for {GITHUB_USER}...")
    user_data = make_github_request(f"https://api.github.com/users/{GITHUB_USER}")
    
    print(f"Fetching public repositories for {GITHUB_USER}...")
    repos_data = make_github_request(f"https://api.github.com/users/{GITHUB_USER}/repos?sort=pushed&per_page=100")
    
    return user_data, repos_data

def get_latest_posts():
    posts = []
    if not os.path.exists(POSTS_DIR):
        return posts

    for filename in sorted(os.listdir(POSTS_DIR), reverse=True):
        if not filename.endswith(".md"):
            continue
        filepath = os.path.join(POSTS_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Parse YAML frontmatter
        match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
        if not match:
            continue

        frontmatter_str = match.group(1)
        post_meta = {}
        for line in frontmatter_str.split("\n"):
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip().strip('"\'')
                post_meta[key] = val

        # Derive slug and permalink
        # format: YYYY-MM-DD-title.md
        slug_match = re.match(r"^\d{4}-\d{2}-\d{2}-(.*)\.md$", filename)
        slug = slug_match.group(1) if slug_match else filename[:-3]
        post_meta["slug"] = slug
        post_meta["url"] = f"/blog/{slug}/"
        post_meta["filename"] = filename
        posts.append(post_meta)

    return posts

def update_data_files(user_data, repos_data, posts):
    os.makedirs(DATA_DIR, exist_ok=True)
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    now_pretty = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

    # Build repo map
    repos_by_name = {}
    total_stars = 0
    total_forks = 0
    clean_repos = []

    if repos_data and isinstance(repos_data, list):
        for r in repos_data:
            if not isinstance(r, dict):
                continue
            name = r.get("name", "")
            stars = r.get("stargazers_count", 0)
            forks = r.get("forks_count", 0)
            total_stars += stars
            total_forks += forks
            repos_by_name[name.lower()] = r
            clean_repos.append({
                "name": name,
                "description": r.get("description") or "",
                "stars": stars,
                "forks": forks,
                "language": r.get("language") or "",
                "pushed_at": r.get("pushed_at") or "",
                "html_url": r.get("html_url") or f"https://github.com/{GITHUB_USER}/{name}",
                "topics": r.get("topics", [])
            })

    # 1. Update _data/github_stats.json
    stats_data = {
        "last_updated": now_iso,
        "last_updated_pretty": now_pretty,
        "user": {
            "login": GITHUB_USER,
            "name": user_data.get("name", "Vrushabh Deshmukh") if user_data else "Vrushabh Deshmukh",
            "bio": user_data.get("bio", "") if user_data else "",
            "public_repos": user_data.get("public_repos", len(clean_repos)) if user_data else len(clean_repos),
            "followers": user_data.get("followers", 0) if user_data else 0,
            "total_stars": total_stars,
            "total_forks": total_forks,
            "html_url": f"https://github.com/{GITHUB_USER}"
        },
        "repos": clean_repos
    }
    stats_file = os.path.join(DATA_DIR, "github_stats.json")
    with open(stats_file, "w", encoding="utf-8") as f:
        json.dump(stats_data, f, indent=2, ensure_ascii=False)
    print(f"Updated {stats_file}")

    # 2. Update _data/projects.json
    projects_list = []
    for conf in FEATURED_PROJECT_CONFIGS:
        repo_info = repos_by_name.get(conf["repo"].lower(), {})
        stars = repo_info.get("stargazers_count", 0)
        pushed_at = repo_info.get("pushed_at", "")
        updated_date = ""
        if pushed_at:
            try:
                dt = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
                updated_date = dt.strftime("%b %d, %Y")
            except Exception:
                updated_date = pushed_at[:10]

        projects_list.append({
            "repo": conf["repo"],
            "tag": conf["tag"],
            "name": conf["name"],
            "desc": conf["desc"],
            "stack": conf["stack"],
            "url": conf["url"],
            "stars": stars,
            "last_push": updated_date
        })

    projects_file = os.path.join(DATA_DIR, "projects.json")
    with open(projects_file, "w", encoding="utf-8") as f:
        json.dump(projects_list, f, indent=2, ensure_ascii=False)
    print(f"Updated {projects_file}")

    # 3. Update _data/latest_posts.json
    posts_file = os.path.join(DATA_DIR, "latest_posts.json")
    with open(posts_file, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"Updated {posts_file}")

    return stats_data, projects_list

def update_readme(stats_data, projects_list, posts):
    if not os.path.exists(README_PATH):
        print("README.md not found, skipping README sync.")
        return

    with open(README_PATH, "r", encoding="utf-8") as f:
        readme = f.read()

    now_pretty = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

    # 1. Update Sync Status
    status_block = f"<!-- SYNC_STATUS_START -->\n> 🔄 **Automated Telemetry:** Last verified & synced on **{now_pretty}** via GitHub Actions.\n<!-- SYNC_STATUS_END -->"
    if "<!-- SYNC_STATUS_START -->" in readme:
        readme = re.sub(r"<!-- SYNC_STATUS_START -->.*?<!-- SYNC_STATUS_END -->", status_block, readme, flags=re.DOTALL)
    else:
        # Prepend after title
        readme = re.sub(r"(# Vrushabh Deshmukh - Personal Blog & Website\n\n)", r"\1" + status_block + "\n\n", readme)

    # 2. Update Featured Projects Table
    table_lines = [
        "<!-- REPO_METRICS_START -->",
        "| Project | Stars | Tech Stack | Description | Repository |",
        "| :--- | :---: | :--- | :--- | :--- |"
    ]
    for p in projects_list:
        stack_badges = " ".join([f"`{s}`" for s in p["stack"]])
        table_lines.append(f"| **{p['name']}** | ★ {p['stars']} | {stack_badges} | {p['desc']} | [Code →]({p['url']}) |")
    table_lines.append("<!-- REPO_METRICS_END -->")
    table_block = "\n".join(table_lines)

    if "<!-- REPO_METRICS_START -->" in readme:
        readme = re.sub(r"<!-- REPO_METRICS_START -->.*?<!-- REPO_METRICS_END -->", table_block, readme, flags=re.DOTALL)
    else:
        # Insert before Features
        if "## ⚡ Features" in readme:
            readme = readme.replace("## ⚡ Features", "## 📦 Featured Systems & Repositories\n\n" + table_block + "\n\n---\n\n## ⚡ Features")

    # 3. Update Latest Technical Dispatches
    posts_lines = [
        "<!-- LATEST_POSTS_START -->"
    ]
    for p in posts[:5]:
        date_str = p.get("date", "")[:10]
        title = p.get("title", "Untitled")
        url = f"https://itsvrushabh.github.io{p.get('url', '/')}"
        desc = p.get("description", "")
        posts_lines.append(f"- **[{title}]({url})** ({date_str})  \n  _{desc}_")
    posts_lines.append("<!-- LATEST_POSTS_END -->")
    posts_block = "\n".join(posts_lines)

    if "<!-- LATEST_POSTS_START -->" in readme:
        readme = re.sub(r"<!-- LATEST_POSTS_START -->.*?<!-- LATEST_POSTS_END -->", posts_block, readme, flags=re.DOTALL)
    else:
        # Insert before Repository Structure
        if "## 📁 Repository Structure" in readme:
            readme = readme.replace("## 📁 Repository Structure", "## 📰 Latest Technical Dispatches\n\n" + posts_block + "\n\n---\n\n## 📁 Repository Structure")

    with open(README_PATH, "w", encoding="utf-8") as f:
        f.write(readme)
    print("Successfully synchronized README.md")

def main():
    print("=== Omarchy Automated Details Synchronizer ===")
    user_data, repos_data = fetch_github_data()
    posts = get_latest_posts()
    stats_data, projects_list = update_data_files(user_data, repos_data, posts)
    update_readme(stats_data, projects_list, posts)
    print("=== Details update complete ===")

if __name__ == "__main__":
    main()
