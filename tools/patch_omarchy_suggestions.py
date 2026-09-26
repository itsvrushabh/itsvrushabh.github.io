import re

js_path = '/home/cachyos/Work/itsvrushabh.github.io/assets/js/omarchy.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update Command Palette with new actions
palette_extra = """    { id: 'nav-arch', label: 'Distributed Systems Architecture Explorer', category: 'Navigation', icon: '🏗️', action: () => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'sfx-toggle', label: 'Toggle Mechanical Audio SFX (Press S)', category: 'Media', icon: '⌨️', action: () => toggleSFX() },
    { id: 'wasm-run', label: 'Run Active Rust Code in WebAssembly', category: 'Navigation', icon: '🦀', action: () => document.getElementById('run-wasm-btn')?.click() },"""

js = js.replace("{ id: 'nav-cockpit', label: 'Open The Cockpit & Neovim'", palette_extra + "\n    { id: 'nav-cockpit', label: 'Open The Cockpit & Neovim'")

# 2. Add S key shortcut in shortcuts listener
old_keys = """      // Toggle Music with 'M' or 'm'"""
new_keys = """      // Toggle Mechanical SFX with 'S' or 's'
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        toggleSFX();
        return;
      }

      // Toggle Music with 'M' or 'm'"""

js = js.replace(old_keys, new_keys, 1)

# 3. Add playKeyClick to TUI input
old_tui_keydown = """      input.addEventListener('keydown', (e) => {"""
new_tui_keydown = """      input.addEventListener('keydown', (e) => {
        playKeyClick();"""

js = js.replace(old_tui_keydown, new_tui_keydown, 1)

# 4. Add playKeyClick to Palette input
old_palette_keydown = """      input.addEventListener('keydown', e => {"""
new_palette_keydown = """      input.addEventListener('keydown', e => {
        playKeyClick();"""

js = js.replace(old_palette_keydown, new_palette_keydown, 1)

# 5. Add playThemeChime in setTheme
old_set_theme = """    // Persist selection
    localStorage.setItem(THEME_KEY, themeName);"""
new_set_theme = """    // Persist selection
    localStorage.setItem(THEME_KEY, themeName);
    if (showToast) {
      playThemeChime();
    }"""

js = js.replace(old_set_theme, new_set_theme, 1)

# 6. Add the new feature engines before // 9. INITIALIZATION
new_engines = '''
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
'''

js = js.replace('// 9. INITIALIZATION', new_engines + '\n  // =========================================================================\n  // 14. INITIALIZATION')

# 7. Add function calls in DOMContentLoaded
old_init = """initCommandPalette();
    initNeovimPlayground();
    initGitHubStats();"""

new_init = """initCommandPalette();
    initNeovimPlayground();
    initGitHubStats();
    updateSFXButton();
    document.getElementById('sfx-toggle-btn')?.addEventListener('click', toggleSFX);
    initWasmPlayground();
    initArchitectureExplorer();
    initSnippetSwitcher();"""

js = js.replace(old_init, new_init, 1)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("omarchy.js patched successfully with all 5 suggestions!")
