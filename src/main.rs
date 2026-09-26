use std::env;

const BOLD: &str = "\x1b[1m";
const CYAN: &str = "\x1b[38;2;122;162;247m";
const GREEN: &str = "\x1b[38;2;158;206;106m";
const YELLOW: &str = "\x1b[38;2;224;175;104m";
const DIM: &str = "\x1b[2m";
const RESET: &str = "\x1b[0m";

fn print_banner() {
    println!(
        "{}{}\
 __      __ _____  _    _  _____  _    _          ____   _    _ 
 \\ \\    / /|  __ \\| |  | |/ ____|| |  | |   /\\   |  _ \\ | |  | |
  \\ \\  / / | |__) | |  | | (___  | |__| |  /  \\  | |_) || |__| |
   \\ \\/ /  |  _  /| |  | |\\___ \\ |  __  | / /\\ \\ |  _ < |  __  |
    \\  /   | | \\ \\| |__| |____) || |  | |/ ____ \\| |_) || |  | |
     \\/    |_|  \\_\\\\____/|_____/ |_|  |_/_/    \\_\\____/ |_|  |_|{}",
        GREEN, BOLD, RESET
    );
}

fn print_fastfetch() {
    print_banner();
    println!("{}VRUSHABH DESHMUKH // WORKSTATION TELEMETRY{}", BOLD, RESET);
    println!("{DIM}---------------------------------------------------------{RESET}");
    println!("{}Architect:{}   Vrushabh Deshmukh", CYAN, RESET);
    println!("{}Role:{}        Systems & Backend Engineer", CYAN, RESET);
    println!("{}OS:{}          Arch Linux / Omarchy (Rolling Kernel)", CYAN, RESET);
    println!("{}Compositor:{}  Hyprland (Wayland)", CYAN, RESET);
    println!("{}Shell:{}       zsh 5.9 + Starship Prompt", CYAN, RESET);
    println!("{}Editor:{}      Neovim (rust-analyzer LSP)", CYAN, RESET);
    println!("{}Stack:{}       Rust (Tokio, Axum, Tower), Lapin, Redis", CYAN, RESET);
    println!("{}GitHub:{}      https://github.com/itsvrushabh", CYAN, RESET);
    println!("{}Website:{}     https://itsvrushabh.github.io", CYAN, RESET);
    println!("{DIM}---------------------------------------------------------{RESET}");
    println!("{}CLI Subcommands:{}", YELLOW, RESET);
    println!("  {}itsvrushabh blog{}     - Read latest engineering dispatches", GREEN, RESET);
    println!("  {}itsvrushabh projects{} - View flagship Rust systems & crates", GREEN, RESET);
    println!("  {}itsvrushabh dotfiles{} - Inspect & clone Neovim/Hyprland config", GREEN, RESET);
    println!("  {}itsvrushabh themes{}   - Print 22 official Omarchy color swatches", GREEN, RESET);
    println!("{DIM}---------------------------------------------------------{RESET}");
    println!("{}Run {}itsvrushabh <subcommand>{} to explore.{}", DIM, CYAN, DIM, RESET);
}

fn print_blog() {
    println!("\n{}📰 TECHNICAL DISPATCHES // VRUSHABH DESHMUKH{}\n", BOLD, RESET);
    println!(
        "{}1. Building High-Throughput Distributed APIs in Rust with Axum and Tokio{}",
        BOLD, RESET
    );
    println!("   {}Date:{} 2026-03-15 | {}Tags:{} rust, axum, tokio, performance", DIM, RESET, DIM, RESET);
    println!("   Zero-allocation routing, connection pooling, and sub-millisecond p99 latencies.");
    println!("   {}URL:{} https://itsvrushabh.github.io/blog/building-high-throughput-apis-in-rust/\n", CYAN, RESET);

    println!(
        "{}2. Resilient Distributed State: Reliable Event Queues with RabbitMQ and Redis{}",
        BOLD, RESET
    );
    println!("   {}Date:{} 2026-02-10 | {}Tags:{} distributed-systems, rabbitmq, redis", DIM, RESET, DIM, RESET);
    println!("   Transactional outbox pattern, idempotent message consumers, and network partitions.");
    println!("   {}URL:{} https://itsvrushabh.github.io/blog/resilient-distributed-state-with-rabbitmq-and-redis/\n", CYAN, RESET);

    println!(
        "{}3. Architecting Modern Async Rust Microservices: Axum, Tokio, and Zero-Copy Concurrency{}",
        BOLD, RESET
    );
    println!("   {}Date:{} 2026-01-22 | {}Tags:{} rust, axum, tokio, concurrency", DIM, RESET, DIM, RESET);
    println!("   Production-ready async services with SQLx compile-time query validation & Tokio work-stealing.");
    println!("   {}URL:{} https://itsvrushabh.github.io/blog/architecting-modern-async-rust-microservices/\n", CYAN, RESET);
}

