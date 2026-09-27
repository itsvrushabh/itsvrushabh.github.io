import { currentTheme, getThemeFamily } from "./theme.js";

export   function initBackgroundCanvas() {
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

    let fpsFrames = 0;
    let lastFpsTime = performance.now();
    const fpsEl = document.getElementById('hw-fps');

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Real-time FPS telemetry
      fpsFrames++;
      const nowMs = performance.now();
      if (nowMs - lastFpsTime >= 500) {
        const currentFps = Math.round((fpsFrames * 1000) / (nowMs - lastFpsTime));
        if (fpsEl) fpsEl.textContent = `${Math.min(120, currentFps)} FPS`;
        fpsFrames = 0;
        lastFpsTime = nowMs;
      }

      // Sync topbar mini equalizer heights to real audio when playing
      if (window.isAudioPlaying) {
        const topEqBars = document.querySelectorAll('#header-eq-bars .mb-eq-bar');
        if (topEqBars.length === 3) {
          const h1 = 3 + Math.round((audioBoost || 0.2) * 8);
          const h2 = 4 + Math.round((midBoost || 0.3) * 7);
          const h3 = 3 + Math.round((trebleBoost || 0.2) * 8);
          topEqBars[0].style.height = `${h1}px`;
          topEqBars[1].style.height = `${h2}px`;
          topEqBars[2].style.height = `${h3}px`;
        }
      }

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
