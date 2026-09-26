/**
 * OMARCHY CORE JAVASCRIPT ENGINE
 * Handles:
 * 1. 22 Official Omarchy Themes + cycling with 'T'
 * 2. Interactive Terminal User Interface (TUI) with real command execution
 * 3. Global Keyboard Shortcuts System (cheatsheet modal, hotkeys)
 * 4. Ambient Background Canvas Animation with dynamic theme reactivity
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. THEMES SYSTEM
  // =========================================================================
  const OMARCHY_THEMES = [
    'tokyo-night',
    'catppuccin',
    'gruvbox',
    'nord',
    'everforest',
    'rose-pine',
    'hackerman',
    'kanagawa',
    'matte-black',
    'solitude',
    'lumon',
    'retro-82',
    'miasma',
    'osaka-jade',
    'last-horizon',
    'ethereal',
    'catppuccin-latte',
    'flexoki-light',
    'lupine',
    'ristretto',
    'vantablack',
    'white'
  ];

  let currentTheme = localStorage.getItem('omarchy-site-theme') || 'tokyo-night';
  if (!OMARCHY_THEMES.includes(currentTheme)) {
    currentTheme = 'tokyo-night';
  }

  function setTheme(themeName, showToast = true) {
    if (!OMARCHY_THEMES.includes(themeName)) return;
    currentTheme = themeName;
    document.documentElement.dataset.theme = themeName;
    localStorage.setItem('omarchy-site-theme', themeName);

    // Update active state on theme chips
    document.querySelectorAll('[data-theme-choice]').forEach(btn => {
      const isCurrent = btn.dataset.themeChoice === themeName;
      btn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      btn.classList.toggle('active', isCurrent);
    });

    // Update TUI active theme indicator if present
    const tuiThemeEl = document.getElementById('tui-active-theme');
    if (tuiThemeEl) {
      tuiThemeEl.textContent = themeName;
    }

    // Update meta theme-color from computed bg
    setTimeout(() => {
      const computedBg = getComputedStyle(document.documentElement).getPropertyValue('--t-bg').trim();
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme && computedBg) {
        metaTheme.setAttribute('content', computedBg);
      }
      // Notify canvas animation of theme change
      window.dispatchEvent(new CustomEvent('omarchyThemeChanged', { detail: { theme: themeName } }));
    }, 50);

    if (showToast) {
      showToastNotice(`Theme: ${formatThemeName(themeName)} · Press T to cycle`);
    }
  }

  function cycleTheme() {
    const idx = OMARCHY_THEMES.indexOf(currentTheme);
    const nextIdx = (idx + 1) % OMARCHY_THEMES.length;
    setTheme(OMARCHY_THEMES[nextIdx], true);
  }

  function formatThemeName(slug) {
    return slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Toast notification helper
  let toastTimeout;
  function showToastNotice(msg) {
    let toast = document.getElementById('omarchy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'omarchy-toast';
      toast.className = 'omarchy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  // =========================================================================
  // 2. BACKGROUND CANVAS ANIMATION (Retro Grid / Cyber Particles)
  // =========================================================================
  function initBackgroundCanvas() {
    const canvas = document.getElementById('omarchy-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let animationFrameId = null;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let brandColor = '#9ece6a';
    let borderColor = 'rgba(255, 255, 255, 0.08)';

    function updateColors() {
      const styles = getComputedStyle(document.documentElement);
      brandColor = styles.getPropertyValue('--t-brand').trim() || '#9ece6a';
      borderColor = styles.getPropertyValue('--t-border-subtle').trim() || 'rgba(255, 255, 255, 0.08)';
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      createParticles();
    }

    function createParticles() {
      particles = [];
      // Adjust density based on screen dimensions
      const count = Math.min(Math.floor((width * height) / 18000), 55);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.8 + 1,
          baseAlpha: Math.random() * 0.35 + 0.15,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    }

    let time = 0;
    function render() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle retro grid scanlines
      const gridSize = 48;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      // Draw vertical grid lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      // Draw horizontal grid lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      time += 0.02;

      // Audio-reactive visualizer boost
      let audioBoost = 0;
      if (window.audioAnalyser && window.isAudioPlaying && window.audioFrequencyData) {
        window.audioAnalyser.getByteFrequencyData(window.audioFrequencyData);
        // Average low-frequency bass (bins 1 to 6)
        let bassSum = 0;
        for (let b = 1; b <= 6; b++) {
          bassSum += window.audioFrequencyData[b] || 0;
        }
        audioBoost = (bassSum / 6) / 255; // 0.0 to 1.0

        // Real-time equalizer bars update on music player
        const eqBars = document.querySelectorAll('#omarchy-music-player .eq-bar');
        if (eqBars.length === 4) {
          const b1 = Math.max(2, Math.round((window.audioFrequencyData[2] / 255) * 14));
          const b2 = Math.max(2, Math.round((window.audioFrequencyData[6] / 255) * 14));
          const b3 = Math.max(2, Math.round((window.audioFrequencyData[12] / 255) * 14));
          const b4 = Math.max(2, Math.round((window.audioFrequencyData[20] / 255) * 14));
          eqBars[0].style.height = b1 + 'px';
          eqBars[1].style.height = b2 + 'px';
          eqBars[2].style.height = b3 + 'px';
          eqBars[3].style.height = b4 + 'px';
        }
      }

      // Update and draw particles & links
      for (let i = 0; i < particles.length; i++) {
        const speedMult = 1 + audioBoost * 1.8;
        const p = particles[i];
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse gentle interaction
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        // Particle pulse
        const alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed * 20 + p.pulseOffset) * 0.12;

        // Draw particle
        ctx.fillStyle = brandColor;
        ctx.globalAlpha = Math.max(0.05, Math.min(0.8, alpha));
        ctx.beginPath();
        const rBoost = p.radius * (1 + audioBoost * 0.9);
        ctx.arc(p.x, p.y, rBoost, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            ctx.strokeStyle = brandColor;
            ctx.globalAlpha = (1 - dist2 / 110) * 0.18;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    }

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animationFrameId);
      resize();
      render();
    });

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('omarchyThemeChanged', () => {
      updateColors();
    });

    // Pause when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        render();
      }
    });

    updateColors();
    resize();
    render();
  }

  // =========================================================================
  // 3. INTERACTIVE TUI (TERMINAL USER INTERFACE)
  // =========================================================================
  function initTUI() {
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
      'exit'
    ];

    const COMMAND_HANDLERS = {
      help: () => `
<div class="tui-help">
  <div class="tui-help-title">VRUSHABH WORKSTATION TUI - AVAILABLE SHELL COMMANDS:</div>
  <table class="tui-table">
    <tr><td class="cmd-k">fastfetch / neofetch</td><td>Display system hardware, OS & runtime telemetry</td></tr>
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
    <tr><td class="cmd-k">whoami</td><td>Current terminal user session credentials</td></tr>
    <tr><td class="cmd-k">date</td><td>Show current system date & timezone</td></tr>
    <tr><td class="cmd-k">music / sound</td><td>Toggle background music playback (<kbd>M</kbd>)</td></tr>
    <tr><td class="cmd-k">clear</td><td>Clear terminal viewport</td></tr>
  </table>
  <div class="tui-tip">Tip: Press <kbd>Tab</kbd> to autocomplete, <kbd>↑</kbd>/<kbd>↓</kbd> for history, or press <kbd>T</kbd> to cycle themes.</div>
</div>`,

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
          return '<span class="text-brand">▶ Playing: Kevin Koontz - We Can Fix Everything [Omarchy OST]</span>';
        } else if (sub === 'pause' || sub === 'stop') {
          pauseMusic();
          return '<span class="text-muted">❚❚ Paused background music.</span>';
        } else {
          const isPlaying = toggleMusic();
          return isPlaying
            ? '<span class="text-brand">▶ Sound on: Kevin Koontz - We Can Fix Everything [Omarchy OST]</span>'
            : '<span class="text-muted">❚❚ Sound off: Background music paused.</span>';
        }
      },
      sound: (args) => COMMAND_HANDLERS.music(args),
      play: () => COMMAND_HANDLERS.music(['play']),
      pause: () => COMMAND_HANDLERS.music(['pause']),

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

  // =========================================================================
  // 4. GLOBAL SHORTCUTS MODAL & LISTENER
  // =========================================================================
  function openShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.classList.add('visible');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.classList.remove('visible');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function initShortcuts() {
    // Keyboard listener
    let gKeyTimeout;
    let gPressed = false;

    window.addEventListener('keydown', e => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInputFocused = (activeTag === 'input' || activeTag === 'textarea') && document.activeElement.id !== 'tui-input';

      // Always handle Escape
      // Handle Ctrl+K / Cmd+K / Super+Space for Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      if (e.key === 'Escape') {
        closeCommandPalette();
        closeShortcutsModal();
        const tuiWindow = document.getElementById('tui-window');
        if (tuiWindow && tuiWindow.classList.contains('fullscreen')) {
          tuiWindow.classList.remove('fullscreen');
        }
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        return;
      }

      // If user is inside an input form, don't hijack typing
      if (isInputFocused) return;

      // Handle '?' for shortcuts (unless in terminal input)
      if ((e.key === '?' || (e.key === '/' && e.shiftKey)) && document.activeElement.id !== 'tui-input') {
        e.preventDefault();
        const modal = document.getElementById('shortcuts-modal');
        if (modal && modal.classList.contains('visible')) {
          closeShortcutsModal();
        } else {
          openShortcutsModal();
        }
        return;
      }

      // Handle 'S' / 's' for mechanical audio SFX toggle (unless in terminal input)
      if ((e.key === 's' || e.key === 'S') && document.activeElement.id !== 'tui-input') {
        e.preventDefault();
        toggleSFX();
        return;
      }

      // Handle 'M' / 'm' to toggle music
      if ((e.key === 'm' || e.key === 'M') && document.activeElement.id !== 'tui-input') {
        e.preventDefault();
        toggleMusic();
        return;
      }

      // Handle 'T' / 't' for theme cycle (unless in terminal input)
      if ((e.key === 't' || e.key === 'T') && document.activeElement.id !== 'tui-input') {
        e.preventDefault();
        cycleTheme();
        return;
      }

      // Handle '`' or '~' to focus terminal
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        const tuiInput = document.getElementById('tui-input');
        const termSec = document.getElementById('terminal');
        if (termSec) {
          termSec.scrollIntoView({ behavior: 'smooth' });
        }
        if (tuiInput) {
          setTimeout(() => tuiInput.focus(), 200);
        }
        return;
      }

      // Handle navigation keys 1-5
      if (['1', '2', '3', '4', '5'].includes(e.key) && document.activeElement.id !== 'tui-input') {
        e.preventDefault();
        const map = {
          '1': '#home',
          '2': '#terminal',
          '3': '#projects',
          '4': '#themes',
          '5': '#dispatches'
        };
        const target = document.querySelector(map[e.key]);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      // Handle 'G' then 'H' for GitHub
      if ((e.key === 'g' || e.key === 'G') && document.activeElement.id !== 'tui-input') {
        gPressed = true;
        clearTimeout(gKeyTimeout);
        gKeyTimeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }
      if (gPressed && (e.key === 'h' || e.key === 'H')) {
        gPressed = false;
        window.open('https://github.com/itsvrushabh', '_blank');
        return;
      }
    });

    // Close buttons on modal
    document.querySelectorAll('[data-close-shortcuts]').forEach(el => {
      el.addEventListener('click', closeShortcutsModal);
    });

    // Open button on triggers
    document.querySelectorAll('[data-open-shortcuts]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        openShortcutsModal();
      });
    });

    // Theme trigger button in header
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        cycleTheme();
      });
    }

    // Theme picker chips in themes section
    document.querySelectorAll('[data-theme-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.dataset.themeChoice;
        setTheme(chosen, true);
      });
    });

    // Quick copy snippet
    const copyBtn = document.getElementById('copy-install-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const snippet = copyBtn.dataset.snippet || 'curl -sL https://itsvrushabh.github.io/omarchy.sh | sh';
        navigator.clipboard.writeText(snippet).then(() => {
          showToastNotice('Copied command to clipboard!');
          const label = copyBtn.querySelector('.copy-label');
          if (label) {
            const original = label.textContent;
            label.textContent = 'Copied!';
            setTimeout(() => {
              label.textContent = original;
            }, 2000);
          }
        });
      });
    }

    // Mobile nav toggle
    const mobToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobToggle && navMenu) {
      mobToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        mobToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  // =========================================================================
  
  // =========================================================================
  // 5. AMBIENT MUSIC ENGINE (Kevin Koontz - We Can Fix Everything)
  // =========================================================================
  let audioInstance = null;
  let isAudioPlaying = false;

  function getAudio() {
    if (!audioInstance) {
      audioInstance = new Audio();
      audioInstance.crossOrigin = 'anonymous';

      // Setup Web Audio API Analyser for real-time visualizer
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaElementSource(audioInstance);
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          window.audioAnalyser = analyser;
          window.audioContext = audioCtx;
          window.audioFrequencyData = new Uint8Array(analyser.frequencyBinCount);
        }
      } catch (e) {
        console.warn('Web Audio API not supported or restricted:', e);
      }
      audioInstance.loop = true;
      audioInstance.preload = 'metadata';
      audioInstance.src = '/assets/audio/kevin_koontz-we_can_fix_everything.mp3';

      audioInstance.addEventListener('error', () => {
        console.warn('Local audio path failed, falling back to omarchy.org CDN');
        if (!audioInstance.src.includes('omarchy.org')) {
          audioInstance.src = 'https://omarchy.org/music/kevin_koontz-we_can_fix_everything.mp3';
        }
      });

      const seek = document.getElementById('music-seek');
      const currTimeEl = document.getElementById('music-curr-time');
      const durationEl = document.getElementById('music-duration');

      audioInstance.addEventListener('timeupdate', () => {
        if (audioInstance.duration) {
          const progress = (audioInstance.currentTime / audioInstance.duration) * 100;
          if (seek && !seek.dataset.seeking) {
            seek.value = progress;
          }
          if (currTimeEl) currTimeEl.textContent = formatAudioTime(audioInstance.currentTime);
          if (durationEl) durationEl.textContent = formatAudioTime(audioInstance.duration);
        }
      });

      audioInstance.addEventListener('loadedmetadata', () => {
        if (durationEl) durationEl.textContent = formatAudioTime(audioInstance.duration);
      });

      if (seek) {
        seek.addEventListener('input', () => {
          seek.dataset.seeking = 'true';
          if (audioInstance.duration) {
            const t = (seek.value / 100) * audioInstance.duration;
            if (currTimeEl) currTimeEl.textContent = formatAudioTime(t);
          }
        });
        seek.addEventListener('change', () => {
          seek.dataset.seeking = '';
          if (audioInstance.duration) {
            audioInstance.currentTime = (seek.value / 100) * audioInstance.duration;
          }
        });
      }
    }
    return audioInstance;
  }

  function formatAudioTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${String(rem).padStart(2, '0')}`;
  }

  function updateMusicUI(playing) {
    isAudioPlaying = playing;
    window.isAudioPlaying = playing;
    if (playing && window.audioContext && window.audioContext.state === 'suspended') {
      window.audioContext.resume();
    }
    const playerEl = document.getElementById('omarchy-music-player');
    const iconPlay = document.getElementById('music-overlay-icon-play');
    const iconPause = document.getElementById('music-overlay-icon-pause');
    const headSoundOff = document.getElementById('header-sound-off-icon');
    const headSoundOn = document.getElementById('header-sound-on-icon');

    if (playerEl) playerEl.classList.toggle('playing', playing);
    if (iconPlay) iconPlay.style.display = playing ? 'none' : 'block';
    if (iconPause) iconPause.style.display = playing ? 'block' : 'none';
    if (headSoundOff) headSoundOff.style.display = playing ? 'none' : 'block';
    if (headSoundOn) headSoundOn.style.display = playing ? 'block' : 'none';
    if (!playing) {
      document.querySelectorAll('#omarchy-music-player .eq-bar').forEach(bar => {
        bar.style.height = '3px';
      });
    }
  }

  function playMusic() {
    const audio = getAudio();
    audio.play().then(() => {
      updateMusicUI(true);
      showToastNotice('▶ Sound on: Kevin Koontz - We Can Fix Everything');
    }).catch(err => {
      console.warn('User gesture required to play audio:', err);
      showToastNotice('Click music button to enable sound');
    });
    return true;
  }

  function pauseMusic() {
    const audio = getAudio();
    audio.pause();
    updateMusicUI(false);
    showToastNotice('❚❚ Sound off');
    return false;
  }

  function toggleMusic() {
    const audio = getAudio();
    if (audio.paused) {
      return playMusic();
    } else {
      return pauseMusic();
    }
  }

  function initMusicPlayer() {
    const playBtn = document.getElementById('music-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', toggleMusic);
    }
    const headerToggle = document.getElementById('header-music-toggle');
    if (headerToggle) {
      headerToggle.addEventListener('click', toggleMusic);
    }
  }

  // =========================================================================
  
  // =========================================================================
  // 6. COMMAND PALETTE ENGINE (Ctrl+K / Super+Space / Wofi)
  // =========================================================================
  const PALETTE_COMMANDS = [
    // Navigation
    { id: 'nav-home', label: 'Go to Home / Overview', category: 'Navigation', icon: '⚡', action: () => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'nav-term', label: 'Open Interactive TUI Terminal', category: 'Navigation', icon: '💻', action: () => { document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => document.getElementById('tui-input')?.focus(), 250); } },
        { id: 'nav-arch', label: 'Distributed Systems Architecture Explorer', category: 'Navigation', icon: '🏗️', action: () => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'sfx-toggle', label: 'Toggle Mechanical Audio SFX (Press S)', category: 'Media', icon: '⌨️', action: () => toggleSFX() },
    { id: 'wasm-run', label: 'Run Active Rust Code in WebAssembly', category: 'Navigation', icon: '🦀', action: () => document.getElementById('run-wasm-btn')?.click() },
    { id: 'nav-cockpit', label: 'Open The Cockpit & Neovim', category: 'Navigation', icon: '🪟', action: () => document.getElementById('cockpit')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'nav-projects', label: 'Explore Plugins & Projects', category: 'Navigation', icon: '📦', action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'nav-themes', label: 'Pick a Theme (22 Palettes)', category: 'Navigation', icon: '🎨', action: () => document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'nav-blog', label: 'Read Technical Dispatches', category: 'Navigation', icon: '📰', action: () => { window.location.href = '/blog/'; } },
    { id: 'nav-about', label: 'View Omarchy Manual & Philosophy', category: 'Navigation', icon: '📖', action: () => { window.location.href = '/about/'; } },
    { id: 'nav-resume', label: 'View Driver Resume / CV', category: 'Navigation', icon: '📄', action: () => { window.location.href = '/resume/'; } },
    { id: 'nav-contact', label: 'Get in Touch / Contact', category: 'Navigation', icon: '✉️', action: () => { window.location.href = '/contact/'; } },

    // Music
    { id: 'music-toggle', label: 'Toggle Background Music (Kevin Koontz)', category: 'Media', icon: '🎵', action: () => toggleMusic() },
    { id: 'music-play', label: 'Play Omarchy Soundtrack', category: 'Media', icon: '▶️', action: () => playMusic() },
    { id: 'music-pause', label: 'Pause Omarchy Soundtrack', category: 'Media', icon: '⏸️', action: () => pauseMusic() },

    // Themes
    { id: 'theme-tokyo', label: 'Theme: Tokyo Night (Default)', category: 'Theme', icon: '🌙', action: () => setTheme('tokyo-night', true) },
    { id: 'theme-catppuccin', label: 'Theme: Catppuccin', category: 'Theme', icon: '☕', action: () => setTheme('catppuccin', true) },
    { id: 'theme-gruvbox', label: 'Theme: Gruvbox', category: 'Theme', icon: '🪵', action: () => setTheme('gruvbox', true) },
    { id: 'theme-everforest', label: 'Theme: Everforest', category: 'Theme', icon: '🌲', action: () => setTheme('everforest', true) },
    { id: 'theme-nord', label: 'Theme: Nord', category: 'Theme', icon: '❄️', action: () => setTheme('nord', true) },
    { id: 'theme-rosepine', label: 'Theme: Rosé Pine', category: 'Theme', icon: '🌸', action: () => setTheme('rose-pine', true) },
    { id: 'theme-hackerman', label: 'Theme: Hackerman (Matrix)', category: 'Theme', icon: '🟢', action: () => setTheme('hackerman', true) },
    { id: 'theme-kanagawa', label: 'Theme: Kanagawa', category: 'Theme', icon: '🌊', action: () => setTheme('kanagawa', true) },
    { id: 'theme-matteblack', label: 'Theme: Matte Black', category: 'Theme', icon: '⬛', action: () => setTheme('matte-black', true) },
    { id: 'theme-solitude', label: 'Theme: Solitude', category: 'Theme', icon: '🌌', action: () => setTheme('solitude', true) },
    { id: 'theme-lumon', label: 'Theme: Lumon', category: 'Theme', icon: '💡', action: () => setTheme('lumon', true) },
    { id: 'theme-retro82', label: 'Theme: Retro 82', category: 'Theme', icon: '📟', action: () => setTheme('retro-82', true) },

    // System / External
    { id: 'ext-gh', label: 'GitHub Profile (@itsvrushabh)', category: 'External', icon: '🐙', action: () => window.open('https://github.com/itsvrushabh', '_blank') },
    { id: 'ext-dotfiles', label: 'Clone Dotfiles (nvim & Omarchy)', category: 'External', icon: '⚙️', action: () => window.open('https://github.com/itsvrushabh/nvim', '_blank') }
  ];

  let selectedPaletteIndex = 0;
  let filteredPaletteCommands = [...PALETTE_COMMANDS];

  function openCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('palette-input');
    if (!modal || !input) return;

    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    input.value = '';
    filterPalette('');
    setTimeout(() => input.focus(), 50);
  }

  function closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) {
      modal.classList.remove('visible');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function filterPalette(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      filteredPaletteCommands = [...PALETTE_COMMANDS];
    } else {
      filteredPaletteCommands = PALETTE_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q)
      );
    }
    selectedPaletteIndex = 0;
    renderPaletteResults();
  }

  function renderPaletteResults() {
    const container = document.getElementById('palette-results');
    if (!container) return;

    container.innerHTML = '';
    if (filteredPaletteCommands.length === 0) {
      container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">No commands or pages matching query</div>`;
      return;
    }

    let lastCategory = '';
    filteredPaletteCommands.forEach((cmd, idx) => {
      if (cmd.category !== lastCategory) {
        lastCategory = cmd.category;
        const catEl = document.createElement('div');
        catEl.className = 'palette-category-label';
        catEl.textContent = cmd.category;
        container.appendChild(catEl);
      }

      const itemEl = document.createElement('div');
      itemEl.className = `palette-item ${idx === selectedPaletteIndex ? 'selected' : ''}`;
      itemEl.innerHTML = `
        <div class="palette-item-left">
          <span class="palette-item-icon">${cmd.icon}</span>
          <span>${cmd.label}</span>
        </div>
        <span class="palette-badge">${cmd.category}</span>
      `;

      itemEl.addEventListener('click', () => {
        closeCommandPalette();
        cmd.action();
      });

      itemEl.addEventListener('mouseenter', () => {
        selectedPaletteIndex = idx;
        updateSelectedPaletteItem();
      });

      container.appendChild(itemEl);
    });

    scrollSelectedIntoView();
  }

  function updateSelectedPaletteItem() {
    const items = document.querySelectorAll('#palette-results .palette-item');
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedPaletteIndex);
    });
  }

  function scrollSelectedIntoView() {
    const selected = document.querySelector('#palette-results .palette-item.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }

  function initCommandPalette() {
    const input = document.getElementById('palette-input');
    const openBtn = document.getElementById('open-palette-btn');

    if (openBtn) {
      openBtn.addEventListener('click', openCommandPalette);
    }

    document.querySelectorAll('[data-close-palette]').forEach(el => {
      el.addEventListener('click', closeCommandPalette);
    });

    if (input) {
      input.addEventListener('input', e => {
        filterPalette(e.target.value);
      });

      input.addEventListener('keydown', e => {
        playKeyClick();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (filteredPaletteCommands.length > 0) {
            selectedPaletteIndex = (selectedPaletteIndex + 1) % filteredPaletteCommands.length;
            updateSelectedPaletteItem();
            scrollSelectedIntoView();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (filteredPaletteCommands.length > 0) {
            selectedPaletteIndex = (selectedPaletteIndex - 1 + filteredPaletteCommands.length) % filteredPaletteCommands.length;
            updateSelectedPaletteItem();
            scrollSelectedIntoView();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const targetCmd = filteredPaletteCommands[selectedPaletteIndex];
          if (targetCmd) {
            closeCommandPalette();
            targetCmd.action();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeCommandPalette();
        }
      });
    }
  }

  // =========================================================================
  // 7. INTERACTIVE NEOVIM PLAYGROUND ENGINE
  // =========================================================================
  function initNeovimPlayground() {
    const tabMeta = {
      rust: { file: 'src/runtime/main.rs', type: 'rust' },
      fsm: { file: 'src/fsm/state_machine.rs', type: 'rust' },
      python: { file: 'src/fsm/state_machine.rs', type: 'rust' },
      hyprland: { file: '~/.config/hypr/hyprland.conf', type: 'hyprlang' },
      starship: { file: '~/.config/starship.toml', type: 'toml' }
    };

    const tabs = document.querySelectorAll('.neovim-tab');
    const statusFile = document.getElementById('nvim-status-file');
    const statusType = document.getElementById('nvim-status-type');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.nvimTab;
        if (!target) return;

        // Toggle active tabs
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Toggle active buffer
        document.querySelectorAll('.neovim-buffer-content').forEach(buf => {
          buf.style.display = 'none';
          buf.classList.remove('active');
        });
        const activeBuf = document.getElementById(`nvim-buf-${target}`);
        if (activeBuf) {
          activeBuf.style.display = 'block';
          activeBuf.classList.add('active');
        }

        // Update Lualine status bar
        if (tabMeta[target]) {
          if (statusFile) statusFile.textContent = tabMeta[target].file;
          if (statusType) statusType.textContent = tabMeta[target].type;
        }
      });
    });

    // Copy active buffer button
    const copyBtn = document.getElementById('copy-nvim-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const activeBuf = document.querySelector('.neovim-buffer-content.active');
        if (activeBuf) {
          const text = activeBuf.innerText.replace(/^[0-9 ]{1,4}/gm, ''); // Strip line numbers
          navigator.clipboard.writeText(text).then(() => {
            showToastNotice('Copied buffer code to clipboard!');
            const copyText = copyBtn.querySelector('.copy-text');
            if (copyText) {
              const original = copyText.textContent;
              copyText.textContent = 'Copied!';
              setTimeout(() => { copyText.textContent = original; }, 2000);
            }
          });
        }
      });
    }
  }

  // =========================================================================
  // 8. LIVE GITHUB STATS ENGINE
  // =========================================================================
  function initGitHubStats() {
    const CACHE_KEY = 'omarchy_gh_stats_cache';
    const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

    function updateRepoCards(repos) {
      document.querySelectorAll('[data-gh-repo]').forEach(badge => {
        const repoName = badge.dataset.ghRepo;
        const starEl = badge.querySelector('.gh-star-count');
        if (!starEl) return;

        const repoData = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase());
        if (repoData) {
          const stars = repoData.stargazers_count;
          const updated = new Date(repoData.pushed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          starEl.innerHTML = `★ ${stars} &middot; ${updated}`;
        }
      });
    }

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY && parsed.data) {
          updateRepoCards(parsed.data);
          return;
        }
      }
    } catch (e) {
      // Ignore cache parse error
    }

    fetch('https://api.github.com/users/itsvrushabh/repos?sort=pushed&per_page=12')
      .then(res => {
        if (!res.ok) throw new Error('GitHub API response not ok');
        return res.json();
      })
      .then(repos => {
        if (Array.isArray(repos)) {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: repos }));
          updateRepoCards(repos);
        }
      })
      .catch(err => {
        console.warn('Live GitHub stats fallback:', err);
      });
  }

  // =========================================================================
  
  // =========================================================================
  // 10. SYNTHESIZED MECHANICAL AUDIO & SFX ENGINE (Web Audio API)
  // =========================================================================
  let sfxAudioCtx = null;
  let sfxEnabled = localStorage.getItem('omarchy_sfx_enabled') !== 'false';

  function initSFX() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !sfxAudioCtx) {
        sfxAudioCtx = new AudioCtx();
      }
      if (sfxAudioCtx && sfxAudioCtx.state === 'suspended') {
        sfxAudioCtx.resume();
      }
    } catch (e) {
      console.warn('Web Audio SFX not available:', e);
    }
  }

  function toggleSFX() {
    sfxEnabled = !sfxEnabled;
    localStorage.setItem('omarchy_sfx_enabled', sfxEnabled);
    updateSFXButton();
    showToastNotice(sfxEnabled ? 'Mechanical Audio Feedback: ENABLED' : 'Mechanical Audio Feedback: MUTED');
    if (sfxEnabled) {
      playKeyClick();
    }
  }

  function updateSFXButton() {
    const btn = document.getElementById('sfx-toggle-btn');
    if (btn) {
      btn.classList.toggle('active', sfxEnabled);
      btn.style.opacity = sfxEnabled ? '1' : '0.4';
      btn.title = sfxEnabled ? 'Mechanical Typing Audio: ON (Press S)' : 'Mechanical Typing Audio: OFF (Press S)';
    }
  }

  function playKeyClick() {
    if (!sfxEnabled) return;
    initSFX();
    if (!sfxAudioCtx) return;

    try {
      const t = sfxAudioCtx.currentTime;
      const osc = sfxAudioCtx.createOscillator();
      const gain = sfxAudioCtx.createGain();
      const filter = sfxAudioCtx.createBiquadFilter();

      filter.type = 'highpass';
      filter.frequency.value = 1400 + Math.random() * 500;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.03);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(sfxAudioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch (e) {}
  }

  function playWindowSnap() {
    if (!sfxEnabled) return;
    initSFX();
    if (!sfxAudioCtx) return;

    try {
      const t = sfxAudioCtx.currentTime;
      const osc = sfxAudioCtx.createOscillator();
      const gain = sfxAudioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

      osc.connect(gain);
      gain.connect(sfxAudioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {}
  }

  function playThemeChime() {
    if (!sfxEnabled) return;
    initSFX();
    if (!sfxAudioCtx) return;

    try {
      const t = sfxAudioCtx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = sfxAudioCtx.createOscillator();
        const gain = sfxAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.035);
        gain.gain.setValueAtTime(0.04, t + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.035 + 0.12);
        osc.connect(gain);
        gain.connect(sfxAudioCtx.destination);
        osc.start(t + idx * 0.035);
        osc.stop(t + idx * 0.035 + 0.12);
      });
    } catch (e) {}
  }

  // =========================================================================
  // 11. IN-BROWSER WASM TOKIO RUNTIME SIMULATOR
  // =========================================================================
  function initWasmPlayground() {
    const runBtn = document.getElementById('run-wasm-btn');
    const consolePane = document.getElementById('nvim-wasm-console');
    const consoleOutput = document.getElementById('wasm-console-output');
    const closeBtn = document.getElementById('close-wasm-console-btn');
    const clearBtn = document.getElementById('clear-wasm-console-btn');

    if (!runBtn || !consolePane || !consoleOutput) return;

    closeBtn?.addEventListener('click', () => {
      consolePane.style.display = 'none';
      playWindowSnap();
    });

    clearBtn?.addEventListener('click', () => {
      consoleOutput.innerHTML = '';
      playKeyClick();
    });

    runBtn.addEventListener('click', () => {
      if (runBtn.classList.contains('running')) return;
      runBtn.classList.add('running');
      runBtn.querySelector('.run-text').textContent = 'Compiling...';
      consolePane.style.display = 'flex';
      consoleOutput.innerHTML = '<div class="wasm-line-dim">[WASM COMPILER] Compiling Rust crate with target wasm32-unknown-unknown...</div>';

      const activeTab = document.querySelector('.neovim-tab.active')?.dataset.nvimTab || 'rust';
      
      setTimeout(() => {
        playWindowSnap();
        runBtn.querySelector('.run-text').textContent = 'Running...';
        
        let logs = [];
        if (activeTab === 'fsm') {
          logs = [
            '<span class="wasm-line-ok">[WASM TOKIO RUNTIME]</span> Initializing AsyncStateMachine::<OrderState, OrderEvent>...',
            '<span class="log-time">[T+0.00ms]</span> Initial state: <code>OrderState::Created { order_id: "ord_8821", cents: 9500 }</code>',
            '<span class="log-time">[T+0.02ms]</span> Validating state guards: No self-cycles detected.',
            '<span class="log-time">[T+0.04ms]</span> Transitioning via <code>OrderEvent::PaymentAuthorized { tx_id: "tx_9128" }</code>',
            '<span class="log-time">[T+0.07ms]</span> State updated: <code>OrderState::Processing</code>',
            '<span class="log-time">[T+0.09ms]</span> Broadcast event emitted over <code>broadcast::channel(1024)</code> (0 bytes heap allocated)',
            '<span class="log-time">[T+0.12ms]</span> Transitioning via <code>OrderEvent::Dispatched { carrier: "DHL_EXPRESS" }</code>',
            '<span class="log-time">[T+0.14ms]</span> Final state: <code>OrderState::Completed</code> (Total Latency: 140μs)',
            '<span class="wasm-line-ok">✓ All transitions verified deterministic. Memory leak check: 0 bytes.</span>'
          ];
        } else if (activeTab === 'rust') {
          logs = [
            '<span class="wasm-line-ok">[WASM TOKIO RUNTIME]</span> Binding TcpListener on 127.0.0.1:8080 (multi-thread scheduler)...',
            '<span class="log-time">[T+0.00ms]</span> Worker thread pool spawned: 8 hardware threads active.',
            '<span class="log-time">[T+0.03ms]</span> Incoming simulated TCP client from 192.168.1.42:51294',
            '<span class="log-time">[T+0.05ms]</span> Read 4096 bytes stream chunk into zero-copy stack buffer.',
            '<span class="log-time">[T+0.08ms]</span> Echo packet transmitted via <code>write_all(&buffer[..n])</code>',
            '<span class="log-time">[T+0.11ms]</span> Connection closed cleanly. Round-trip p99 latency: <strong>82μs</strong>.',
            '<span class="wasm-line-ok">✓ Stream dispatcher idle. Zero heap allocations on hot path.</span>'
          ];
        } else {
          logs = [
            '<span class="wasm-line-ok">[WASM WORKSTATION]</span> Validating configuration syntax...',
            '<span class="log-time">[T+0.00ms]</span> Parsing Wayland compositor layout rules and bindings.',
            '<span class="log-time">[T+0.02ms]</span> Verified: 1 monitor layout, 12 workspaces, 0 syntax warnings.',
            '<span class="wasm-line-ok">✓ Configuration validated. Hot-reload ready via Hyprland IPC socket.</span>'
          ];
        }

        let idx = 0;
        const interval = setInterval(() => {
          if (idx < logs.length) {
            const div = document.createElement('div');
            div.innerHTML = logs[idx];
            consoleOutput.appendChild(div);
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
            playKeyClick();
            idx++;
          } else {
            clearInterval(interval);
            runBtn.classList.remove('running');
            runBtn.querySelector('.run-text').textContent = 'Run in Wasm';
            playThemeChime();
          }
        }, 110);
      }, 350);
    });
  }

  // =========================================================================
  // 12. DISTRIBUTED ARCHITECTURE PACKET EXPLORER ENGINE
  // =========================================================================
  function initArchitectureExplorer() {
    const stepBtn = document.getElementById('arch-step-btn');
    const chaosBtn = document.getElementById('arch-chaos-btn');
    const autoplayBtn = document.getElementById('arch-autoplay-btn');
    const resetBtn = document.getElementById('arch-reset-btn');
    const consoleBody = document.getElementById('arch-console-body');
    const stepNumEl = document.getElementById('arch-step-num');
    const chaosIndicator = document.getElementById('arch-chaos-indicator');

    if (!stepBtn || !consoleBody) return;

    let currentStep = 1;
    let isPartitionActive = false;
    let autoplayInterval = null;

    const stages = [
      {
        node: 'node-1',
        tag: '<span class="log-tag tag-api">[AXUM-API]</span>',
        msg: 'POST /orders/checkout received with idempotency key <code>req_98bf1</code>. Client connection assigned to Tokio worker thread #2.',
        status: 'Active'
      },
      {
        node: 'node-2',
        conn: 'conn-1',
        tag: '<span class="log-tag tag-db">[POSTGRES-ACID]</span>',
        msg: 'Atomic transaction: <code>INSERT INTO orders</code> and <code>INSERT INTO outbox_events</code> committed in single ACID block. Dual-write prevented.',
        status: 'Committed'
      },
      {
        node: 'node-3',
        conn: 'conn-2',
        tag: '<span class="log-tag tag-relay">[CDC-RELAY]</span>',
        msg: 'Tokio high-frequency CDC poller reads unprocessed outbox record #9124. Preparing binary AMQP frame.',
        status: 'Polling'
      },
      {
        node: 'node-4',
        conn: 'conn-3',
        tag: '<span class="log-tag tag-rmq">[RABBITMQ]</span>',
        msg: 'Durable exchange <code>orders.events</code> routed message to queue <code>inventory.sync</code>. Publisher ACK returned to CDC relay.',
        status: 'Published'
      },
      {
        node: 'node-5',
        conn: 'conn-4',
        tag: '<span class="log-tag tag-redis">[IDEMPOTENT-CONSUMER]</span>',
        msg: 'Consumer executed atomic <code>SET processed:event:9124 1 EX 86400 NX</code> in Redis. Lock acquired -> Domain logic executed -> Queue message ACKed.',
        status: 'Complete'
      }
    ];

    function renderStage(step) {
      currentStep = step;
      if (stepNumEl) stepNumEl.textContent = step;

      // Update nodes
      for (let i = 1; i <= 5; i++) {
        const node = document.getElementById(`node-${i}`);
        const conn = document.getElementById(`conn-${i - 1}`);
        const badge = node?.querySelector('.node-status-badge');

        if (i < step) {
          node?.classList.remove('active');
          if (badge) badge.textContent = 'Processed';
          conn?.classList.add('active');
        } else if (i === step) {
          node?.classList.add('active');
          if (badge) badge.textContent = stages[step - 1].status;
          conn?.classList.remove('active');
        } else {
          node?.classList.remove('active');
          if (badge) badge.textContent = 'Idle';
          conn?.classList.remove('active');
        }
      }

      // Check partition
      if (isPartitionActive && step === 3) {
        const conn3 = document.getElementById('conn-3');
        const node4 = document.getElementById('node-4');
        conn3?.classList.add('blocked');
        node4?.classList.add('partitioned');
        const log = document.createElement('div');
        log.className = 'arch-log-entry';
        log.innerHTML = `<span class="log-time">[CHAOS-ALERT]</span> <span class="log-tag tag-chaos">[NETWORK-PARTITION]</span> <span>Broker unreachable! CDC Relay halts transmission without losing outbox records. Automatic exponential retry engaged.</span>`;
        consoleBody.appendChild(log);
        consoleBody.scrollTop = consoleBody.scrollHeight;
        return;
      }

      // Append log entry
      const stage = stages[step - 1];
      const log = document.createElement('div');
      log.className = 'arch-log-entry active';
      log.innerHTML = `<span class="log-time">[T+${((step - 1) * 0.45).toFixed(2)}ms]</span> ${stage.tag} <span class="log-msg">${stage.msg}</span>`;
      consoleBody.appendChild(log);
      consoleBody.scrollTop = consoleBody.scrollHeight;

      playKeyClick();
    }

    stepBtn.addEventListener('click', () => {
      if (currentStep < 5) {
        renderStage(currentStep + 1);
      } else {
        renderStage(1);
      }
    });

    chaosBtn?.addEventListener('click', () => {
      isPartitionActive = !isPartitionActive;
      if (chaosIndicator) chaosIndicator.style.display = isPartitionActive ? 'inline-block' : 'none';
      chaosBtn.classList.toggle('active', isPartitionActive);
      showToastNotice(isPartitionActive ? 'Network Partition Simulated: RabbitMQ broker blocked!' : 'Network Partition Resolved: Broker healthy.');
      playWindowSnap();
    });

    autoplayBtn?.addEventListener('click', () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
        autoplayBtn.querySelector('span').textContent = '▶ Auto-Simulate';
      } else {
        autoplayBtn.querySelector('span').textContent = '⏸ Pause';
        autoplayInterval = setInterval(() => {
          if (currentStep < 5) {
            renderStage(currentStep + 1);
          } else {
            renderStage(1);
          }
        }, 1400);
      }
    });

    resetBtn?.addEventListener('click', () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
        autoplayBtn.querySelector('span').textContent = '▶ Auto-Simulate';
      }
      isPartitionActive = false;
      if (chaosIndicator) chaosIndicator.style.display = 'none';
      chaosBtn?.classList.remove('active');
      consoleBody.innerHTML = '';
      renderStage(1);
      playThemeChime();
    });
  }

  // =========================================================================
  // 13. HERO SNIPPET SWITCHER ENGINE
  // =========================================================================
  function initSnippetSwitcher() {
    const tabs = document.querySelectorAll('.snippet-tab-btn');
    const copyBtn = document.getElementById('copy-install-btn');
    const label = document.getElementById('hero-snippet-label');
    if (!copyBtn || !label) return;

    const snippets = {
      cargo: 'cargo install --git https://github.com/itsvrushabh/itsvrushabh.github.io',
      curl: 'curl -sL https://itsvrushabh.github.io/omarchy.sh | sh'
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.snippetMode;
        if (!mode || !snippets[mode]) return;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        copyBtn.dataset.snippet = snippets[mode];
        label.textContent = snippets[mode];
        playWindowSnap();
      });
    });
  }

  // =========================================================================
  // 14. INITIALIZATION
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    setTheme(currentTheme, false);
    initBackgroundCanvas();
    initTUI();
    initShortcuts();
    initMusicPlayer();
    initCommandPalette();
    initNeovimPlayground();
    initGitHubStats();
    updateSFXButton();
    document.getElementById('sfx-toggle-btn')?.addEventListener('click', toggleSFX);
    initWasmPlayground();
    initArchitectureExplorer();
    initSnippetSwitcher();
  });
})();
