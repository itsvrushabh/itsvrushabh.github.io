/**
 * OMARCHY 3D MODEL & INTERACTIVE WATER RIPPLE ENGINE
 * Features:
 * 1. Borderless full-screen cropped 3D model render
 * 2. Realistic interactive water ripple waves on hover/move/click
 * 3. Physical liquid pixel refraction via dynamic SVG displacement filter
 * 4. Web Audio API synthesized water droplet & splash sound effects
 * 5. Minimalist landing audio toggle
 * 6. Custom liquid refraction cursor reticle on water canvas
 * 7. Mobile gyroscope tilt physics (DeviceOrientation)
 * 8. Click-to-lock helmet toggle with splash wave
 * 9. Smooth scroll-driven collapse & expansion
 */

class WaterRipple {
  constructor(x, y, maxRadius = 240, intensity = 1.0) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = maxRadius;
    this.intensity = intensity;
    this.speed = 3.2 + Math.random() * 1.8;
    this.wavelength = 22;
    this.life = 1.0;
  }

  update() {
    this.radius += this.speed;
    this.life = Math.max(0, 1.0 - (this.radius / this.maxRadius));
    return this.life > 0.01;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const rings = 3;
    for (let i = 0; i < rings; i++) {
      const ringRadius = this.radius - (i * this.wavelength);
      if (ringRadius <= 0) continue;

      const progress = i / rings;
      const ringAlpha = Math.sin(this.life * Math.PI) * this.intensity * (1.0 - progress) * 0.45;

      // Specular crest highlight
      ctx.beginPath();
      ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(1, 2.2 * (1.0 - progress));
      ctx.stroke();

      // Aquatic refraction trough (soft oceanic blue tint)
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0, ringRadius - 2.5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(130, 210, 255, ${(ringAlpha * 0.55).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, 1.5 * (1.0 - progress));
      ctx.stroke();
    }
  }
}

// ── Web Audio Synthesizer for Pure Water Droplets ──
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playWaterDropSound(pitch = 1.0, volume = 0.06) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Water droplet physics: rapid pitch ramp up then down, steep exponential decay
    const startFreq = (650 + Math.random() * 200) * pitch;
    const peakFreq = (1300 + Math.random() * 350) * pitch;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.75, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (_) {}
}

function playWaterSplashSound() {
  if (!soundEnabled) return;
  playWaterDropSound(0.75, 0.10);
  setTimeout(() => playWaterDropSound(1.05, 0.08), 35);
  setTimeout(() => playWaterDropSound(1.35, 0.05), 75);
}

