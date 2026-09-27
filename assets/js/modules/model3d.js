/**
 * OMARCHY 3D HERO VIEWPORT CONTROLLER (v3)
 * High-performance 3D perspective tilt & depth parallax reveal for v3 photos.
 * Zero-lag hardware-accelerated spring physics with automatic loop suspension.
 */

export function init3DModelViewer() {
  const viewport = document.getElementById('hero-3d-viewport');
  const baseLayer = document.getElementById('h3d-base-layer');
  const revealLayer = document.getElementById('h3d-reveal-layer');
  const sheen = document.getElementById('h3d-sheen');

  if (!viewport || !baseLayer) return;

  // Interaction State
  let isHovered = false;
  let isLocked = false;
  let isPhysicsRunning = false;
  let animFrameId = null;

  // Target values (driven by pointer position)
  let targetTiltX = 0;
  let targetTiltY = 0;
  let targetMaskX = 50;
  let targetMaskY = 48;
  let targetReveal = 0;

  // Current interpolated values
  let currentTiltX = 0;
  let currentTiltY = 0;
  let currentMaskX = 50;
  let currentMaskY = 48;
  let currentReveal = 0;

  function startPhysics() {
    if (!isPhysicsRunning) {
      isPhysicsRunning = true;
      animFrameId = requestAnimationFrame(updatePhysics);
    }
  }

  function updatePhysics() {
    if (!isPhysicsRunning) return;

    // Smooth spring interpolation
    currentTiltX += (targetTiltX - currentTiltX) * 0.09;
    currentTiltY += (targetTiltY - currentTiltY) * 0.09;
    currentMaskX += (targetMaskX - currentMaskX) * 0.12;
    currentMaskY += (targetMaskY - currentMaskY) * 0.12;
    currentReveal += (targetReveal - currentReveal) * 0.08;

    // Apply CSS mask & opacity variables
    viewport.style.setProperty('--reveal-opacity', Math.max(0, Math.min(1, currentReveal)).toFixed(3));
    viewport.style.setProperty('--mask-x', `${currentMaskX.toFixed(2)}%`);
    viewport.style.setProperty('--mask-y', `${currentMaskY.toFixed(2)}%`);

    // 3D Perspective Tilt Strings
    const tiltXStr = currentTiltX.toFixed(2);
    const tiltYStr = currentTiltY.toFixed(2);

    // 1. Base Layer (Front Helmet Model) at depth plane Z = 0
    baseLayer.style.transform = `rotateX(${tiltXStr}deg) rotateY(${tiltYStr}deg) translate3d(0, 0, 0)`;

    // 2. Reveal Layer (Back Character Model) with stereoscopic depth plane Z = 28px + parallax offset
    if (revealLayer) {
      const parallaxX = (currentTiltY * 0.75).toFixed(2);
      const parallaxY = (-currentTiltX * 0.75).toFixed(2);
      revealLayer.style.transform = `rotateX(${tiltXStr}deg) rotateY(${tiltYStr}deg) translate3d(${parallaxX}px, ${parallaxY}px, 28px)`;
    }

    // 3. Dynamic Specular Sheen (Directional lighting glaze based on 3D tilt)
    if (sheen) {
      const lightX = 50 + currentTiltY * 1.6;
      const lightY = 44 - currentTiltX * 1.6;
      sheen.style.background = `radial-gradient(ellipse 65% 55% at ${lightX.toFixed(1)}% ${lightY.toFixed(1)}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(0, 0, 0, 0) 75%)`;
      sheen.style.transform = `rotateX(${tiltXStr}deg) rotateY(${tiltYStr}deg) translate3d(0, 0, 36px)`;
    }

    // Stop loop when settled at rest (0% idle CPU consumption)
    const isAtRest = !isHovered && !isLocked &&
      Math.abs(currentTiltX) < 0.01 &&
      Math.abs(currentTiltY) < 0.01 &&
      currentReveal < 0.005;

    if (isAtRest) {
      currentTiltX = 0;
      currentTiltY = 0;
      currentReveal = 0;
      baseLayer.style.transform = 'none';
      if (revealLayer) revealLayer.style.transform = 'none';
      viewport.style.setProperty('--reveal-opacity', '0');
      isPhysicsRunning = false;
      return;
    }

    animFrameId = requestAnimationFrame(updatePhysics);
  }

  function handlePointerMove(e) {
    const rect = viewport.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const normX = (clientX - rect.left) / rect.width - 0.5;
    const normY = (clientY - rect.top) / rect.height - 0.5;

    // Tilt range: ±8 deg Y, ±7 deg X
    targetTiltY = normX * 16;
    targetTiltX = -normY * 14;

    targetMaskX = ((clientX - rect.left) / rect.width) * 100;
    targetMaskY = ((clientY - rect.top) / rect.height) * 100;
    targetReveal = 1;

    startPhysics();
  }

  function handlePointerEnter(e) {
    isHovered = true;
    targetReveal = 1;
    if (e) handlePointerMove(e);
    startPhysics();
  }

  function handlePointerLeave() {
    isHovered = false;
    if (!isLocked) {
      targetTiltX = 0;
      targetTiltY = 0;
      targetMaskX = 50;
      targetMaskY = 48;
      targetReveal = 0;
    }
  }

  function handleClick(e) {
    // Prevent interfering with prompt button
    if (e.target.closest('#hero-scroll-prompt')) return;

    isLocked = !isLocked;
    targetReveal = (isLocked || isHovered) ? 1 : 0;
    startPhysics();
  }

  // Pointer event listeners
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

  // Scroll collapse controller: When user scrolls, collapse hero model and reveal details
  const scrollThreshold = 40;
  let wasScrolled = false;

  function handleScroll() {
    const isScrolled = window.scrollY > scrollThreshold;
    if (isScrolled !== wasScrolled) {
      wasScrolled = isScrolled;
      if (isScrolled) {
        document.body.classList.add('hero-scrolled');
        if (isPhysicsRunning) {
          isPhysicsRunning = false;
          if (animFrameId) cancelAnimationFrame(animFrameId);
        }
      } else {
        document.body.classList.remove('hero-scrolled');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Scroll prompt button click to smoothly scroll down and reveal details
  const scrollPrompt = document.getElementById('hero-scroll-prompt');
  scrollPrompt?.addEventListener('click', () => {
    const targetY = Math.min(window.innerHeight * 0.85, 680);
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  });

  // Suspend physics on tab switch to eliminate background processing
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      isPhysicsRunning = false;
    } else if (isHovered || isLocked) {
      startPhysics();
    }
  });
}
