use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use serde::{Deserialize, Serialize};
use serde_json::Value;

const GITHUB_USER: &str = "itsvrushabh";

#[derive(Debug, Serialize, Deserialize, Clone)]
struct FeaturedProjectConfig {
    repo: String,
    tag: String,
    name: String,
    desc: String,
    stack: Vec<String>,
    url: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct UserStats {
    login: String,
    name: String,
    bio: String,
    public_repos: usize,
    followers: usize,
    total_stars: usize,
    total_forks: usize,
    html_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct GithubStatsOutput {
    last_updated: String,
    last_updated_pretty: String,
    user: UserStats,
    repos: Vec<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ProjectItem {
    repo: String,
    tag: String,
    name: String,
    desc: String,
    stack: Vec<String>,
    url: String,
    stars: usize,
    last_push: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct PostMeta {
    title: String,
    date: String,
    category: String,
    description: String,
    slug: String,
    url: String,
    filename: String,
}

fn get_workspace_root() -> PathBuf {
    // If running inside tools/portfolio-sync or root
    let current_dir = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    if current_dir.ends_with("tools/portfolio-sync") {
        current_dir.parent().unwrap().parent().unwrap().to_path_buf()
    } else if current_dir.join("_config.yml").exists() {
        current_dir
    } else {
        // Fallback traverse up
        let mut d = current_dir.clone();
        while let Some(parent) = d.parent() {
            if parent.join("_config.yml").exists() {
                return parent.to_path_buf();
            }
            d = parent.to_path_buf();
        }
        current_dir
    }
}

fn fetch_github_json(url: &str) -> Option<Value> {
    let token = env::var("GITHUB_TOKEN").ok();
    let mut cmd = Command::new("curl");
    cmd.args(["-s", "-L", "--fail", "--max-time", "15"])
        .arg("-H")
        .arg("User-Agent: itsvrushabh-portfolio-sync-rust/1.0")
        .arg("-H")
        .arg("Accept: application/vnd.github.v3+json");

    if let Some(tok) = token {
        if !tok.is_empty() {
            cmd.arg("-H").arg(format!("Authorization: token {}", tok));
        }
    }

    cmd.arg(url);

    match cmd.output() {
        Ok(output) if output.status.success() => {
            let body = String::from_utf8_lossy(&output.stdout);
            serde_json::from_str(&body).ok()
        }
        Ok(output) => {
            eprintln!("[WARN] curl error fetching {}: status {}", url, output.status);
            None
        }
        Err(e) => {
            eprintln!("[WARN] Failed to invoke curl for {}: {}", url, e);
            None
        }
    }
}

fn get_latest_posts(posts_dir: &Path) -> Vec<PostMeta> {
    let mut posts = Vec::new();
    if !posts_dir.exists() {
        return posts;
    }

    let mut entries = Vec::new();
    if let Ok(dir) = fs::read_dir(posts_dir) {
        for entry in dir.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("md") {
                entries.push(path);
            }
        }
    }

    // Sort descending by filename (YYYY-MM-DD)
    entries.sort();
    entries.reverse();

    for path in entries {
        let filename = path.file_name().unwrap().to_string_lossy().to_string();
        if let Ok(content) = fs::read_to_string(&path) {
            let mut meta = HashMap::new();
            if content.starts_with("---") {
                let parts: Vec<&str> = content.splitn(3, "---").collect();
                if parts.len() >= 3 {
                    for line in parts[1].lines() {
                        if let Some((k, v)) = line.split_once(':') {
                            let key = k.trim().to_string();
                            let val = v.trim().trim_matches('"').trim_matches('\'').to_string();
                            meta.insert(key, val);
                        }
                    }
                }
            }

            let stem = path.file_stem().unwrap().to_string_lossy();
            let slug = if stem.len() > 11 && stem.as_bytes()[4] == b'-' && stem.as_bytes()[7] == b'-' {
                stem[11..].to_string()
            } else {
                stem.to_string()
            };

            let title = meta.get("title").cloned().unwrap_or_else(|| slug.clone());
            let date = meta.get("date").cloned().unwrap_or_default();
            let category = meta.get("category").cloned().unwrap_or_else(|| "Systems".into());
            let description = meta.get("description").cloned().unwrap_or_default();

            posts.push(PostMeta {
                title,
                date,
                category,
                description,
                slug: slug.clone(),
                url: format!("/blog/{}/", slug),
                filename,
            });
        }
    }

    posts
}

fn format_iso_date(pushed_at: &str) -> String {
    // "2026-01-20T12:00:00Z" -> "Jan 20, 2026"
    if pushed_at.len() >= 10 {
        let y = &pushed_at[0..4];
        let m = &pushed_at[5..7];
        let d = &pushed_at[8..10];
        let month_name = match m {
            "01" => "Jan", "02" => "Feb", "03" => "Mar", "04" => "Apr",
            "05" => "May", "06" => "Jun", "07" => "Jul", "08" => "Aug",
            "09" => "Sep", "10" => "Oct", "11" => "Nov", "12" => "Dec",
            _ => m,
        };
        let day_num = d.trim_start_matches('0');
        format!("{} {}, {}", month_name, if day_num.is_empty() { "0" } else { day_num }, y)
    } else {
        pushed_at.to_string()
    }
}

fn update_readme(readme_path: &Path, projects: &[ProjectItem], posts: &[PostMeta]) {
    if !readme_path.exists() {
        eprintln!("[WARN] README.md not found, skipping README sync.");
        return;
    }

    let mut readme = match fs::read_to_string(readme_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("[ERROR] Failed to read README.md: {}", e);
            return;
        }
    };

    // Formatted timestamp using standard date command or fallback
    let now_output = Command::new("date")
        .args(["-u", "+%B %d, %Y at %H:%M UTC"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "September 2026".to_string());

    // 1. Sync Status
    let status_block = format!(
        "<!-- SYNC_STATUS_START -->\n> 🔄 **Automated Telemetry:** Last verified & synced on **{}** via Rust Synchronizer.\n<!-- SYNC_STATUS_END -->",
        now_output
    );
    if let (Some(s), Some(e)) = (readme.find("<!-- SYNC_STATUS_START -->"), readme.find("<!-- SYNC_STATUS_END -->")) {
        let end_idx = e + "<!-- SYNC_STATUS_END -->".len();
        readme.replace_range(s..end_idx, &status_block);
    }

    // 2. Projects Table
    let mut table_lines = vec![
        "<!-- REPO_METRICS_START -->".to_string(),
        "| Project | Stars | Tech Stack | Description | Repository |".to_string(),
        "| :--- | :---: | :--- | :--- | :--- |".to_string(),
    ];
    for p in projects {
        let badges: Vec<String> = p.stack.iter().map(|s| format!("`{}`", s)).collect();
        table_lines.push(format!(
            "| **{}** | ★ {} | {} | {} | [Code →]({}) |",
            p.name, p.stars, badges.join(" "), p.desc, p.url
        ));
    }
    table_lines.push("<!-- REPO_METRICS_END -->".to_string());
    let table_block = table_lines.join("\n");

    if let (Some(s), Some(e)) = (readme.find("<!-- REPO_METRICS_START -->"), readme.find("<!-- REPO_METRICS_END -->")) {
        let end_idx = e + "<!-- REPO_METRICS_END -->".len();
        readme.replace_range(s..end_idx, &table_block);
    }

    // 3. Latest Dispatches
    let mut posts_lines = vec!["<!-- LATEST_POSTS_START -->".to_string()];
    for p in posts.iter().take(5) {
        let date_str = if p.date.len() >= 10 { &p.date[..10] } else { &p.date };
        posts_lines.push(format!(
            "- **[{}]({})** ({})  \n  _{}_",
            p.title, format!("https://itsvrushabh.github.io{}", p.url), date_str, p.description
        ));
    }
    posts_lines.push("<!-- LATEST_POSTS_END -->".to_string());
    let posts_block = posts_lines.join("\n");

    if let (Some(s), Some(e)) = (readme.find("<!-- LATEST_POSTS_START -->"), readme.find("<!-- LATEST_POSTS_END -->")) {
        let end_idx = e + "<!-- LATEST_POSTS_END -->".len();
        readme.replace_range(s..end_idx, &posts_block);
    }

    if let Err(e) = fs::write(readme_path, readme) {
        eprintln!("[ERROR] Failed to write README.md: {}", e);
    } else {
        println!("Successfully synchronized README.md (via Rust)");
    }
}

fn main() {
    println!("=== Portfolio Automated Details Synchronizer (Rust) ===");
    let root = get_workspace_root();
    let data_dir = root.join("_data");
    let posts_dir = root.join("_posts");
    let readme_path = root.join("README.md");

    fs::create_dir_all(&data_dir).expect("Failed to create _data directory");

    println!("Fetching GitHub user profile for {}...", GITHUB_USER);
    let user_val = fetch_github_json(&format!("https://api.github.com/users/{}", GITHUB_USER));

    println!("Fetching public repositories for {}...", GITHUB_USER);
    let repos_val = fetch_github_json(&format!("https://api.github.com/users/{}/repos?sort=pushed&per_page=100", GITHUB_USER));

    let featured_configs = vec![
        FeaturedProjectConfig {
            repo: "asyncfsm".into(),
            tag: "ENGINE // 01".into(),
            name: "asyncfsm".into(),
            desc: "Asynchronous finite-state machine library in Rust & Tokio for reactive orchestration, deterministic event queues, and low-latency transitions.".into(),
            stack: vec!["Rust".into(), "Tokio".into(), "Async".into(), "Tracing".into()],
            url: "https://github.com/itsvrushabh/asyncfsm".into(),
        },
        FeaturedProjectConfig {
            repo: "fastapi-template".into(),
            tag: "MICROSERVICE // 02".into(),
            name: "fastapi-template".into(),
            desc: "Production-hardened asynchronous REST microservice archetype with PostgreSQL connection pooling, Redis caching, and JWT auth.".into(),
            stack: vec!["FastAPI".into(), "PostgreSQL".into(), "Redis".into(), "Docker".into()],
            url: "https://github.com/itsvrushabh/fastapi-template".into(),
        },
        FeaturedProjectConfig {
            repo: "DineInTakeOut".into(),
            tag: "REAL-TIME // 03".into(),
            name: "DineInTakeOut".into(),
            desc: "Event-driven omnichannel food order routing & status coordination engine powered by WebSockets, Celery task workers, and Redis pub/sub.".into(),
            stack: vec!["WebSockets".into(), "RabbitMQ".into(), "Redis".into(), "PostgreSQL".into()],
            url: "https://github.com/itsvrushabh/DineInTakeOut".into(),
        },
        FeaturedProjectConfig {
            repo: "nvim".into(),
            tag: "COCKPIT // 04".into(),
            name: "nvim & omarchy-dotfiles".into(),
            desc: "Precision Linux developer ergonomics: Omarchy Linux rolling kernel, Hyprland Wayland compositor, and Neovim with rust-analyzer & inlay hints.".into(),
            stack: vec!["Lua".into(), "Neovim".into(), "Hyprland".into(), "Wayland".into(), "Arch Linux".into()],
            url: "https://github.com/itsvrushabh/nvim".into(),
        },
    ];

    let mut repos_map: HashMap<String, Value> = HashMap::new();
    let mut total_stars: usize = 0;
    let mut total_forks: usize = 0;
    let mut clean_repos: Vec<Value> = Vec::new();

    if let Some(Value::Array(repos)) = repos_val {
        for r in repos {
            if let Some(name) = r.get("name").and_then(|v| v.as_str()) {
                let stars = r.get("stargazers_count").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
                let forks = r.get("forks_count").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
                total_stars += stars;
                total_forks += forks;
                repos_map.insert(name.to_lowercase(), r.clone());

                clean_repos.push(serde_json::json!({
                    "name": name,
                    "description": r.get("description").and_then(|v| v.as_str()).unwrap_or(""),
                    "stars": stars,
                    "forks": forks,
                    "language": r.get("language").and_then(|v| v.as_str()).unwrap_or(""),
                    "pushed_at": r.get("pushed_at").and_then(|v| v.as_str()).unwrap_or(""),
                    "html_url": r.get("html_url").and_then(|v| v.as_str()).unwrap_or(""),
                    "topics": r.get("topics").cloned().unwrap_or(serde_json::json!([]))
                }));
            }
        }
    }

    let now_iso = Command::new("date")
        .args(["-u", "+%Y-%m-%dT%H:%M:%SZ"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "2026-09-26T18:00:00Z".to_string());

    let now_pretty = Command::new("date")
        .args(["-u", "+%B %d, %Y at %H:%M UTC"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "September 26, 2026 at 18:00 UTC".to_string());

    let public_repos_count = user_val
        .as_ref()
        .and_then(|u| u.get("public_repos"))
        .and_then(|v| v.as_u64())
        .map(|v| v as usize)
        .unwrap_or(clean_repos.len());

    let followers_count = user_val
        .as_ref()
        .and_then(|u| u.get("followers"))
        .and_then(|v| v.as_u64())
        .map(|v| v as usize)
        .unwrap_or(0);

    let bio = user_val
        .as_ref()
        .and_then(|u| u.get("bio"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let stats_output = GithubStatsOutput {
        last_updated: now_iso,
        last_updated_pretty: now_pretty,
        user: UserStats {
            login: GITHUB_USER.into(),
            name: "Vrushabh Deshmukh".into(),
            bio: bio.into(),
            public_repos: public_repos_count,
            followers: followers_count,
            total_stars,
            total_forks,
            html_url: format!("https://github.com/{}", GITHUB_USER),
        },
        repos: clean_repos,
    };

    // 1. Write _data/github_stats.json
    let stats_path = data_dir.join("github_stats.json");
    let stats_json = serde_json::to_string_pretty(&stats_output).unwrap();
    fs::write(&stats_path, stats_json).expect("Failed to write github_stats.json");
    println!("Updated {:?}", stats_path);

    // 2. Build and write _data/projects.json
    let mut projects_output: Vec<ProjectItem> = Vec::new();
    for conf in featured_configs {
        let repo_val = repos_map.get(&conf.repo.to_lowercase());
        let stars = repo_val
            .and_then(|r| r.get("stargazers_count"))
            .and_then(|v| v.as_u64())
            .unwrap_or(0) as usize;

        let pushed_at = repo_val
            .and_then(|r| r.get("pushed_at"))
            .and_then(|v| v.as_str())
            .unwrap_or("");

        let last_push = if !pushed_at.is_empty() {
            format_iso_date(pushed_at)
        } else {
            String::new()
        };

        projects_output.push(ProjectItem {
            repo: conf.repo,
            tag: conf.tag,
            name: conf.name,
            desc: conf.desc,
            stack: conf.stack,
            url: conf.url,
            stars,
            last_push,
        });
    }

    let projects_path = data_dir.join("projects.json");
    let projects_json = serde_json::to_string_pretty(&projects_output).unwrap();
    fs::write(&projects_path, projects_json).expect("Failed to write projects.json");
    println!("Updated {:?}", projects_path);

    // 3. Parse posts and write _data/latest_posts.json
    let posts = get_latest_posts(&posts_dir);
    let posts_path = data_dir.join("latest_posts.json");
    let posts_json = serde_json::to_string_pretty(&posts).unwrap();
    fs::write(&posts_path, posts_json).expect("Failed to write latest_posts.json");
    println!("Updated {:?}", posts_path);

    // 4. Update README.md
    update_readme(&readme_path, &projects_output, &posts);

    println!("=== Details synchronization in Rust completed successfully ===");
}