fn print_projects() {
    println!("\n{}📦 FLAGSHIP OPEN-SOURCE SYSTEMS & REPOSITORIES{}\n", BOLD, RESET);
    println!("  {}1. asyncfsm{} [ENGINE // 01]", GREEN, RESET);
    println!("     Asynchronous finite-state machine library in Rust & Tokio for reactive orchestration.");
    println!("     {}Stack:{} Rust, Tokio, Async, Tracing | https://github.com/itsvrushabh/asyncfsm\n", DIM, RESET);

    println!("  {}2. fastapi-template{} [MICROSERVICE // 02]", GREEN, RESET);
    println!("     Production-hardened asynchronous REST microservice archetype with connection pooling.");
    println!("     {}Stack:{} FastAPI, PostgreSQL, Redis, Docker | https://github.com/itsvrushabh/fastapi-template\n", DIM, RESET);

    println!("  {}3. DineInTakeOut{} [REAL-TIME // 03]", GREEN, RESET);
    println!("     Event-driven omnichannel food order routing & status coordination engine.");
    println!("     {}Stack:{} WebSockets, RabbitMQ, Redis, PostgreSQL | https://github.com/itsvrushabh/DineInTakeOut\n", DIM, RESET);

    println!("  {}4. nvim & omarchy-dotfiles{} [COCKPIT // 04]", GREEN, RESET);
    println!("     Precision Linux developer workstation ergonomics: Hyprland, Wayland, and Neovim.");
    println!("     {}Stack:{} Lua, Neovim, Hyprland, Wayland, Arch Linux | https://github.com/itsvrushabh/nvim\n", DIM, RESET);
}

fn print_dotfiles() {
    println!("\n{}⚙️ WORKSTATION DOTFILES & CONFIGURATION{}\n", BOLD, RESET);
    println!("To clone Vrushabh's Neovim & Omarchy Linux workstation configs:");
    println!("\n  {}git clone https://github.com/itsvrushabh/nvim ~/.config/nvim{}", CYAN, RESET);
    println!("  {}curl -sL https://itsvrushabh.github.io/omarchy.sh | sh{}\n", GREEN, RESET);
    println!("Dotfiles include:");
    println!("  - Neovim with rust-analyzer, inlay hints, and lazy.nvim plugin management");
    println!("  - Hyprland Wayland compositor with hardware-accelerated animations");
    println!("  - Starship prompt with Tokio async runtime and Git branch status\n");
}

fn print_themes() {
    println!("\n{}🎨 OMARCHY 22 OFFICIAL THEMES TELEMETRY{}\n", BOLD, RESET);
    let themes = [
        ("tokyo-night", "Tokyo Night", "\x1b[48;2;26;27;38m   \x1b[48;2;122;162;247m   \x1b[48;2;158;206;106m   \x1b[0m"),
        ("catppuccin", "Catppuccin", "\x1b[48;2;30;30;46m   \x1b[48;2;137;180;250m   \x1b[48;2;166;227;161m   \x1b[0m"),
        ("gruvbox", "Gruvbox", "\x1b[48;2;40;40;40m   \x1b[48;2;254;128;25m   \x1b[48;2;184;187;38m   \x1b[0m"),
        ("nord", "Nord", "\x1b[48;2;46;52;64m   \x1b[48;2;136;192;208m   \x1b[48;2;163;190;140m   \x1b[0m"),
        ("everforest", "Everforest", "\x1b[48;2;45;53;59m   \x1b[48;2;167;192;128m   \x1b[48;2;127;187;179m   \x1b[0m"),
        ("rose-pine", "Rosé Pine", "\x1b[48;2;25;23;36m   \x1b[48;2;235;111;146m   \x1b[48;2;49;116;143m   \x1b[0m"),
        ("hackerman", "Hackerman", "\x1b[48;2;10;14;10m   \x1b[48;2;0;255;65m   \x1b[48;2;32;194;14m   \x1b[0m"),
        ("kanagawa", "Kanagawa", "\x1b[48;2;31;31;40m   \x1b[48;2;126;156;216m   \x1b[48;2;152;187;108m   \x1b[0m"),
    ];

    for (slug, name, swatch) in themes {
        println!("  {:<14} {:<15} {}", slug, name, swatch);
    }
    println!("\n{}Switch live themes on website by pressing {}T{} or using Command Palette (Ctrl+K).{}\n", DIM, YELLOW, DIM, RESET);
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let cmd = args.get(1).map(|s| s.as_str()).unwrap_or("");

    match cmd {
        "blog" | "dispatches" | "posts" => print_blog(),
        "projects" | "repos" => print_projects(),
        "dotfiles" | "config" => print_dotfiles(),
        "themes" | "theme" => print_themes(),
        _ => print_fastfetch(),
    }
}
