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
  // =========================================================================
  // 2. THEME-REACTIVE & MUSIC BEAT-SYNCHRONIZED CANVAS ANIMATION
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
    let mouse = { x: -1000, y: -1000 };

    // Dynamic Theme Color Palette
    let brandColor = '#9ece6a';
    let brandSoft = 'rgba(158, 206, 106, 0.15)';
    let borderColor = 'rgba(255, 255, 255, 0.08)';
    let borderStrong = 'rgba(255, 255, 255, 0.2)';
    let accentColor = '#9ece6a';
    let bgColor = '#1a1b26';

    // Theme family classifier: maps all 22 official themes to 6 visual families
    function getThemeFamily(t) {
      if (['hackerman', 'retro-82'].includes(t)) return 'matrix';
      if (['gruvbox', 'everforest', 'miasma', 'ristretto'].includes(t)) return 'contour';
      if (['matte-black', 'vantablack', 'solitude'].includes(t)) return 'sonar';
      if (['nord', 'catppuccin-latte', 'flexoki-light', 'white', 'lumon'].includes(t)) return 'frost';
      if (['kanagawa', 'osaka-jade'].includes(t)) return 'wave';
      return 'neon'; // tokyo-night, catppuccin, rose-pine, ethereal, last-horizon, lupine
    }

    let activeFamily = getThemeFamily(currentTheme);

    // Audio & Beat Tracking State
    let audioBoost = 0;      // 0.0 to 1.0 (Bass energy)
    let midBoost = 0;        // 0.0 to 1.0 (Mid-range frequencies)
    let trebleBoost = 0;     // 0.0 to 1.0 (High-frequency sparkle)
    let isKickBeat = false;   // Instantaneous kick drum hit
    let kickPulse = 0;       // Smoothly decaying beat impulse (1.0 -> 0.0)
    let bassHistory = [];    // Adaptive running average for kick detection
    let beatCooldown = 0;    // Debounce frames between kicks
    let shockwaves = [];     // Expanding radial shockwave rings
    let beatPhase = 0;       // Continuous beat progression accumulator
    let time = 0;

    // Family 1: Neon Synthwave Horizon Grid & Constellation
    let neonStars = [];
    // Family 2: Matrix Digital Rain & CRT Glitch
    let matrixColumns = [];
    const matrixChars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜλπΣΩ≠≈⚡';
    // Family 3: Topographic Contour Ridges
    const contourLevels = [0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88];
    // Family 4: Tactical Sonar / Radar Sweep
    let sonarAngle = 0;
    let sonarBlips = [];
    // Family 5: Arctic Aurora & Crystalline Frost Geometry
    let frostCrystals = [];
    // Family 6: Great Wave Oceanic Swells & Zen Spray
    let waveSpray = [];

    function updateColors() {
      const styles = getComputedStyle(document.documentElement);
      brandColor = styles.getPropertyValue('--t-brand').trim() || '#9ece6a';
      brandSoft = styles.getPropertyValue('--t-brand-soft').trim() || 'rgba(158, 206, 106, 0.15)';
      borderColor = styles.getPropertyValue('--t-border-subtle').trim() || 'rgba(255, 255, 255, 0.08)';
      borderStrong = styles.getPropertyValue('--t-border-strong').trim() || 'rgba(255, 255, 255, 0.2)';
      accentColor = styles.getPropertyValue('--t-field-lit').trim() || brandColor;
      bgColor = styles.getPropertyValue('--t-bg').trim() || '#1a1b26';
      activeFamily = getThemeFamily(currentTheme);
      initFamilyData();
    }

    function initFamilyData() {
      if (activeFamily === 'matrix') {
        const colWidth = 24;
        const colCount = Math.floor(width / colWidth);
        matrixColumns = [];
        for (let i = 0; i < colCount; i++) {
          matrixColumns.push({
            x: i * colWidth + 12,
            y: Math.random() * -height * 1.5,
            speed: Math.random() * 2.5 + 2.0,
            chars: Array.from({ length: Math.floor(Math.random() * 12 + 14) }, () =>
              matrixChars[Math.floor(Math.random() * matrixChars.length)]
            ),
            lastMutate: 0
          });
        }
      } else if (activeFamily === 'sonar') {
        sonarBlips = [];
        const count = 7;
        for (let i = 0; i < count; i++) {
          sonarBlips.push({
            dist: Math.random() * 0.42 + 0.08,
            angle: Math.random() * Math.PI * 2,
            size: Math.random() * 3 + 2.5,
            pingAlpha: 0,
            id: 'T-' + Math.floor(Math.random() * 900 + 100)
          });
        }
      } else if (activeFamily === 'frost') {
        frostCrystals = [];
        const count = Math.min(Math.floor((width * height) / 24000), 38);
        for (let i = 0; i < count; i++) {
          frostCrystals.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            size: Math.random() * 14 + 8,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.015,
            sides: Math.random() < 0.45 ? 6 : 4,
            baseAlpha: Math.random() * 0.35 + 0.2
          });
        }
      } else if (activeFamily === 'wave') {
        waveSpray = [];
        const count = 45;
        for (let i = 0; i < count; i++) {
          waveSpray.push({
            x: Math.random() * width,
            y: height * 0.75 + Math.random() * height * 0.25,
            vy: -Math.random() * 2 - 1,
            vx: (Math.random() - 0.5) * 1.5,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.6 + 0.2
          });
        }
      } else {
        // Neon Synthwave Stars (Family 1)
        neonStars = [];
        const count = Math.min(Math.floor((width * height) / 20000), 50);
        for (let i = 0; i < count; i++) {
          neonStars.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.6),
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 1.8 + 1,
            baseAlpha: Math.random() * 0.4 + 0.2,
            pulseSpeed: Math.random() * 0.03 + 0.01,
            pulsePhase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initFamilyData();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // =======================================================================
      // A. REAL-TIME MUSIC BEAT EXTRACTION & SYNCHRONIZATION
      // =======================================================================
      let hasRealAudio = false;
      isKickBeat = false;

      if (window.audioAnalyser && window.isAudioPlaying && window.audioFrequencyData) {
        window.audioAnalyser.getByteFrequencyData(window.audioFrequencyData);

        // Low Bass / Kick Bins (1 to 4: approx 40-160Hz)
        let bassSum = 0;
        for (let b = 1; b <= 4; b++) bassSum += window.audioFrequencyData[b] || 0;
        const currentBass = bassSum / 4;

        // Mid-Range Bins (5 to 14: approx 160-1500Hz)
        let midSum = 0;
        for (let m = 5; m <= 14; m++) midSum += window.audioFrequencyData[m] || 0;
        const currentMid = midSum / 10;

        // Treble Bins (15 to 40: approx 1500-6000Hz)
        let trebleSum = 0;
        for (let t = 15; t <= 40; t++) trebleSum += window.audioFrequencyData[t] || 0;
        const currentTreble = trebleSum / 26;

        if (currentBass > 6 || currentMid > 6 || currentTreble > 6) {
          hasRealAudio = true;
          audioBoost = currentBass / 255;
          midBoost = currentMid / 255;
          trebleBoost = currentTreble / 255;

          // Adaptive Kick Beat Detection with dynamic running envelope
          bassHistory.push(currentBass);
          if (bassHistory.length > 20) bassHistory.shift();
          const avgBass = bassHistory.reduce((a, b) => a + b, 0) / bassHistory.length;

          if (currentBass > 32 && currentBass > avgBass * 1.15 && beatCooldown <= 0) {
            isKickBeat = true;
            beatCooldown = 8; // Debounce ~130ms at 60fps
            kickPulse = 1.0;

            // Spawn dynamic expanding radial shockwave
            if (shockwaves.length < 5) {
              shockwaves.push({
                x: mouse.x > 0 && mouse.x < width ? mouse.x : width / 2,
                y: mouse.y > 0 && mouse.y < height ? mouse.y : height * 0.62,
                radius: 10,
                maxRadius: Math.max(width, height) * 0.85,
                alpha: 0.65
              });
            }
          }
        }
      }

      // Fallback music beat synchronizer: if audio is playing without FFT data (CORS or background loading)
      if (window.isAudioPlaying && !hasRealAudio) {
        const audio = audioInstance;
        const t = (audio && audio.currentTime) ? audio.currentTime : (Date.now() / 1000);
        // Use current track's BPM for accurate beat phase
        const bps = (window.currentTrackBPM || 112) / 60;
        const beatCycle = (t * bps) % 1;
        const kickEnvelope = Math.max(0, 1 - beatCycle * 3.5);
        audioBoost = 0.22 + kickEnvelope * 0.58;
        midBoost = 0.18 + (Math.sin(t * Math.PI * bps) * 0.5 + 0.5) * 0.35;
        trebleBoost = 0.15 + (Math.cos(t * Math.PI * bps * 2) * 0.5 + 0.5) * 0.35;

        if (beatCycle < 0.08 && beatCooldown <= 0) {
          isKickBeat = true;
          beatCooldown = 10;
          kickPulse = 1.0;
          if (shockwaves.length < 5) {
            shockwaves.push({
              x: mouse.x > 0 && mouse.x < width ? mouse.x : width / 2,
              y: mouse.y > 0 && mouse.y < height ? mouse.y : height * 0.62,
              radius: 10,
              maxRadius: Math.max(width, height) * 0.85,
              alpha: 0.65
            });
          }
        }
      } else if (!window.isAudioPlaying) {
        // Ambient rhythm mode when music is paused (relaxed 100 BPM breathing pulse)
        const t = Date.now() / 1000;
        const ambientCycle = (t * (100 / 60)) % 1;
        const subtlePulse = Math.pow(Math.sin(ambientCycle * Math.PI), 4);
        audioBoost = 0.07 + subtlePulse * 0.12;
        midBoost = 0.05 + subtlePulse * 0.08;
        trebleBoost = 0.05;
      }

      if (beatCooldown > 0) beatCooldown--;
      kickPulse *= 0.88; // Smooth exponential decay on beat impulse

      // Synchronize floating music card equalizer bars
      const eqBars = document.querySelectorAll('#omarchy-music-player .eq-bar');
      if (eqBars.length === 4) {
        if (window.isAudioPlaying) {
          const h1 = Math.max(3, Math.round((audioBoost) * 18));
          const h2 = Math.max(3, Math.round((midBoost) * 18));
          const h3 = Math.max(3, Math.round((midBoost * 0.8 + trebleBoost * 0.4) * 18));
          const h4 = Math.max(3, Math.round((trebleBoost) * 18));
          eqBars[0].style.height = h1 + 'px';
          eqBars[1].style.height = h2 + 'px';
          eqBars[2].style.height = h3 + 'px';
          eqBars[3].style.height = h4 + 'px';
        } else {
          eqBars.forEach(b => b.style.height = '3px');
        }
      }

      // Continuous phase advancement driven by music tempo, kicks & mouse velocity
      mouseHoverForce *= 0.90;
      mouseSpeed *= 0.85;
      const speedMult = 1.0 + (audioBoost * 2.4) + (kickPulse * 2.2) + (mouseHoverForce * 1.2);
      time += 0.016 * speedMult;
      beatPhase += 0.03 * speedMult;

      // =======================================================================
      // B. EXPANDING MUSIC BEAT SHOCKWAVES
      // =======================================================================
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += (14 + audioBoost * 18 + kickPulse * 16);
        sw.alpha *= 0.93;

        ctx.save();
        ctx.strokeStyle = brandColor;
        ctx.globalAlpha = Math.max(0, sw.alpha * (0.45 + kickPulse * 0.35));
        ctx.lineWidth = 1.8 + kickPulse * 1.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        if (sw.alpha < 0.015 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
        }
      }

      // =======================================================================
      // C. THEME-SPECIFIC PROCEDURAL VISUAL RENDERERS
      // =======================================================================

      if (activeFamily === 'matrix') {
        // =====================================================================
        // 1. MATRIX DIGITAL CODE RAIN & CRT GLITCH (Hackerman, Retro-82)
        // =====================================================================
        ctx.save();
        ctx.font = '13px var(--font-mono, monospace)';
        const rainSpeed = 1.0 + (audioBoost * 3.8) + (kickPulse * 3.5) + (mouseHoverForce * 2.5);

        // Mouse proximity: columns near cursor create a "vortex" glitch zone
        const mouseProxRadius = 160;

        matrixColumns.forEach(col => {
          const distFromMouse = Math.abs(col.x - mouse.x);
          const mouseProx = Math.max(0, 1 - distFromMouse / mouseProxRadius);
          const colSpeedBoost = 1 + mouseProx * (2.5 + mouseSpeed * 4.0);

          col.y += col.speed * rainSpeed * colSpeedBoost;
          if (col.y > height + 80) {
            col.y = -80 - Math.random() * 120;
            col.speed = Math.random() * 2.5 + 2.0;
          }

          const streamLen = col.chars.length;
          for (let i = 0; i < streamLen; i++) {
            const charY = col.y - i * 18;
            if (charY < -20 || charY > height + 20) continue;

            const isHead = i === 0;
            const hoverBright = isHead ? mouseProx * 0.6 : mouseProx * 0.25;
            let alpha = isHead
              ? Math.min(1.0, (isKickBeat ? 1.0 : 0.9) + hoverBright)
              : Math.max(0.06, (1 - i / streamLen) * (0.45 + audioBoost * 0.35 + mouseProx * 0.25));

            ctx.globalAlpha = alpha;
            ctx.fillStyle = (isHead && (isKickBeat || mouseProx > 0.6)) ? '#ffffff' : brandColor;

            if (isHead && (isKickBeat || mouseProx > 0.5)) {
              ctx.shadowColor = brandColor;
              ctx.shadowBlur = 10 + mouseProx * 14;
            } else {
              ctx.shadowBlur = 0;
            }

            ctx.fillText(col.chars[i], col.x, charY);
          }

          // Mouse proximity: rapid glyph mutation at cursor (digital disruption)
          if ((isKickBeat || mouseProx > 0.4 || Math.random() < 0.08)) {
            const mutIdx = Math.floor(Math.random() * col.chars.length);
            col.chars[mutIdx] = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            // Extra mutations near cursor for glitch burst
            if (mouseProx > 0.6) {
              col.chars[Math.floor(Math.random() * col.chars.length)] =
                matrixChars[Math.floor(Math.random() * matrixChars.length)];
            }
          }
        });

        // Horizontal phosphor scanline beam swept by kicks
        const scanlineY = (time * 180 * (1 + audioBoost)) % height;
        ctx.strokeStyle = brandColor;
        ctx.globalAlpha = 0.15 + kickPulse * 0.35;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, scanlineY);
        ctx.lineTo(width, scanlineY);
        ctx.stroke();

        // Mouse cursor glitch halo (bright ring around cursor in matrix theme)
        if (mouseActive && mouse.x > 0 && mouse.x < width) {
          const haloR = 40 + mouseSpeed * 60 + kickPulse * 30;
          ctx.strokeStyle = brandColor;
          ctx.globalAlpha = 0.18 + mouseSpeed * 0.5 + kickPulse * 0.3;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, haloR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();

      } else if (activeFamily === 'contour') {
        // =====================================================================
        // 2. HARMONIC TOPOGRAPHIC CONTOURS (Gruvbox, Everforest, Miasma, Ristretto)
        // =====================================================================
        ctx.save();
        const baseAmp = 28 + (audioBoost * 95) + (kickPulse * 75);

        contourLevels.forEach((yPct, idx) => {
          const baseY = height * yPct;
          const freq = 0.003 + (idx * 0.0006);
          const phaseOffset = idx * 0.7;

          ctx.strokeStyle = brandColor;
          ctx.globalAlpha = 0.14 + (idx % 2 === 0 ? 0.09 : 0) + (audioBoost * 0.35) + (kickPulse * 0.25);
          ctx.lineWidth = 1.2 + (kickPulse * 1.2);

          ctx.beginPath();
          for (let x = 0; x <= width; x += 16) {
            const distFromMouse = Math.abs(x - mouse.x);
            const mouseEffect = distFromMouse < 160 ? (160 - distFromMouse) * 0.3 : 0;

            const y = baseY
              - Math.abs(Math.sin(x * freq + time * 1.2 + phaseOffset)) * baseAmp
              - Math.cos(x * 0.006 + beatPhase + idx) * (baseAmp * 0.45)
              - mouseEffect;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            // Audio harmonic frequency spikes on ridge crests during beat
            if (isKickBeat && x % 48 === 0 && Math.random() < 0.6) {
              const spikeH = 15 + Math.random() * 25 * (audioBoost + 0.5);
              ctx.moveTo(x, y);
              ctx.lineTo(x, y - spikeH);
              ctx.moveTo(x, y);
            }
          }
          ctx.stroke();
        });
        ctx.restore();

      } else if (activeFamily === 'sonar') {
        // =====================================================================
        // 3. STEALTH SONAR & RADAR SWEEP (Matte Black, Vantablack, Solitude)
        // =====================================================================
        ctx.save();
        // Radar beam naturally sweeps, but gradually homes toward cursor when nearby
        const baseSpeed = 0.018 * (1.0 + (audioBoost * 3.2) + (kickPulse * 2.2) + (mouseHoverForce * 1.8));
        const cx = width / 2;
        const cy = height / 2;
        const maxR = Math.max(width, height) * 0.55;

        // Mouse hover: rotate beam toward cursor
        if (mouseActive && mouse.x > 0) {
          const targetAngle = Math.atan2(mouse.y - cy, mouse.x - cx);
          let diff = targetAngle - sonarAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          sonarAngle += baseSpeed + (diff * mouseSpeed * 0.06);
        } else {
          sonarAngle += baseSpeed;
        }

        // Concentric radar range rings (pulse outward on kick beats)
        [0.2, 0.4, 0.6, 0.8, 1.0].forEach(factor => {
          const r = maxR * factor * (1.0 + (kickPulse * 0.07));
          ctx.strokeStyle = borderColor;
          ctx.globalAlpha = 0.12 + (audioBoost * 0.18) + (kickPulse * 0.15);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          // Range telemetry labels
          ctx.fillStyle = brandColor;
          ctx.globalAlpha = 0.25 + audioBoost * 0.25;
          ctx.font = '10px var(--font-mono, monospace)';
          ctx.fillText(`${Math.round(factor * 1000)}KM`, cx + 8, cy - r + 12);
        });

        // Cardinal Crosshairs
        ctx.strokeStyle = borderColor;
        ctx.globalAlpha = 0.2 + audioBoost * 0.2;
        ctx.beginPath();
        ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
        ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
        ctx.stroke();

        // Rotating Sweeping Radar Beam with Phosphorescent Wake
        const wedgeSteps = 12;
        for (let w = 0; w < wedgeSteps; w++) {
          const ang = sonarAngle - (w * 0.03);
          const wAlpha = (1 - w / wedgeSteps) * (0.28 + audioBoost * 0.45);
          ctx.strokeStyle = brandColor;
          ctx.globalAlpha = wAlpha;
          ctx.lineWidth = w === 0 ? (2.0 + kickPulse * 1.5) : 1.2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ang) * maxR, cy + Math.sin(ang) * maxR);
          ctx.stroke();
        }

        // Tactical Target Blips
        sonarBlips.forEach(b => {
          const bx = cx + Math.cos(b.angle) * (maxR * b.dist);
          const by = cy + Math.sin(b.angle) * (maxR * b.dist);

          // Check if sweeping beam hits target
          let angleDiff = Math.abs((sonarAngle % (Math.PI * 2)) - (b.angle % (Math.PI * 2)));
          if (angleDiff < 0.08 || isKickBeat) {
            b.pingAlpha = 1.0;
          }
          b.pingAlpha *= 0.94;

          const bScale = b.size * (1.0 + kickPulse * 0.5);
          ctx.fillStyle = brandColor;
          ctx.globalAlpha = 0.35 + b.pingAlpha * 0.65;
          ctx.beginPath();
          ctx.arc(bx, by, bScale, 0, Math.PI * 2);
          ctx.fill();

          if (b.pingAlpha > 0.05) {
            ctx.strokeStyle = brandColor;
            ctx.globalAlpha = b.pingAlpha * 0.5;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bx, by, bScale + (1 - b.pingAlpha) * 22, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        ctx.restore();

      } else if (activeFamily === 'frost') {
        // =====================================================================
        // 4. ARCTIC AURORA & CRYSTALLINE FROST GEOMETRY (Nord, White, Catppuccin-Latte)
        // =====================================================================
        ctx.save();

        // Flowing Aurora Curtains in upper sky
        const auroraAmp = 35 + (audioBoost * 110) + (kickPulse * 85);
        ctx.beginPath();
        ctx.moveTo(0, height * 0.3);
        for (let x = 0; x <= width; x += 30) {
          const ay = height * 0.28
            + Math.sin(x * 0.003 + time * 0.9) * auroraAmp
            + Math.cos(x * 0.007 + beatPhase) * (auroraAmp * 0.5);
          ctx.lineTo(x, ay);
        }
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();

        const auroraGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
        auroraGrad.addColorStop(0, 'transparent');
        auroraGrad.addColorStop(0.7, brandSoft);
        auroraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auroraGrad;
        ctx.globalAlpha = 0.25 + audioBoost * 0.45 + kickPulse * 0.25;
        ctx.fill();

        // 3D Tumbling Crystalline Frost Shards with Mouse Repulsion
        const shardSpeed = 1.0 + (audioBoost * 3.2) + (kickPulse * 2.8) + (mouseHoverForce * 1.5);
        frostCrystals.forEach(s => {
          // Mouse repulsion force: crystals scatter away from cursor
          const dx = s.x - mouse.x;
          const dy = s.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const repulseRadius = 130;
          if (dist < repulseRadius && dist > 0 && mouseActive) {
            const force = ((repulseRadius - dist) / repulseRadius) * (0.6 + mouseSpeed * 1.8);
            s.vx += (dx / dist) * force;
            s.vy += (dy / dist) * force;
            // Speed clamp to avoid flying off screen
            const spd = Math.hypot(s.vx, s.vy);
            if (spd > 4.5) { s.vx = (s.vx / spd) * 4.5; s.vy = (s.vy / spd) * 4.5; }
            // Spin faster on repulsion
            s.spin += (Math.random() - 0.5) * 0.04;
          } else {
            // Gentle friction damping to settle back
            s.vx *= 0.97;
            s.vy *= 0.97;
          }

          s.x += s.vx * shardSpeed;
          s.y += s.vy * shardSpeed;
          s.angle += s.spin * (1.0 + trebleBoost * 4.0 + mouseSpeed * 2.0);

          if (s.x < -30) s.x = width + 30;
          if (s.x > width + 30) s.x = -30;
          if (s.y < -30) s.y = height + 30;
          if (s.y > height + 30) s.y = -30;

          const size = s.size * (1.0 + kickPulse * 0.45);
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.angle);

          ctx.strokeStyle = brandColor;
          ctx.globalAlpha = Math.min(0.85, s.baseAlpha + (audioBoost * 0.4) + (kickPulse * 0.3));
          ctx.lineWidth = 1.2;

          if (s.sides === 6) {
            // Hexagonal ice star
            ctx.beginPath();
            for (let a = 0; a < 6; a++) {
              const ang = (a * Math.PI) / 3;
              const px = Math.cos(ang) * size;
              const py = Math.sin(ang) * size;
              if (a === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();

            // Internal snowflake facets
            ctx.beginPath();
            for (let a = 0; a < 3; a++) {
              const ang = (a * Math.PI) / 3;
              ctx.moveTo(Math.cos(ang) * size, Math.sin(ang) * size);
              ctx.lineTo(Math.cos(ang + Math.PI) * size, Math.sin(ang + Math.PI) * size);
            }
            ctx.stroke();
          } else {
            // Faceted crystalline diamond
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 0.65, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size * 0.65, 0);
            ctx.closePath();
            ctx.stroke();

            // Internal facet line
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(0, size);
            ctx.moveTo(-size * 0.65, 0);
            ctx.lineTo(size * 0.65, 0);
            ctx.stroke();
          }
          ctx.restore();
        });

        ctx.restore();

      } else if (activeFamily === 'wave') {
        // =====================================================================
        // 5. GREAT WAVE HARMONIC SWELLS & ZEN RIPPLES (Kanagawa, Osaka-Jade)
        // =====================================================================
        ctx.save();
        const waveCount = 4;
        const waveAmp = 32 + (audioBoost * 88) + (kickPulse * 70);

        for (let w = 0; w < waveCount; w++) {
          const baseY = height * (0.68 + w * 0.08);
          const wFreq = 0.0035 + (w * 0.0008);
          const wSpeed = time * (1.2 + w * 0.4);

          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(0, baseY);

          for (let x = 0; x <= width; x += 20) {
            const crest = Math.sin(x * wFreq + wSpeed) * waveAmp
              + Math.cos(x * 0.007 + beatPhase + w) * (waveAmp * 0.4);
            ctx.lineTo(x, baseY + crest);
          }
          ctx.lineTo(width, height);
          ctx.closePath();

          ctx.fillStyle = brandColor;
          ctx.globalAlpha = 0.08 + (w * 0.05) + (audioBoost * 0.18) + (kickPulse * 0.12);
          ctx.fill();

          ctx.strokeStyle = brandColor;
          ctx.globalAlpha = 0.25 + (audioBoost * 0.4) + (kickPulse * 0.35);
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        // Dancing Seafoam Spray Particles (launch upward on kick beat)
        waveSpray.forEach(p => {
          p.x += p.vx * (1.0 + audioBoost * 2.0);
          p.y += p.vy * (1.0 + audioBoost * 2.0);
          p.vy += 0.04; // gravity

          if (isKickBeat) {
            p.vy = -Math.random() * 4 - 2; // Kinetic kick impulse
          }

          if (p.y > height || p.y < height * 0.5) {
            p.y = height * (0.75 + Math.random() * 0.2);
            p.vy = -Math.random() * 2 - 1;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = p.alpha * (0.4 + audioBoost * 0.6);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (1.0 + kickPulse * 0.6), 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();

      } else {
        // =====================================================================
        // 6. 3D PERSPECTIVE RETRO-WAVE HORIZON GRID & CONSTELLATION SKY
        //    (Tokyo Night, Catppuccin, Rose Pine, Ethereal, Lupine, Last Horizon)
        // =====================================================================
        ctx.save();
        const horizonY = height * 0.62;
        const cx_base = width / 2;
        // Horizon glow X position tracks cursor horizontally for an immersive follow effect
        const cx = mouseActive && mouse.x > 0
          ? cx_base + (mouse.x - cx_base) * 0.4
          : cx_base;

        // Twilight Horizon Glow Bloom (flares on music kick + mouse movement)
        const glowRadius = 220 + (audioBoost * 200) + (kickPulse * 240) + (mouseHoverForce * 180);
        const horizonGlow = ctx.createRadialGradient(cx, horizonY, 10, cx, horizonY, glowRadius);
        horizonGlow.addColorStop(0, brandColor);
        horizonGlow.addColorStop(0.4, brandSoft);
        horizonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = horizonGlow;
        ctx.globalAlpha = 0.22 + (audioBoost * 0.45) + (kickPulse * 0.35);
        ctx.beginPath();
        ctx.arc(cx, horizonY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 3D Ground Perspective Grid: Moving Horizontal Lines (travels toward viewer)
        const totalZLines = 16;
        const zOffset = (beatPhase * 0.9) % 1.0;

        for (let k = 1; k <= totalZLines; k++) {
          const z = ((k - zOffset) / totalZLines);
          if (z <= 0 || z > 1) continue;

          // Non-linear perspective projection
          const y = horizonY + (height - horizonY) * Math.pow(z, 2.2);
          const lineWidth = 0.8 + z * 1.8 + (kickPulse * 1.5);
          const lineAlpha = Math.min(0.85, z * (0.35 + audioBoost * 0.45 + kickPulse * 0.3));

          ctx.strokeStyle = brandColor;
          ctx.globalAlpha = lineAlpha;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // 3D Perspective Radial Lines (fanning out to vanishing point at horizon)
        const rayCount = 18;
        ctx.strokeStyle = brandColor;
        ctx.globalAlpha = 0.15 + (audioBoost * 0.25) + (kickPulse * 0.2);
        ctx.lineWidth = 1.0 + (kickPulse * 0.8);
        ctx.beginPath();
        for (let r = 0; r <= rayCount; r++) {
          const bottomX = (width / rayCount) * r;
          ctx.moveTo(cx, horizonY);
          ctx.lineTo(bottomX, height);
        }
        ctx.stroke();

        // Horizon Divider Beam
        ctx.strokeStyle = brandColor;
        ctx.globalAlpha = 0.5 + (audioBoost * 0.5);
        ctx.lineWidth = 1.8 + (kickPulse * 1.6);
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.stroke();

        // Celestial Constellation Stars in Upper Sky
        const starSpeed = 1.0 + (audioBoost * 2.8) + (kickPulse * 2.0);
        for (let i = 0; i < neonStars.length; i++) {
          const p = neonStars[i];
          p.x += p.vx * starSpeed;
          p.y += p.vy * starSpeed;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = horizonY - 10;
          if (p.y > horizonY - 5) p.y = 0;

          // Mouse deflection
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0) {
            const force = (130 - dist) / 130;
            p.x += (dx / dist) * force * 1.8;
            p.y += (dy / dist) * force * 1.8;
          }

          const pulse = Math.sin(time * p.pulseSpeed * 20 + p.pulsePhase) * 0.15;
          const starAlpha = Math.max(0.1, Math.min(0.95, p.baseAlpha + pulse + (audioBoost * 0.4) + (kickPulse * 0.3)));
          const starRadius = p.radius * (1.0 + (trebleBoost * 1.8) + (kickPulse * 1.2));

          ctx.fillStyle = brandColor;
          ctx.globalAlpha = starAlpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, starRadius, 0, Math.PI * 2);
          ctx.fill();

          // Interconnecting Constellation Filaments
          for (let j = i + 1; j < neonStars.length; j++) {
            const p2 = neonStars[j];
            const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist2 < 110) {
              ctx.strokeStyle = brandColor;
              ctx.globalAlpha = (1 - dist2 / 110) * (0.18 + audioBoost * 0.45 + kickPulse * 0.25);
              ctx.lineWidth = 0.8 + audioBoost * 0.8;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        ctx.restore();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    }

    // Mouse state with smooth velocity tracking
    let mouseVX = 0, mouseVY = 0; // velocity
    let prevMouseX = -1000, prevMouseY = -1000;
    let mouseSpeed = 0; // magnitude of cursor speed (0.0–1.0)
    let mouseActive = false; // true while cursor is over viewport
    let mouseHoverForce = 0; // decaying hover force impulse

    // Interactive Listeners
    window.addEventListener('resize', () => {
      cancelAnimationFrame(animationFrameId);
      resize();
      render();
    });

    window.addEventListener('mousemove', e => {
      mouseVX = e.clientX - prevMouseX;
      mouseVY = e.clientY - prevMouseY;
      mouseSpeed = Math.min(1.0, Math.hypot(mouseVX, mouseVY) / 40);
      prevMouseX = mouse.x;
      prevMouseY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseActive = true;
      // Surge hover force on fast mouse movement
      if (mouseSpeed > 0.35) {
        mouseHoverForce = Math.min(1.0, mouseHoverForce + mouseSpeed * 0.8);
      }
    });

    window.addEventListener('mouseleave', () => {
      mouseActive = false;
      mouseSpeed = 0;
    });

    // Touch support — treat touch as mouse for hover interactions
    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      const tx = t.clientX, ty = t.clientY;
      mouseVX = tx - prevMouseX;
      mouseVY = ty - prevMouseY;
      mouseSpeed = Math.min(1.0, Math.hypot(mouseVX, mouseVY) / 40);
      prevMouseX = mouse.x;
      prevMouseY = mouse.y;
      mouse.x = tx;
      mouse.y = ty;
      mouseActive = true;
    }, { passive: true });

    // Click / tap → spawn shockwave at cursor position
    window.addEventListener('pointerdown', e => {
      if (shockwaves.length < 6) {
        shockwaves.push({
          x: e.clientX,
          y: e.clientY,
          radius: 12,
          maxRadius: Math.max(width, height) * 0.88,
          alpha: 0.85
        });
        mouseHoverForce = 1.0;
      }
    });

    window.addEventListener('omarchyThemeChanged', () => {
      updateColors();
    });

    // Decay hover force each frame and expose to render loop
    function updateMouseState() {
      mouseHoverForce *= 0.90;
      mouseSpeed *= 0.85;
      window._omarchyMouseForce = mouseHoverForce;
      window._omarchyMouseSpeed = mouseSpeed;
    }

    // Patch render to include mouse state update at top
    const _origRender = render;
    const origAnimFrameId = animationFrameId;

    // Pause canvas loop when tab is hidden to conserve power and CPU
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

      // Handle navigation keys 1-5 (Menubar Workspace slots)
      if (['1', '2', '3', '4', '5'].includes(e.key) && document.activeElement.id !== 'tui-input') {
        e.preventDefault();
        const navMap = {
          '1': { section: '#projects', url: '/projects/' },
          '2': { section: '#dispatches', url: '/blog/' },
          '3': { section: null, url: '/about/' },
          '4': { section: '#themes', url: '/#themes' },
          '5': { section: null, url: '/resume/' }
        };
        const item = navMap[e.key];
        if (item) {
          const target = item.section ? document.querySelector(item.section) : null;
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          } else if (item.url) {
            window.location.href = item.url;
          }
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
  // 5. AMBIENT MUSIC ENGINE — Multi-Track (Kevin Koontz + 33 Max Verstappen)
  // =========================================================================
  let audioInstance = null;
  let isAudioPlaying = false;

  const TRACKS = {
    kevin: {
      src: '/assets/audio/kevin_koontz-we_can_fix_everything.mp3',
      title: 'We Can Fix Everything',
      artist: 'Kevin Koontz · Omarchy OST',
      art: '/assets/images/kevin_koontz.webp',
      artAlt: 'Kevin Koontz Album Art',
      bpm: 112,
      toast: '▶ Kevin Koontz – We Can Fix Everything'
    },
    max: {
      src: '/assets/audio/33_max_verstappen.mp3',
      title: '33 Max Verstappen',
      artist: 'Carte Blanq · Maxx Power · Nils van Zandt',
      art: null, // F1 helmet emoji fallback
      artAlt: '33 Max Verstappen',
      bpm: 130,
      toast: '▶ 33 Max Verstappen – Tu-tu-du-du 🏎️'
    }
  };

  let currentTrack = 'kevin';

  function getAudio() {
    if (!audioInstance) {
      audioInstance = new Audio();
      audioInstance.crossOrigin = 'anonymous';

      // Setup Web Audio API Analyser for real-time visualizer
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !window.audioContext) {
          const audioCtx = new AudioContext();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.75;
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
      audioInstance.src = TRACKS[currentTrack].src;

      audioInstance.addEventListener('error', () => {
        console.warn('Audio load failed. Retrying without crossOrigin.');
        audioInstance.removeAttribute('crossOrigin');
        audioInstance.load();
      });

      const seek = document.getElementById('music-seek');
      const currTimeEl = document.getElementById('music-curr-time');
      const durationEl = document.getElementById('music-duration');

      audioInstance.addEventListener('timeupdate', () => {
        if (audioInstance.duration) {
          const progress = (audioInstance.currentTime / audioInstance.duration) * 100;
          if (seek && !seek.dataset.seeking) seek.value = progress;
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

  function applyTrackMeta(trackId) {
    const t = TRACKS[trackId];
    const titleEl = document.getElementById('music-track-title');
    const artistEl = document.getElementById('music-track-artist');
    const artEl = document.getElementById('music-art-img');

    if (titleEl) titleEl.textContent = t.title;
    if (artistEl) artistEl.textContent = t.artist;
    if (artEl) {
      if (t.art) {
        artEl.src = t.art;
        artEl.alt = t.artAlt;
        artEl.style.fontSize = '';
        artEl.style.display = 'block';
      } else {
        // Emoji fallback for tracks without album art
        artEl.style.display = 'none';
        const btn = document.querySelector('.music-art-btn');
        if (btn && !btn.querySelector('.music-emoji-art')) {
          const em = document.createElement('span');
          em.className = 'music-emoji-art';
          em.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;z-index:1;';
          em.textContent = '🏎️';
          btn.insertBefore(em, btn.querySelector('.music-play-overlay'));
        }
      }
    }

    // Remove emoji art when switching back to a track with art
    if (t.art) {
      const em = document.querySelector('.music-emoji-art');
      if (em) em.remove();
    }

    // Update active tab buttons
    document.querySelectorAll('.music-track-btn').forEach(b => {
      const isActive = b.dataset.track === trackId;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Expose current BPM for beat-fallback sync
    window.currentTrackBPM = t.bpm;
  }

  function switchTrack(trackId) {
    if (!TRACKS[trackId] || trackId === currentTrack) return;
    const wasPlaying = isAudioPlaying;
    currentTrack = trackId;

    const audio = getAudio();
    const wasPaused = audio.paused;
    audio.pause();
    audio.currentTime = 0;
    audio.src = TRACKS[trackId].src;

    applyTrackMeta(trackId);

    if (wasPlaying || !wasPaused) {
      audio.play().then(() => {
        updateMusicUI(true);
        showToastNotice(TRACKS[trackId].toast);
      }).catch(() => {
        updateMusicUI(false);
      });
    } else {
      updateMusicUI(false);
    }
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
      showToastNotice(TRACKS[currentTrack].toast);
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

    // Wire track switcher buttons
    document.querySelectorAll('.music-track-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const trackId = btn.dataset.track;
        if (trackId && trackId !== currentTrack) {
          switchTrack(trackId);
        }
      });
    });

    // Set initial track metadata
    applyTrackMeta(currentTrack);
    window.currentTrackBPM = TRACKS[currentTrack].bpm;
  }

  // =========================================================================
  
  // =========================================================================
  // 6. COMMAND PALETTE ENGINE (Ctrl+K / Super+Space / Wofi)
  // =========================================================================
  const PALETTE_COMMANDS = [
    // Navigation
    { id: 'nav-home', label: 'Go to Home / Overview', category: 'Navigation', icon: '⚡', action: () => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'nav-arch', label: 'Distributed Systems Architecture Explorer', category: 'Navigation', icon: '🏗️', action: () => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'nav-mem', label: 'Rust Zero-Copy Memory & Allocation Profiler', category: 'Navigation', icon: '🧠', action: () => document.getElementById('memory-profiler')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'nav-raft', label: 'Distributed Raft Consensus & Gossip Mesh', category: 'Navigation', icon: '🛰️', action: () => document.getElementById('raft-mesh')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'nav-shaders', label: 'Hyprland WebGL Compositor Shader Sandbox', category: 'Navigation', icon: '✨', action: () => document.getElementById('shader-sandbox')?.scrollIntoView({ behavior: 'smooth' }) },
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
  // 14. RUST ZERO-COPY MEMORY PROFILER ENGINE
  // =========================================================================
  function initMemoryProfiler() {
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
  // 15. DISTRIBUTED RAFT CONSENSUS & IN-BROWSER GOSSIP MESH ENGINE
  // =========================================================================
  function initRaftMesh() {
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
  // 16. LIVE HYPRLAND COMPOSITOR SHADER SANDBOX ENGINE
  // =========================================================================
  function initShaderSandbox() {
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

  // =========================================================================
  // 17. INITIALIZATION
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
    initMemoryProfiler();
    initRaftMesh();
    initShaderSandbox();
    initMenubarClock();
  });

  // =========================================================================
  // 18. SYSTEM MENUBAR CLOCK (Live Date & Time in Top Bar)
  // =========================================================================
  function initMenubarClock() {
    const clockEl = document.getElementById('menubar-datetime');
    if (!clockEl) return;
    const dateEl = clockEl.querySelector('.mb-clock-date');
    const timeEl = clockEl.querySelector('.mb-clock-time');

    function updateTime() {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      if (dateEl && timeEl) {
        dateEl.textContent = dateStr;
        timeEl.textContent = timeStr;
      } else {
        clockEl.textContent = `${dateStr} · ${timeStr}`;
      }
    }

    updateTime();
    setInterval(updateTime, 1000);
  }
})();
