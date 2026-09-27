/**
 * OMARCHY INTERACTIVE TERMINAL (TUI) MODULE
 * Complete command execution, fastfetch, telemetry, bench, themes
 */
import { currentTheme, OMARCHY_THEMES, setTheme } from "./theme.js";
import { getUptimeString } from "./menubar.js";
import { toggleSFX, playKeyClick, playWindowSnap } from "./sfx.js";
import { toggleMusic, playMusic, pauseMusic } from "./audio.js";
import { openShortcutsModal } from "./shortcuts.js";
import { openCommandPalette } from "./palette.js";

export function initTUI() {
    const tuiContainer = document.getElementById('omarchy-tui');
    if (!tuiContainer) return;

    const tuiOutput = document.getElementById('tui-output');
    const tuiInput = document.getElementById('tui-input');
    const tuiForm = document.getElementById('tui-form');

    const commandHistory = [];
    let historyIdx = -1;

    const KNOWN_COMMANDS = [
      'help',
      'fastfetch',
      'neofetch',
      'top',
      'htop',
      'btop',
      'bench',
      'benchmark',
      'itsvrushabh',
      'cargo',
      'arch',
      'wasm',
      'sfx',
      'about',
      'skills',
      'projects',
      'theme',
      'themes',
      'shortcuts',
      'clear',
      'whoami',
      'date',
      'curl',
      'music',
      'sound',
      'play',
      'pause',
      'helmet',
      'reveal',
      'exit'
    ];

    const COMMAND_HANDLERS = {
      help: () => `
<div class="tui-help">
  <div class="tui-help-title">VRUSHABH WORKSTATION TUI - AVAILABLE SHELL COMMANDS:</div>
  <table class="tui-table">
    <tr><td class="cmd-k">fastfetch / neofetch</td><td>Display system hardware, OS & runtime telemetry</td></tr>
    <tr><td class="cmd-k">top / htop / btop</td><td>Live Tokio async process & core utilization monitor</td></tr>
    <tr><td class="cmd-k">bench / benchmark</td><td>Run browser CPU concurrency & hash throughput suite</td></tr>
    <tr><td class="cmd-k">itsvrushabh / cargo</td><td>Run Vrushabh's global Rust workstation CLI tool</td></tr>
    <tr><td class="cmd-k">arch</td><td>Jump to Distributed Architecture Packet Explorer</td></tr>
    <tr><td class="cmd-k">wasm</td><td>Execute Rust code in browser Tokio runtime</td></tr>
    <tr><td class="cmd-k">sfx</td><td>Toggle mechanical keyboard audio feedback (<kbd>S</kbd>)</td></tr>
    <tr><td class="cmd-k">about</td><td>Systems architect background & engineering philosophy</td></tr>
    <tr><td class="cmd-k">skills</td><td>Low-level systems, Rust, Tokio, Linux stack</td></tr>
    <tr><td class="cmd-k">projects</td><td>Flagship engines, state machines, microservices</td></tr>
    <tr><td class="cmd-k">theme [name]</td><td>Live switch site theme (e.g. <span class="text-brand">theme everforest</span>)</td></tr>
    <tr><td class="cmd-k">themes</td><td>List all 22 official themes</td></tr>
    <tr><td class="cmd-k">shortcuts</td><td>Open global keyboard shortcuts cheatsheet (<kbd>?</kbd>)</td></tr>
    <tr><td class="cmd-k">helmet / reveal</td><td>Inspect 3D racing helmet &amp; toggle visor reveal</td></tr>
    <tr><td class="cmd-k">whoami</td><td>Current terminal user session credentials</td></tr>
    <tr><td class="cmd-k">date</td><td>Show current system date & timezone</td></tr>
    <tr><td class="cmd-k">music / sound</td><td>Toggle background music playback (<kbd>M</kbd>)</td></tr>
    <tr><td class="cmd-k">clear</td><td>Clear terminal viewport</td></tr>
  </table>
  <div class="tui-tip">Tip: Press <kbd>Tab</kbd> to autocomplete, <kbd>↑</kbd>/<kbd>↓</kbd> for history, or press <kbd>T</kbd> to cycle themes.</div>
</div>`,

      top: () => `
<div class="tui-text-block">
  <div class="tui-block-heading">[ btop++ // TOKIO ASYNC PROCESS MONITOR ]</div>
  <pre style="font-family: var(--font-mono); font-size: 0.72rem; line-height: 1.4; color: var(--text);">
CPU [||||||||||||||||||||||||||||||||||||||||    ] 82.4%  8 Cores (3.80 GHz)
MEM [||||||||||||||||||||||                      ] 44.1%  7.12 GiB / 16.0 GiB
SWP [                                            ]  0.0%  0 B / 8.0 GiB

PID   COMMAND              CPU%   MEM%   TOKIO-THREADS   STATUS
-----------------------------------------------------------------
1024  tokio-reactor-main   24.1   4.2    8 worker-pool   RUNNING
1088  axum-gateway-worker  18.6   2.8    epoll/kqueue    POLLING
1142  cdc-outbox-poller    12.4   1.9    async-stream    DRAINING
1205  lapin-rabbitmq-bus    9.8   3.1    AMQP/TCP        ESTABLISHED
1350  redis-lock-manager    6.2   1.4    pipelined       READY
2490  hyprland-compositor  11.3   5.6    Wayland-DRM     60 FPS
  </pre>
  <div class="tui-tip">Tokio work-stealing scheduler: 8 hardware threads active. Type <code>clear</code> to reset view.</div>
</div>`,
      htop: () => COMMAND_HANDLERS.top(),
      btop: () => COMMAND_HANDLERS.top(),

      bench: () => {
        const start = performance.now();
        let checksum = 0;
        const iterations = 500000;
        for (let i = 0; i < iterations; i++) {
          checksum = (checksum ^ (i * 2654435761)) & 0xffffffff;
        }
        const elapsed = Math.max(1, performance.now() - start);
        const mops = ((iterations / (elapsed / 1000)) / 1000000).toFixed(2);
        return `
<div class="tui-text-block">
  <div class="tui-block-heading">[ BROWSER HARDWARE &amp; CONCURRENCY BENCHMARK ]</div>
  <div style="font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.6;">
    <div>&bull; Benchmark Loop: <strong>500,000</strong> hash &amp; matrix operations</div>
    <div>&bull; Time Elapsed: <strong>${elapsed.toFixed(2)} ms</strong></div>
    <div>&bull; Compute Throughput: <span class="text-brand"><strong>${mops} Million ops/sec</strong></span></div>
    <div>&bull; Checksum Result: <code>0x${(checksum >>> 0).toString(16).toUpperCase()}</code></div>
    <div>&bull; Workstation Rating: <span class="text-brand"><strong>TIER 1 (SYSTEMS-GRADE RUNTIME)</strong></span></div>
    <div class="tui-tip">Matches performance of AMD Ryzen 9 / Apple M3 Max / AWS Graviton c7g node.</div>
  </div>
</div>`;
      },
      benchmark: () => COMMAND_HANDLERS.bench(),

      fastfetch: () => `
<div class="tui-fastfetch">
  <pre class="tui-ascii">
 __      __ _____  _    _  _____  _    _          ____   _    _ 
 \\ \\    / /|  __ \\| |  | |/ ____|| |  | |   /\\   |  _ \\ | |  | |
  \\ \\  / / | |__) | |  | | (___  | |__| |  /  \\  | |_) || |__| |
   \\ \\/ /  |  _  /| |  | |\\___ \\ |  __  | / /\\ \\ |  _ < |  __  |
    \\  /   | | \\ \\| |__| |____) || |  | |/ ____ \\| |_) || |  | |
     \\/    |_|  \\_\\____/|_____/ |_|  |_/_/    \\_\\____/ |_|  |_|
  </pre>
  <div class="tui-spec-list">
    <div class="tui-spec-row"><span class="spec-label">OS:</span><span class="spec-val">Omarchy Linux x86_64 (Rolling)</span></div>
    <div class="tui-spec-row"><span class="spec-label">Host:</span><span class="spec-val">Arch Linux Custom Workstation</span></div>
    <div class="tui-spec-row"><span class="spec-label">Kernel:</span><span class="spec-val">6.13.4-cachyos-bore (Low-Latency PREEMPT)</span></div>
    <div class="tui-spec-row"><span class="spec-label">WM:</span><span class="spec-val">Hyprland 0.47 (Wayland Compositor)</span></div>
    <div class="tui-spec-row"><span class="spec-label">Shell:</span><span class="spec-val">zsh 5.9 + starship prompt</span></div>
    <div class="tui-spec-row"><span class="spec-label">Terminal:</span><span class="spec-val">foot / alacritty (vi-mode bindings)</span></div>
    <div class="tui-spec-row"><span class="spec-label">Editor:</span><span class="spec-val">Neovim (rust-analyzer LSP)</span></div>
    <div class="tui-spec-row"><span class="spec-label">Theme:</span><span class="spec-val text-brand">${currentTheme}</span></div>
    <div class="tui-spec-row"><span class="spec-label">Uptime:</span><span class="spec-val">${getUptimeString()}</span></div>
    <div class="tui-spec-row"><span class="spec-label">CLI Curl:</span><span class="spec-val text-brand">curl -sL itsvrushabh.github.io/cli</span></div>
    <div class="tui-spec-row"><span class="spec-label">Architect:</span><span class="spec-val">Vrushabh Deshmukh</span></div>
    <div class="tui-spec-row"><span class="spec-label">Philosophy:</span><span class="spec-val">Zero-Allocation Concurrency &middot; Omakase Defaults</span></div>
    <div class="tui-spec-colors">
      <span class="color-block c1"></span><span class="color-block c2"></span><span class="color-block c3"></span>
      <span class="color-block c4"></span><span class="color-block c5"></span><span class="color-block c6"></span><span class="color-block c7"></span>
    </div>
  </div>
</div>`,

      neofetch: () => COMMAND_HANDLERS.fastfetch(),
      itsvrushabh: () => `
<div class="tui-text-block">
  <div class="tui-block-heading">[ CARGO BINARY // itsvrushabh 0.2.0 ]</div>
  <p>Install globally with: <code>cargo install --git https://github.com/itsvrushabh/itsvrushabh.github.io</code></p>
  <div>&bull; <code>itsvrushabh blog</code> - View latest engineering dispatches</div>
  <div>&bull; <code>itsvrushabh projects</code> - Explore flagship Rust systems & crates</div>
  <div>&bull; <code>itsvrushabh dotfiles</code> - Clone Neovim & Hyprland setup</div>
  <div>&bull; <code>itsvrushabh themes</code> - Print 22 color palettes in ANSI 24-bit truecolor</div>
</div>`,
      cargo: () => COMMAND_HANDLERS.itsvrushabh(),
      arch: () => {
        document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
        return `<span class="text-brand">&check; Scrolled to Distributed Systems Architecture Explorer.</span>`;
      },
      wasm: () => {
        document.getElementById('run-wasm-btn')?.click();
        return `<span class="text-brand">&check; Triggered in-browser WebAssembly Tokio execution.</span>`;
      },
      sfx: () => {
        toggleSFX();
        return `<span class="text-brand">&check; Mechanical keyboard SFX is now ${sfxEnabled ? 'ENABLED' : 'MUTED'}.</span>`;
      },

      about: () => `
<div class="tui-text-block">
  <div class="tui-block-heading">[ ARCHITECT PROFILE // VRUSHABH DESHMUKH ]</div>
  <p>
    I am a <strong>Backend Developer & Systems Architect</strong> operating at the intersection of compile-time systems programming (<strong>Rust & Tokio</strong>) and high-throughput async microservices (<strong>Axum & Tower</strong>).
  </p>
  <p>
    I run <strong>Omarchy Linux</strong> daily with Hyprland and Neovim. My core conviction is that computers should be fast by default, beautiful out of the box, and built with malleable tools that empower developers rather than burden them.
  </p>
  <div class="tui-contact-links">
    &bull; GitHub: <a href="https://github.com/itsvrushabh" target="_blank" class="tui-link">@itsvrushabh</a><br>
    &bull; LinkedIn: <a href="https://linkedin.com/in/itsvrushabh" target="_blank" class="tui-link">in/itsvrushabh</a><br>
    &bull; Dispatches: <a href="/blog/" class="tui-link">/blog/</a>
  </div>
</div>`,

      skills: () => `
<div class="tui-text-block">
  <div class="tui-block-heading">[ TECHNICAL STACK &amp; SPECIALIZATIONS ]</div>
  <div class="tui-skills-grid">
    <div><strong>SYSTEMS & RUNTIMES:</strong> Rust (Edition 2024), Tokio Async IO, C/C++, Linux IPC, POSIX Sockets, Zero-Copy serialization</div>
    <div><strong>BACKEND ENGINES:</strong> Rust (Axum, Tower, Hyper), Lapin (RabbitMQ), SQLx, Redis-rs</div>
    <div><strong>DISTRIBUTED INFRA:</strong> RabbitMQ (Transactional Outbox), Redis (Cache-aside & Cluster), PostgreSQL, Docker</div>
    <div><strong>LINUX DESKTOP:</strong> Omarchy Linux, Hyprland, Wayland protocols, Neovim (Lua), Systemd, Bash/Zsh</div>
  </div>
</div>`,

      projects: () => `
<div class="tui-text-block">
  <div class="tui-block-heading">[ FLAGSHIP REPOSITORIES ]</div>
  <div class="tui-project-row">
    <strong>1. asyncfsm</strong> [Rust &middot; Tokio &middot; Distributed State]<br>
    Asynchronous finite state machine engine with non-blocking transitions and audit logging.<br>
    <a href="https://github.com/itsvrushabh/asyncfsm" target="_blank" class="tui-link">Repo: github.com/itsvrushabh/asyncfsm &rarr;</a>
  </div>
  <div class="tui-project-row">
    <strong>2. fastapi-template</strong> [FastAPI &middot; Asyncpg &middot; Redis &middot; Celery]<br>
    High-concurrency microservice chassis with connection pooling and container orchestration.<br>
    <a href="https://github.com/itsvrushabh/fastapi-template" target="_blank" class="tui-link">Repo: github.com/itsvrushabh/fastapi-template &rarr;</a>
  </div>
  <div class="tui-project-row">
    <strong>3. DineInTakeOut</strong> [Django &middot; WebSockets &middot; Real-Time Sync]<br>
    Peak-load event coordination engine with bidirectional WebSocket synchronization.<br>
    <a href="https://github.com/itsvrushabh/DineInTakeOut" target="_blank" class="tui-link">Repo: github.com/itsvrushabh/DineInTakeOut &rarr;</a>
  </div>
  <div class="tui-project-row">
    <strong>4. nvim &amp; omarchy-dotfiles</strong> [Lua &middot; Hyprland &middot; Wayland]<br>
    Ergonomic developer cockpit with rust-analyzer, pyright, and Omarchy theme synchronization.<br>
    <a href="https://github.com/itsvrushabh/nvim" target="_blank" class="tui-link">Repo: github.com/itsvrushabh/nvim &rarr;</a>
  </div>
</div>`,

      themes: () => `
<div class="tui-text-block">
  <div class="tui-block-heading">[ 22 OFFICIAL OMARCHY THEMES ]</div>
  <div class="tui-themes-list">
    ${OMARCHY_THEMES.map(t => `<span class="tui-theme-tag ${t === currentTheme ? 'active-tag' : ''}">theme ${t}</span>`).join(' ')}
  </div>
  <div class="tui-tip">Usage: Type <code>theme &lt;name&gt;</code> to switch (e.g. <code>theme catppuccin</code> or <code>theme gruvbox</code>).</div>
</div>`,

      shortcuts: () => {
        openShortcutsModal();
        return `<span class="text-brand">&check; Opened keyboard shortcuts cheatsheet modal.</span>`;
      },

      whoami: () => `visitor@omarchy.org (guest on Vrushabh's digital workstation)`,
      date: () => new Date().toString(),
      clear: () => {
        tuiOutput.innerHTML = '';
        return null;
      },
      music: (args) => {
        const sub = (args && args[0]) ? args[0].toLowerCase() : '';
        if (sub === 'play') {
          playMusic();
          return '<span class="text-brand">▶ Playing: 33 Max Verstappen – Carte Blanq · Maxx Power 🏎️</span>';
        } else if (sub === 'pause' || sub === 'stop') {
          pauseMusic();
          return '<span class="text-muted">❚❚ Paused background music.</span>';
        } else {
          const isPlaying = toggleMusic();
          return isPlaying
            ? '<span class="text-brand">▶ Sound on: 33 Max Verstappen – Carte Blanq · Maxx Power 🏎️</span>'
            : '<span class="text-muted">❚❚ Sound off: Background music paused.</span>';
        }
      },
      sound: (args) => COMMAND_HANDLERS.music(args),
      play: () => COMMAND_HANDLERS.music(['play']),
      pause: () => COMMAND_HANDLERS.music(['pause']),

      helmet: () => {
        const viewport = document.getElementById('hero-3d-viewport');
        if (viewport) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          viewport.click();
          return `<div class="tui-text-block">
  <div class="tui-block-heading">[ 3D RACING HELMET // HUD ENGAGED ]</div>
  <div>Navigating to 3D Viewport. Toggling interactive visor reveal...</div>
</div>`;
        }
        return `<div>3D Viewport not active.</div>`;
      },
      reveal: () => COMMAND_HANDLERS.helmet(),

      exit: () => {
        COMMAND_HANDLERS.clear();
        return `<span class="text-muted">Terminal cleared. Type 'help' to restart session.</span>`;
      }
    };

    function runCommand(cmdRaw) {
      const trimmed = cmdRaw.trim();
      if (!trimmed) return;

      // Add to history
      commandHistory.push(trimmed);
      historyIdx = commandHistory.length;

      // Render command line in output
      const cmdLineEl = document.createElement('div');
      cmdLineEl.className = 'tui-history-line';
      cmdLineEl.innerHTML = `<span class="tui-prompt"><span class="user">vrushabh</span><span class="at">@</span><span class="host">omarchy</span>:<span class="path">~</span>$</span> <span class="cmd-text">${escapeHtml(trimmed)}</span>`;
      tuiOutput.appendChild(cmdLineEl);

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      let response = '';

      if (cmd === 'theme' && args.length > 0) {
        const targetTheme = args[0].toLowerCase();
        if (OMARCHY_THEMES.includes(targetTheme)) {
          setTheme(targetTheme, true);
          response = `<span class="text-brand">&check; Switched active theme to <strong>${formatThemeName(targetTheme)}</strong>.</span>`;
        } else {
          response = `<span class="text-red">Unknown theme: '${escapeHtml(targetTheme)}'. Type 'themes' for the list of 22 supported palettes.</span>`;
        }
      } else if (cmd === 'sudo') {
        response = `<span class="text-red">Permission denied: Nice try! User is not in the sudoers file. This incident has been logged to the Omarchy Core team.</span>`;
      } else if (cmd === 'echo') {
        response = escapeHtml(args.join(' '));
      } else if (cmd === 'curl') {
        response = `Fetching remote dispatches... 200 OK. Connected to https://itsvrushabh.github.io`;
      } else if (COMMAND_HANDLERS[cmd]) {
        response = COMMAND_HANDLERS[cmd](args);
      } else {
        response = `<span class="text-red">omarchy: command not found: ${escapeHtml(cmd)}. Type <strong class="text-brand">help</strong> to see available commands.</span>`;
      }

      if (response !== null) {
        const respEl = document.createElement('div');
        respEl.className = 'tui-response';
        respEl.innerHTML = response;
        tuiOutput.appendChild(respEl);
      }

      // Auto scroll
      tuiContainer.scrollTop = tuiContainer.scrollHeight;
    }

    tuiForm.addEventListener('submit', e => {
      e.preventDefault();
      const val = tuiInput.value;
      tuiInput.value = '';
      runCommand(val);
    });

    tuiInput.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIdx > 0) {
          historyIdx--;
          tuiInput.value = commandHistory[historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx < commandHistory.length - 1) {
          historyIdx++;
          tuiInput.value = commandHistory[historyIdx] || '';
        } else {
          historyIdx = commandHistory.length;
          tuiInput.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = tuiInput.value.toLowerCase().trim();
        if (current) {
          const match = KNOWN_COMMANDS.find(c => c.startsWith(current));
          if (match) {
            tuiInput.value = match;
          }
        }
      }
    });

    // Window controls
    const btnClose = document.getElementById('tui-btn-close');
    const btnMin = document.getElementById('tui-btn-min');
    const btnMax = document.getElementById('tui-btn-max');
    const tuiWindow = document.getElementById('tui-window');

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        tuiOutput.innerHTML = '';
        tuiInput.focus();
      });
    }

    if (btnMin) {
      btnMin.addEventListener('click', () => {
        tuiWindow.classList.toggle('minimized');
      });
    }

    if (btnMax) {
      btnMax.addEventListener('click', () => {
        tuiWindow.classList.toggle('fullscreen');
      });
    }

    // Quick Command Pills
    document.querySelectorAll('[data-tui-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.tuiCmd;
        if (cmd) {
          runCommand(cmd);
          tuiInput.focus();
        }
      });
    });

    // Run initial fastfetch on load
    runCommand('fastfetch');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
