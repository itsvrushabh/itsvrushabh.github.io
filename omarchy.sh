#!/usr/bin/env sh
# ==============================================================================
# OMARCHY // VRUSHABH DESHMUKH QUICK FETCH
# Usage: curl -sL https://itsvrushabh.github.io/omarchy.sh | sh
# ==============================================================================

# ANSI Color Codes
BOLD="\033[1m"
GREEN="\033[38;2;158;206;106m"
CYAN="\033[38;2;122;162;247m"
PURPLE="\033[38;2;187;154;247m"
YELLOW="\033[38;2;224;175;104m"
RESET="\033[0m"

clear 2>/dev/null || true

printf "${GREEN}${BOLD}"
cat << "EOF"
 __      __ _____  _    _  _____  _    _          ____   _    _ 
 \ \    / /|  __ \| |  | |/ ____|| |  | |   /\   |  _ \ | |  | |
  \ \  / / | |__) | |  | | (___  | |__| |  /  \  | |_) || |__| |
   \ \/ /  |  _  /| |  | |\___ \ |  __  | / /\ \ |  _ < |  __  |
    \  /   | | \ \| |__| |____) || |  | |/ ____ \| |_) || |  | |
     \/    |_|  \_\____/|_____/ |_|  |_/_/    \_\____/ |_|  |_|
EOF
printf "${RESET}\n"

printf "${BOLD}VRUSHABH DESHMUKH // WORKSTATION TELEMETRY${RESET}\n"
printf "%s\n" "---------------------------------------------------------"
printf "${CYAN}Architect:${RESET}   Vrushabh Deshmukh\n"
printf "${CYAN}OS:${RESET}          Omarchy Linux x86_64 (Rolling)\n"
printf "${CYAN}Compositor:${RESET}  Hyprland (Wayland)\n"
printf "${CYAN}Shell:${RESET}       zsh + Starship\n"
printf "${CYAN}Editor:${RESET}      Neovim (rust-analyzer LSP)\n"
printf "${CYAN}Stack:${RESET}       Rust (Tokio / Axum), Distributed Systems, Lapin, Redis\n"
printf "${CYAN}GitHub:${RESET}      https://github.com/itsvrushabh\n"
printf "${CYAN}Website:${RESET}     https://itsvrushabh.github.io\n"
printf "%s\n" "---------------------------------------------------------"
printf "${YELLOW}${BOLD}Flagship Repositories:${RESET}\n"
printf "  1. ${GREEN}asyncfsm${RESET}         - Asynchronous Rust FSM engine with non-blocking transitions\n"
printf "  2. ${GREEN}fastapi-template${RESET} - Production microservice chassis with async connection pooling\n"
printf "  3. ${GREEN}DineInTakeOut${RESET}    - Real-time order orchestration with WebSockets\n"
printf "  4. ${GREEN}nvim & dotfiles${RESET}  - Precision Linux ergonomics with rust-analyzer LSP\n"
printf "%s\n" "---------------------------------------------------------"
printf "${PURPLE}Enjoy the malleable era of Linux!${RESET}\n\n"
