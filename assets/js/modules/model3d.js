/**
 * OMARCHY 3D MODEL & INTERACTIVE WATER RIPPLE ENGINE
 * Features:
 * 1. Borderless full-screen 3D model render
 * 2. Realistic interactive water ripple waves on hover/move/click
 * 3. Physical liquid pixel refraction via dynamic SVG displacement filter
 * 4. Fluid-reactive radial mask reveal of 3D helmet model
 * 5. Audio-reactive water wave pulse when ambient music is playing
 * 6. Responsive touch/pointer support for mobile and desktop
 * 7. Smooth scroll-driven collapse & expansion
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

export function init3DModelViewer() {
  const card = document.getElementById('hero-3d-card');
  const viewport = document.getElementById('hero-3d-viewport');
  const revealImg = document.getElementById('h3d-reveal-layer');
  const canvas = document.getElementById('h3d-water-canvas');
  const turb = document.getElementById('water-turbulence');
  const dispMap = document.getElementById('water-displacement');

  if (!card || !viewport || !revealImg) return;

  const ctx = canvas ? canvas.getContext('2d') : null;

  // State variables
  let isHovered = false;
  let targetX = 50; // percentage
  let targetY = 32;
  let currentX = 50;
  let currentY = 32;

  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastRippleTime = 0;

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
    if (ripples.length > 25) ripples.shift();
    ripples.push(new WaterRipple(relX, relY, maxR, intensity));
  }

  function handlePointerMove(e) {
    const rect = viewport.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const clampedX = Math.max(0, Math.min(rect.width, relX));
    const clampedY = Math.max(0, Math.min(rect.height, relY));

    targetX = (clampedX / rect.width) * 100;
    targetY = (clampedY / rect.height) * 100;

    // Calculate pointer velocity
    const dx = relX - lastPointerX;
    const dy = relY - lastPointerY;
    const dist = Math.hypot(dx, dy);
    lastPointerX = relX;
    lastPointerY = relY;

    // Spawn water ripples on movement
    const now = performance.now();
    if (dist > 8 && now - lastRippleTime > 40) {
      lastRippleTime = now;
      const speedNorm = Math.min(2.0, dist / 12);
      spawnRipple(clampedX, clampedY, Math.min(280, 160 + dist * 3), 0.7 + speedNorm * 0.4);
      targetDispScale = Math.min(36, 10 + dist * 1.4);
    }
  }

  function handlePointerEnter(e) {
    isHovered = true;
    viewport.style.setProperty('--reveal-opacity', '1');
    targetDispScale = 16;

    const rect = viewport.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.width / 2);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.height / 3);
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    lastPointerX = relX;
    lastPointerY = relY;
    spawnRipple(relX, relY, 260, 1.2);
  }

  function handlePointerLeave() {
    isHovered = false;
    viewport.style.setProperty('--reveal-opacity', '0');
    targetDispScale = 0;
    targetX = 50;
    targetY = 32;
  }

  // Click splash effect: triggers outward water wave rings
  function handleClick(e) {
    const rect = viewport.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.width / 2);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.height / 3);
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    targetDispScale = 45;
    const splashMax = Math.max(rect.width, rect.height) * 0.65;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        spawnRipple(relX, relY, splashMax, 1.4 - i * 0.2);
      }, i * 80);
    }
  }

  // Animation Loop: Updates water waves, SVG turbulence, and fluid reveal mask
  function updatePhysics() {
    const damping = isHovered ? 0.12 : 0.08;

    currentX += (targetX - currentX) * damping;
    currentY += (targetY - currentY) * damping;

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
        const rect = viewport.getBoundingClientRect();
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

    // Update mask coordinates
    viewport.style.setProperty('--mask-x', `${currentX.toFixed(2)}%`);
    viewport.style.setProperty('--mask-y', `${currentY.toFixed(2)}%`);

    const baseRadius = 160;
    const finalRadius = Math.round(baseRadius * audioBoost + currentDispScale * 1.5);
    viewport.style.setProperty('--mask-radius', `${finalRadius}px`);

    // Render Canvas Water Ripples
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        if (ripple.update()) {
          ripple.draw(ctx);
        } else {
          ripples.splice(i, 1);
        }
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