export function init3DModelViewer() {
  const card = document.getElementById('hero-3d-card');
  const viewport = document.getElementById('hero-3d-viewport');
  const baseLayer = document.getElementById('h3d-base-layer');
  const revealImg = document.getElementById('h3d-reveal-layer');
  const sheen = document.getElementById('h3d-sheen');
  const canvas = document.getElementById('h3d-water-canvas');
  const turb = document.getElementById('water-turbulence');
  const dispMap = document.getElementById('water-displacement');
  const landingSoundBtn = document.getElementById('hero-landing-sound');
  const helmetBadge = document.getElementById('hero-helmet-badge');
  const helmetText = document.getElementById('hhb-text');

  if (!card || !viewport || !revealImg) return;

  const ctx = canvas ? canvas.getContext('2d') : null;

  // State variables
  let isHovered = false;
  let isHelmetLocked = false;
  let isLingerActive = false;
  let hoverLingerTimeout = null;

  let targetX = 50; // percentage
  let targetY = 48;
  let currentX = 50;
  let currentY = 48;

  // 3D Parallax Tilt Physics (degrees)
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Dynamic Full-Helmet Reveal Radius (spring lerp)
  let targetRadius = 0;
  let currentRadius = 0;

  let pointerPixelX = 0;
  let pointerPixelY = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastRippleTime = 0;
  let lastAudioDropTime = 0;

  // SVG displacement physics
  let targetDispScale = 0;
  let currentDispScale = 0;
  let waterTime = 0;

  // Active water ripples
  const ripples = [];

  let animFrameId = null;

  // Resize canvas to match viewport
  function resizeWaterCanvas() {
    if (!canvas || !viewport) return;
    const rect = viewport.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  resizeWaterCanvas();
  window.addEventListener('resize', resizeWaterCanvas, { passive: true });

  // Spawn water ripple at relative coordinates
  function spawnRipple(relX, relY, maxR = 240, intensity = 1.0) {
    if (ripples.length > 30) ripples.shift();
    ripples.push(new WaterRipple(relX, relY, maxR, intensity));
  }

  function handlePointerMove(e) {
    const rect = viewport.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // If lingering after pointer leave, moving back cancels linger and holds reveal
    if (hoverLingerTimeout) {
      clearTimeout(hoverLingerTimeout);
      hoverLingerTimeout = null;
    }
    isLingerActive = false;
    isHovered = true;
    if (!isHelmetLocked) {
      viewport.style.setProperty('--reveal-opacity', '1');
    }

    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    pointerPixelX = relX;
    pointerPixelY = relY;

    const clampedX = Math.max(0, Math.min(rect.width, relX));
    const clampedY = Math.max(0, Math.min(rect.height, relY));

    targetX = (clampedX / rect.width) * 100;
    targetY = (clampedY / rect.height) * 100;

    // Interactive 3D Perspective Tilt Physics (-1 to +1 normalized coordinate)
    const normX = (clampedX / rect.width - 0.5) * 2;
    const normY = (clampedY / rect.height - 0.5) * 2;
    targetTiltX = -normY * 9.5; // Pitch: vertical tilt towards pointer
    targetTiltY = normX * 12.0;  // Yaw: horizontal tilt towards pointer

    // Calculate pointer velocity
    const dx = relX - lastPointerX;
    const dy = relY - lastPointerY;
    const dist = Math.hypot(dx, dy);
    lastPointerX = relX;
    lastPointerY = relY;

    // Spawn water ripples on movement
    const now = performance.now();
    if (dist > 7 && now - lastRippleTime > 35) {
      lastRippleTime = now;
      const speedNorm = Math.min(2.0, dist / 12);
      spawnRipple(clampedX, clampedY, Math.min(280, 160 + dist * 3), 0.7 + speedNorm * 0.4);
      targetDispScale = Math.min(36, 12 + dist * 1.4);

      // Trigger subtle synthesized water droplet sound (throttled)
      if (now - lastAudioDropTime > 150) {
        lastAudioDropTime = now;
        playWaterDropSound(1.0 + Math.random() * 0.4, 0.035);
      }
    }
  }

  function handlePointerEnter(e) {
    if (hoverLingerTimeout) {
      clearTimeout(hoverLingerTimeout);
      hoverLingerTimeout = null;
    }
    isLingerActive = false;
    isHovered = true;
    if (!isHelmetLocked) {
      viewport.style.setProperty('--reveal-opacity', '1');
    }
    targetDispScale = 16;

    const rect = viewport.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.width / 2);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.height * 0.48);
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    pointerPixelX = relX;
    pointerPixelY = relY;
    lastPointerX = relX;
    lastPointerY = relY;

    // Compute initial 3D tilt
    const clampedX = Math.max(0, Math.min(rect.width, relX));
    const clampedY = Math.max(0, Math.min(rect.height, relY));
    const normX = (clampedX / rect.width - 0.5) * 2;
    const normY = (clampedY / rect.height - 0.5) * 2;
    targetTiltX = -normY * 9.5;
    targetTiltY = normX * 12.0;

    spawnRipple(relX, relY, 260, 1.2);
    playWaterDropSound(1.1, 0.05);
  }

  function handlePointerLeave() {
    isHovered = false;
    targetDispScale = 0;
    targetTiltX = 0;
    targetTiltY = 0;
    targetX = 50;
    targetY = 48;

    if (isHelmetLocked) return;

    // Post-hover linger duration (~2.6s hold + 1.2s dissolve):
    // Allows the user to easily and comfortably see the full helmet without it cutting off
    if (hoverLingerTimeout) clearTimeout(hoverLingerTimeout);
    isLingerActive = true;

    hoverLingerTimeout = setTimeout(() => {
      isLingerActive = false;
      if (!isHovered && !isHelmetLocked) {
        viewport.style.setProperty('--reveal-opacity', '0');
      }
      hoverLingerTimeout = null;
    }, 2600);
  }

  // Click handler: Toggle helmet lock & produce dramatic water splash wave
  function handleClick(e) {
    const rect = viewport.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.width / 2);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.height * 0.48);
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    targetDispScale = 45;
    const splashMax = Math.max(rect.width, rect.height) * 0.75;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        spawnRipple(relX, relY, splashMax, 1.5 - i * 0.22);
      }, i * 75);
    }

    playWaterSplashSound();

    if (hoverLingerTimeout) {
      clearTimeout(hoverLingerTimeout);
      hoverLingerTimeout = null;
    }
    isLingerActive = false;

    // Toggle Helmet Lock state
    isHelmetLocked = !isHelmetLocked;
    if (isHelmetLocked) {
      viewport.style.setProperty('--reveal-opacity', '1');
      if (helmetBadge && helmetText) {
        helmetBadge.classList.add('locked');
        helmetText.textContent = 'HELMET LOCKED 🏎️ (CLICK TO UNLOCK)';
      }
    } else {
      if (helmetBadge && helmetText) {
        helmetBadge.classList.remove('locked');
        helmetText.textContent = 'CLICK TO LOCK HELMET';
      }
      if (!isHovered) {
        viewport.style.setProperty('--reveal-opacity', '0');
      }
    }
  }

  // ── Mobile Gyroscope Tilt Physics ──
  function handleOrientation(e) {
    if (e.gamma === null || e.beta === null) return;
    // gamma: left to right (-90 to +90), beta: front to back (-180 to +180)
    const tiltGamma = Math.max(-30, Math.min(30, e.gamma));
    const tiltBeta = Math.max(-20, Math.min(40, e.beta - 40)); // neutral holding angle ~40deg

    targetX = 50 + (tiltGamma / 30) * 35;
    targetY = 48 + (tiltBeta / 30) * 25;

    // 3D Parallax Tilt from gyroscope
    targetTiltX = Math.max(-14, Math.min(14, -(tiltBeta / 30) * 11));
    targetTiltY = Math.max(-16, Math.min(16, (tiltGamma / 30) * 13));

    // If tilt change is energetic, spawn slosh ripple
    if (Math.abs(tiltGamma) > 15 || Math.abs(tiltBeta) > 15) {
      const rect = viewport.getBoundingClientRect();
      const px = (targetX / 100) * rect.width;
      const py = (targetY / 100) * rect.height;
      const now = performance.now();
      if (now - lastRippleTime > 120) {
        lastRippleTime = now;
        spawnRipple(px, py, 220, 0.7);
        targetDispScale = 22;
      }
    }
  }

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
  }

  // ── Landing Sound Button Controller ──
  if (landingSoundBtn) {
    landingSoundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      getAudioContext(); // unlock audio context

      const mainPlayBtn = document.getElementById('music-play-btn');
      if (mainPlayBtn) {
        mainPlayBtn.click();
      }

      // Check playing state
      const isPlaying = window.isAudioPlaying || document.querySelector('.omarchy-music-card')?.classList.contains('playing');
      const soundText = document.getElementById('hls-text');
      const soundIcon = document.getElementById('hls-icon');

      if (!isPlaying) {
        landingSoundBtn.classList.add('active');
        if (soundText) soundText.textContent = 'SOUND: ON';
        if (soundIcon) {
          soundIcon.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          `;
        }
        playWaterDropSound(1.2, 0.08);
      } else {
        landingSoundBtn.classList.remove('active');
        if (soundText) soundText.textContent = 'SOUND: OFF';
        if (soundIcon) {
          soundIcon.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          `;
        }
      }
    });
  }

  // Animation Loop: Updates water waves, SVG turbulence, 3D multiplane tilt transforms, and fluid reveal mask
  function updatePhysics() {
    const damping = (isHovered || isLingerActive) ? 0.10 : 0.06;
    const tiltDamping = isHovered ? 0.08 : 0.05;

    currentX += (targetX - currentX) * damping;
    currentY += (targetY - currentY) * damping;

    // Damped spring interpolation for 3D tilt angles
    currentTiltX += (targetTiltX - currentTiltX) * tiltDamping;
    currentTiltY += (targetTiltY - currentTiltY) * tiltDamping;

    // Dynamic Full-Helmet Reveal Radius:
    // In 3D_helmat_model_v2.png, the helmet covers a tall central area.
    // Setting targetRadius to ~76% of viewport height ensures the full helmet is seen easily.
    const rect = viewport.getBoundingClientRect();
    const fullHelmetRadius = Math.max(680, Math.round((rect.height || 900) * 0.76));

    if (isHelmetLocked) {
      targetRadius = 2400;
    } else if (isHovered || isLingerActive) {
      targetRadius = fullHelmetRadius;
    } else {
      targetRadius = 0;
    }

    const radiusDamping = (isHovered || isLingerActive) ? 0.08 : 0.05;
    currentRadius += (targetRadius - currentRadius) * radiusDamping;

    // Decay target displacement scale toward idle
    if (isHovered) {
      if (targetDispScale > 6) {
        targetDispScale *= 0.95;
      } else {
        targetDispScale = 6; // subtle idle water shimmer
      }
    } else {
      targetDispScale *= 0.90;
    }

    currentDispScale += (targetDispScale - currentDispScale) * 0.12;

    // Audio reactive boost if music is playing
    let audioBoost = 1.0;
    if (window.isAudioPlaying && window.audioFrequencyData) {
      const bass = (window.audioFrequencyData[1] + window.audioFrequencyData[2] + window.audioFrequencyData[3]) / (3 * 255);
      audioBoost = 1.0 + bass * 0.24;
      if (bass > 0.65 && Math.random() < 0.1) {
        // Spawn subtle bass droplet ripple
        spawnRipple(rect.width * (0.35 + Math.random() * 0.3), rect.height * (0.25 + Math.random() * 0.3), 180, 0.6);
      }
    }

    // Update SVG displacement filter
    waterTime += 0.022;
    if (dispMap && turb) {
      const freqX = (0.012 + Math.sin(waterTime) * 0.003).toFixed(4);
      const freqY = (0.018 + Math.cos(waterTime * 0.8) * 0.004).toFixed(4);
      dispMap.setAttribute('scale', (currentDispScale * audioBoost).toFixed(2));
      turb.setAttribute('baseFrequency', `${freqX} ${freqY}`);
    }

    // Update mask coordinates and radius
    viewport.style.setProperty('--mask-x', `${currentX.toFixed(2)}%`);
    viewport.style.setProperty('--mask-y', `${currentY.toFixed(2)}%`);

    const activeRadius = Math.max(0, Math.round(currentRadius * audioBoost + currentDispScale * 1.5));
    viewport.style.setProperty('--mask-radius', `${activeRadius}px`);

    // ── Real 3D Perspective Tilt & Multiplane Parallax Separation ──
    const tiltXStr = currentTiltX.toFixed(2);
    const tiltYStr = currentTiltY.toFixed(2);

    // 1. Base Layer (Face & Suit) at depth plane Z = 0
    if (baseLayer) {
      baseLayer.style.transform = `rotateX(${tiltXStr}deg) rotateY(${tiltYStr}deg) translate3d(0, 0, 0)`;
    }

    // 2. Reveal Layer (Full Helmet) with stereoscopic pop-out: Z = 32px + dynamic parallax offset
    if (revealImg) {
      const parallaxX = (currentTiltY * 0.7).toFixed(2);
      const parallaxY = (-currentTiltX * 0.7).toFixed(2);
      revealImg.style.transform = `rotateX(${tiltXStr}deg) rotateY(${tiltYStr}deg) translate3d(${parallaxX}px, ${parallaxY}px, 32px)`;
    }

    // 3. Dynamic Specular Sheen (Directional lighting glaze based on 3D tilt)
    if (sheen) {
      const normX = (currentX - 50) / 50;
      const normY = (currentY - 48) / 48;
      const lightX = 50 + normX * 32 + currentTiltY * 1.2;
      const lightY = 42 + normY * 28 - currentTiltX * 1.2;
      sheen.style.background = `radial-gradient(ellipse 65% 55% at ${lightX.toFixed(1)}% ${lightY.toFixed(1)}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.06) 45%, rgba(0, 0, 0, 0) 75%)`;
      sheen.style.transform = `rotateX(${tiltXStr}deg) rotateY(${tiltYStr}deg) translate3d(0, 0, 42px)`;
    }

    // 4. Water Ripple Canvas (Floats as top holographic liquid plane at Z = 52px)
    if (canvas) {
      canvas.style.transform = `rotateX(${tiltXStr}deg) rotateY(${tiltYStr}deg) translate3d(0, 0, 52px)`;
    }

    // Render Canvas Water Ripples & Liquid Cursor
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render expanding water ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        if (ripple.update()) {
          ripple.draw(ctx);
        } else {
          ripples.splice(i, 1);
        }
      }

      // Draw custom interactive liquid cursor reticle when hovered
      if (isHovered && pointerPixelX > 0 && pointerPixelY > 0) {
        const cursorRadius = 18 + Math.sin(waterTime * 4) * 2 + currentDispScale * 0.35;
        
        // Specular outer water ring
        ctx.beginPath();
        ctx.arc(pointerPixelX, pointerPixelY, cursorRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner aquatic glow dot
        ctx.beginPath();
        ctx.arc(pointerPixelX, pointerPixelY, 3, 0, Math.PI * 2);
        ctx.fillStyle = isHelmetLocked ? '#ef4444' : '#60a5fa';
        ctx.shadowColor = isHelmetLocked ? '#ef4444' : '#60a5fa';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    animFrameId = requestAnimationFrame(updatePhysics);
  }

  // Listeners
  viewport.addEventListener('mouseenter', handlePointerEnter);
  viewport.addEventListener('mousemove', handlePointerMove);
  viewport.addEventListener('mouseleave', handlePointerLeave);
  viewport.addEventListener('click', handleClick);

  // Touch Support
  viewport.addEventListener('touchstart', (e) => {
    handlePointerEnter(e);
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    handlePointerMove(e);
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    handlePointerLeave();
  }, { passive: true });

  // Start physics loop
  animFrameId = requestAnimationFrame(updatePhysics);

  // Scroll collapse controller: When user scrolls, collapse 3D model and reveal details
  const scrollThreshold = 40;
  let wasScrolled = false;

  function handleScroll() {
    const isScrolled = window.scrollY > scrollThreshold;
    if (isScrolled !== wasScrolled) {
      wasScrolled = isScrolled;
      if (isScrolled) {
        document.body.classList.add('hero-scrolled');
      } else {
        document.body.classList.remove('hero-scrolled');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Scroll prompt button click to smoothly collapse 3D model & reveal details
  const scrollPrompt = document.getElementById('hero-scroll-prompt');
  scrollPrompt?.addEventListener('click', () => {
    const targetY = Math.min(window.innerHeight * 0.85, 680);
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  });

  // Cleanup on tab switch
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    } else {
      animFrameId = requestAnimationFrame(updatePhysics);
    }
  });
}
