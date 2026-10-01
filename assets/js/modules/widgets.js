/**
 * OMARCHY INTERACTIVE WIDGETS & PLAYGROUNDS MODULE
 * Handles:
 * 1. Interactive Neovim playground & buffer switcher
 * 2. In-browser WASM Tokio runtime simulator
 * 3. Distributed architecture packet flow & chaos partition explorer
 * 4. Hero quick-snippet tab switcher
 * 5. Rust zero-copy memory profiler
 * 6. Raft consensus & broadcast channel gossip mesh
 * 7. Wayland Hyprland compositor shader sandbox (Kawase blur, CRT, Bloom, Matte)
 */

import { showToastNotice } from './theme.js';
import { playKeyClick, playWindowSnap, playThemeChime } from './sfx.js';

// =========================================================================
// 1. INTERACTIVE NEOVIM PLAYGROUND ENGINE
// =========================================================================
export function initNeovimPlayground() {
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
// 2. IN-BROWSER WASM TOKIO RUNTIME SIMULATOR
// =========================================================================
export function initWasmPlayground() {
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
// 3. DISTRIBUTED ARCHITECTURE PACKET EXPLORER ENGINE
// =========================================================================
export function initArchitectureExplorer() {
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
// 4. HERO SNIPPET SWITCHER ENGINE
// =========================================================================
export function initSnippetSwitcher() {
  const tabs = document.querySelectorAll('.snippet-tab-btn');
  const copyBtn = document.getElementById('copy-install-btn');
  const label = document.getElementById('hero-snippet-label');
  if (!copyBtn || !label) return;

  const snippets = {
    cargo: 'cargo install --git https://github.com/itsvrushabh/itsvrushabh.github.io',
    curl: 'curl -sL https://itsvrushabh.github.io/omarchy.sh | sh',
    cli: 'curl -sL https://itsvrushabh.github.io/cli'
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
// 5. RUST ZERO-COPY MEMORY PROFILER ENGINE
// =========================================================================
export function initMemoryProfiler() {
  const btnZeroCopy = document.getElementById('prof-btn-zerocopy');
  const btnHeap = document.getElementById('prof-btn-heap');
  const codeTitle = document.getElementById('prof-code-title');
  const codeDisplay = document.getElementById('prof-code-display');
  const metricHeap = document.getElementById('prof-metric-heap');
  const metricHeapSub = document.getElementById('prof-metric-heap-sub');
  const metricCache = document.getElementById('prof-metric-cache');
  const metricLatency = document.getElementById('prof-metric-latency');
  const metricCycles = document.getElementById('prof-metric-cycles');
  const statusBadge = document.getElementById('prof-status-badge');
  const stackSlots = document.getElementById('prof-stack-slots');
  const interconnectLabel = document.getElementById('prof-interconnect-label');
  const heapSlots = document.getElementById('prof-heap-slots');
  const runBenchBtn = document.getElementById('prof-run-bench-btn');

  if (!btnZeroCopy || !btnHeap || !codeTitle) return;

  function setProfilerMode(mode) {
    const isZero = mode === 'zerocopy';
    btnZeroCopy.classList.toggle('active', isZero);
    btnHeap.classList.toggle('active', !isZero);

    if (isZero) {
      codeTitle.textContent = 'ZERO-COPY PATH // STACK-BOUND SLICE (src/parser/zero_copy.rs)';
      codeDisplay.textContent = `// Zero-copy stream ingestion without heap allocation\npub fn parse_packet<'a>(buf: &'a [u8]) -> Result<PacketHeader<'a>, ParseError> {\n    let magic = &buf[0..4];\n    let payload = &buf[4..]; // Borrows directly from stack/ring-buffer\n    Ok(PacketHeader { magic, payload }) // 0 bytes allocated on heap\n}`;
      metricHeap.textContent = '0 Bytes';
      metricHeap.className = 'metric-val text-brand';
      metricHeap.style.color = '';
      metricHeapSub.textContent = '0 malloc calls on critical path';
      metricCache.textContent = '0.04%';
      metricLatency.textContent = '28 μs';
      metricLatency.className = 'metric-val text-brand';
      metricLatency.style.color = '';
      metricCycles.textContent = '420 cycles';
      statusBadge.textContent = 'ZERO ALLOCATION ACTIVE';
      statusBadge.style.backgroundColor = 'color-mix(in srgb, var(--brand) 15%, transparent)';
      statusBadge.style.color = 'var(--brand)';
      stackSlots.innerHTML = `
        <div class="mem-slot active-slot"><span class="slot-addr">0x7ffd84a0</span><span class="slot-content">ptr: &amp;buf[0..4] (0x7ffd8480)</span></div>
        <div class="mem-slot active-slot"><span class="slot-addr">0x7ffd84a8</span><span class="slot-content">len: 4096 (usize)</span></div>
        <div class="mem-slot active-slot"><span class="slot-addr">0x7ffd84b0</span><span class="slot-content">cap: inline stack buffer</span></div>`;
      interconnectLabel.textContent = 'Zero-copy pass-through: No heap traversal';
      heapSlots.innerHTML = `<div class="mem-slot slot-idle"><span class="slot-addr">0x55d1a000</span><span class="slot-content">[UNALLOCATED // ZERO HEAP CHURN]</span></div>`;
    } else {
      codeTitle.textContent = 'NAIVE HEAP ALLOCATION PATH (src/parser/naive_heap.rs)';
      codeDisplay.textContent = `// Naive heap string duplication\npub fn parse_packet(buf: &[u8]) -> Result<OwnedPacket, ParseError> {\n    let magic = String::from_utf8(buf[0..4].to_vec())?; // Heap alloc #1\n    let mut payload = Vec::with_capacity(buf.len() - 4);  // Heap alloc #2\n    payload.extend_from_slice(&buf[4..]); // Dynamic heap copy\n    Ok(OwnedPacket { magic, payload })\n}`;
      metricHeap.textContent = '4.19 MB';
      metricHeap.className = 'metric-val';
      metricHeap.style.color = '#f59e0b';
      metricHeapSub.textContent = '12,400 malloc / free cycles';
      metricCache.textContent = '26.8%';
      metricLatency.textContent = '3.84 ms';
      metricLatency.className = 'metric-val';
      metricLatency.style.color = '#ef4444';
      metricCycles.textContent = '17,200 cycles';
      statusBadge.textContent = 'HEAP CHURN DETECTED';
      statusBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
      statusBadge.style.color = '#ef4444';
      stackSlots.innerHTML = `
        <div class="mem-slot"><span class="slot-addr">0x7ffd84a0</span><span class="slot-content">ptr: Heap Chunk (0x55d1a100)</span></div>
        <div class="mem-slot"><span class="slot-addr">0x7ffd84a8</span><span class="slot-content">ptr: Heap Payload (0x55d1c240)</span></div>`;
      interconnectLabel.textContent = '⚠️ Memory Bus Traversal: DRAM Cache Line Invalidation';
      heapSlots.innerHTML = `
        <div class="mem-slot slot-heap-alloc"><span class="slot-addr">0x55d1a100</span><span class="slot-content">malloc(4B): "POST" [Chunk 1]</span></div>
        <div class="mem-slot slot-heap-alloc"><span class="slot-addr">0x55d1c240</span><span class="slot-content">malloc(4092B): Payload Buffer [Chunk 2]</span></div>
        <div class="mem-slot slot-heap-alloc"><span class="slot-addr">0x55d1f880</span><span class="slot-content">malloc(128B): Vector Capacity Realloc</span></div>`;
    }
    playWindowSnap();
  }

  btnZeroCopy.addEventListener('click', () => setProfilerMode('zerocopy'));
  btnHeap.addEventListener('click', () => setProfilerMode('heap'));

  runBenchBtn?.addEventListener('click', () => {
    runBenchBtn.classList.add('running');
    runBenchBtn.querySelector('span').textContent = '⚡ Benchmarking...';
    let i = 0;
    const interval = setInterval(() => {
      playKeyClick();
      i++;
      if (i >= 4) {
        clearInterval(interval);
        runBenchBtn.classList.remove('running');
        runBenchBtn.querySelector('span').textContent = '⚡ Run Latency Benchmark';
        showToastNotice('Benchmark completed: Zero-copy yields 137x throughput improvement!');
        playThemeChime();
      }
    }, 150);
  });
}

// =========================================================================
// 6. DISTRIBUTED RAFT CONSENSUS & IN-BROWSER GOSSIP MESH ENGINE
// =========================================================================
export function initRaftMesh() {
  const termVal = document.getElementById('raft-term-val');
  const leaderVal = document.getElementById('raft-leader-val');
  const commitVal = document.getElementById('raft-commit-val');
  const tabsVal = document.getElementById('raft-tabs-val');
  const logBody = document.getElementById('raft-log-body');
  const replBtn = document.getElementById('raft-replicate-btn');
  const electBtn = document.getElementById('raft-election-btn');
  const killBtn = document.getElementById('raft-kill-leader-btn');

  if (!termVal || !logBody) return;

  let currentTerm = 4;
  let commitIndex = 128;
  let currentLeader = 1; // Node-Alpha
  let channel = null;

  const nodeNames = ['', 'Node-Alpha', 'Node-Beta', 'Node-Gamma', 'Node-Delta', 'Node-Epsilon'];

  try {
    if (window.BroadcastChannel) {
      channel = new BroadcastChannel('vrushabh_raft_cluster');
      channel.onmessage = (e) => {
        if (e.data && e.data.type === 'HEARTBEAT') {
          appendRaftLog(e.data.term, `Broadcast from peer tab: ${e.data.msg}`);
        }
      };
      if (tabsVal) tabsVal.textContent = 'Multi-Tab Active Mesh';
    }
  } catch (e) {}

  function appendRaftLog(term, msg) {
    const entry = document.createElement('div');
    entry.className = 'rlog-entry';
    entry.innerHTML = `<span class="rlog-term">[Term ${term}]</span> <span class="rlog-msg">${msg}</span>`;
    logBody.appendChild(entry);
    logBody.scrollTop = logBody.scrollHeight;
  }

  replBtn?.addEventListener('click', () => {
    commitIndex++;
    if (commitVal) commitVal.textContent = `Index ${commitIndex}`;
    appendRaftLog(currentTerm, `[LEADER ${nodeNames[currentLeader]}] Log Entry #${commitIndex} replicated across quorums (3/5 ACKs).`);
    
    for (let i = 1; i <= 5; i++) {
      const hb = document.querySelector(`#rnode-${i} .hb-fill`);
      if (hb) {
        hb.style.width = '100%';
        setTimeout(() => { hb.style.width = `${60 + Math.random() * 30}%`; }, 400);
      }
    }
    playKeyClick();
    if (channel) {
      channel.postMessage({ type: 'HEARTBEAT', term: currentTerm, msg: `Replicated Index #${commitIndex}` });
    }
  });

  electBtn?.addEventListener('click', () => {
    currentTerm++;
    if (termVal) termVal.textContent = `Term ${currentTerm}`;
    const candidateId = (currentLeader % 5) + 1;
    
    appendRaftLog(currentTerm, `Election timeout! ${nodeNames[candidateId]} converts to Candidate. RequestVote RPC broadcasted.`);
    
    setTimeout(() => {
      currentLeader = candidateId;
      if (leaderVal) leaderVal.textContent = nodeNames[candidateId];
      appendRaftLog(currentTerm, `Quorum achieved (4/5 votes). ${nodeNames[candidateId]} declared Cluster Leader for Term ${currentTerm}.`);
      
      for (let i = 1; i <= 5; i++) {
        const nodeBox = document.getElementById(`rnode-${i}`);
        const badge = nodeBox?.querySelector('.rnode-role-badge');
        if (i === currentLeader) {
          nodeBox?.classList.remove('node-follower', 'node-partitioned');
          nodeBox?.classList.add('node-leader');
          if (badge) badge.textContent = 'LEADER';
        } else {
          nodeBox?.classList.remove('node-leader', 'node-partitioned');
          nodeBox?.classList.add('node-follower');
          if (badge) badge.textContent = 'FOLLOWER';
        }
      }
      playThemeChime();
    }, 350);
  });

  killBtn?.addEventListener('click', () => {
    const oldLeader = currentLeader;
    const oldNodeBox = document.getElementById(`rnode-${oldLeader}`);
    oldNodeBox?.classList.add('node-partitioned');
    appendRaftLog(currentTerm, `Network Partition: ${nodeNames[oldLeader]} crashed / unreachable. Heartbeat missed.`);
    playWindowSnap();

    setTimeout(() => {
      electBtn?.click();
    }, 700);
  });
}

// =========================================================================
// 7. LIVE HYPRLAND COMPOSITOR SHADER SANDBOX ENGINE
// =========================================================================
export function initShaderSandbox() {
  const canvas = document.getElementById('hyprland-shader-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let activeShader = 'blur';
  let intensity = 0.75;
  let radius = 12;
  let aberration = 0.40;

  const glslSnippets = {
    blur: `// Kawase Dual Blur Fragment Shader (Hyprland Wayland)\nprecision mediump float;\nuniform sampler2D u_texture;\nuniform vec2 u_resolution;\nuniform float u_radius;\n\nvoid main() {\n    vec2 uv = gl_FragCoord.xy / u_resolution;\n    vec2 halfpixel = 0.5 / u_resolution;\n    vec4 sum = texture2D(u_texture, uv) * 4.0;\n    sum += texture2D(u_texture, uv - halfpixel * u_radius);\n    sum += texture2D(u_texture, uv + halfpixel * u_radius);\n    gl_FragColor = sum / 6.0;\n}`,
    crt: `// Retro CRT Phosphor Scanline & RGB Split (Hyprland Shader)\nprecision mediump float;\nuniform sampler2D u_texture;\nuniform vec2 u_resolution;\nuniform float u_aberration;\n\nvoid main() {\n    vec2 uv = gl_FragCoord.xy / u_resolution;\n    float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.15;\n    float r = texture2D(u_texture, uv + vec2(u_aberration * 0.005, 0.0)).r;\n    float g = texture2D(u_texture, uv).g;\n    float b = texture2D(u_texture, uv - vec2(u_aberration * 0.005, 0.0)).b;\n    gl_FragColor = vec4(r, g, b, 1.0) - scanline;\n}`,
    bloom: `// Ambient Cyber Bloom Kernel (Omarchy Compositor)\nprecision mediump float;\nuniform sampler2D u_texture;\nuniform vec2 u_resolution;\nuniform float u_intensity;\n\nvoid main() {\n    vec2 uv = gl_FragCoord.xy / u_resolution;\n    vec4 base = texture2D(u_texture, uv);\n    vec4 bloom = max(vec4(0.0), base - 0.6) * u_intensity * 2.0;\n    gl_FragColor = base + bloom;\n}`,
    matte: `// Matte Monochrome Film Grain & Vignette\nprecision mediump float;\nuniform vec2 u_resolution;\nuniform float u_intensity;\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main() {\n    vec2 uv = gl_FragCoord.xy / u_resolution;\n    float dist = distance(uv, vec2(0.5));\n    float vignette = smoothstep(0.8, 0.2, dist * u_intensity);\n    float noise = (rand(uv) - 0.5) * 0.08;\n    gl_FragColor = vec4(vec3(vignette + noise), 1.0);\n}`
  };

  document.querySelectorAll('.shader-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shader-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeShader = btn.dataset.shader;
      const titleEl = document.getElementById('shader-overlay-title');
      if (titleEl) titleEl.textContent = `wayland://hyprland.omarchy.${activeShader}`;
      const glslEl = document.getElementById('glsl-code-content');
      if (glslEl && glslSnippets[activeShader]) glslEl.textContent = glslSnippets[activeShader];
      playWindowSnap();
    });
  });

  const sliderIntensity = document.getElementById('slider-intensity');
  const sliderRadius = document.getElementById('slider-radius');
  const sliderAberration = document.getElementById('slider-aberration');

  sliderIntensity?.addEventListener('input', e => {
    intensity = e.target.value / 100;
    const v = document.getElementById('val-intensity');
    if (v) v.textContent = intensity.toFixed(2);
  });

  sliderRadius?.addEventListener('input', e => {
    radius = parseInt(e.target.value, 10);
    const v = document.getElementById('val-radius');
    if (v) v.textContent = `${radius}px`;
  });

  sliderAberration?.addEventListener('input', e => {
    aberration = e.target.value / 100;
    const v = document.getElementById('val-aberration');
    if (v) v.textContent = aberration.toFixed(2);
  });

  const toggleGlslBtn = document.getElementById('toggle-glsl-btn');
  const glslPane = document.getElementById('shader-glsl-pane');
  toggleGlslBtn?.addEventListener('click', () => {
    const isHidden = glslPane.style.display === 'none';
    glslPane.style.display = isHidden ? 'block' : 'none';
    toggleGlslBtn.querySelector('span').textContent = isHidden ? '✕ Hide GLSL' : '</> View GLSL Source';
    playKeyClick();
  });

  let sTime = 0;
  function renderShaderFrame() {
    sTime += 0.03;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw simulated terminal backdrop
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, w, h);

    // Draw syntax lines
    ctx.fillStyle = '#7aa2f7';
    ctx.fillRect(30, 60, 180, 10);
    ctx.fillStyle = '#9ece6a';
    ctx.fillRect(30, 85, 240, 10);
    ctx.fillStyle = '#bb9af7';
    ctx.fillRect(50, 110, 140, 8);
    ctx.fillStyle = '#e0af68';
    ctx.fillRect(50, 130, 200, 8);

    if (activeShader === 'blur') {
      // Kawase acrylic blur simulation
      ctx.fillStyle = 'rgba(122, 162, 247, 0.25)';
      for (let i = 0; i < 6; i++) {
        const bx = 100 + Math.sin(sTime + i) * 60;
        const by = 160 + Math.cos(sTime * 0.8 + i) * 40;
        ctx.beginPath();
        ctx.arc(bx, by, radius * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (activeShader === 'crt') {
      // Scanlines and RGB offset
      ctx.fillStyle = 'rgba(0, 255, 100, 0.15)';
      ctx.fillRect(28 - aberration * 6, 58, 180, 10);
      ctx.fillStyle = 'rgba(255, 0, 100, 0.15)';
      ctx.fillRect(32 + aberration * 6, 62, 180, 10);
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 1.5;
      for (let y = 0; y < h; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (activeShader === 'bloom') {
      // Cyber neon glow bloom
      ctx.shadowColor = '#9ece6a';
      ctx.shadowBlur = radius * 2.5 * intensity;
      ctx.fillStyle = '#9ece6a';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Matte vignette
      const grad = ctx.createRadialGradient(w/2, h/2, 40, w/2, h/2, Math.max(w,h) * 0.6 * intensity);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    requestAnimationFrame(renderShaderFrame);
  }

  renderShaderFrame();
}

/**
 * 8. Interactive Card Spotlight & 3D Tilt Engine
 */
export function initCardSpotlightAndTilt() {
  if (typeof window === 'undefined') return;

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const cards = document.querySelectorAll('.project-card, .post-card, .omarchy-quote-card');
  if (!cards.length) return;

  cards.forEach(card => {
    let bounds = null;

    card.addEventListener('pointerenter', () => {
      bounds = card.getBoundingClientRect();
    });

    card.addEventListener('pointermove', (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const px = Math.max(0, Math.min(100, (x / bounds.width) * 100));
      const py = Math.max(0, Math.min(100, (y / bounds.height) * 100));

      card.style.setProperty('--mouse-x', `${px.toFixed(1)}%`);
      card.style.setProperty('--mouse-y', `${py.toFixed(1)}%`);

      if (isFinePointer) {
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.setProperty('--tilt-rx', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-ry', `${rotateY.toFixed(2)}deg`);
      }
    });

    card.addEventListener('pointerleave', () => {
      bounds = null;
      card.style.setProperty('--tilt-rx', '0deg');
      card.style.setProperty('--tilt-ry', '0deg');
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });
}

/**
 * Convenience aggregator to initialize all widgets in one call
 */
export function initWidgets() {
  initNeovimPlayground();
  initWasmPlayground();
  initArchitectureExplorer();
  initSnippetSwitcher();
  initMemoryProfiler();
  initRaftMesh();
  initShaderSandbox();
  initCardSpotlightAndTilt();
}
