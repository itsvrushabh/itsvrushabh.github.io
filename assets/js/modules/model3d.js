/**
 * OMARCHY 3D MODEL & HELMET HOVER REVEAL ENGINE
 * Inspired by the F1 driver interactive experience on landonorris.com.
 *
 * Features:
 * 1. Base 3D model render display
 * 2. Real-time cursor-following radial mask reveal of the 3D helmet model
 * 3. Atmospheric holographic glimpse of the helmet when hovered
 * 4. Smooth 3D perspective tilt physics with requestAnimationFrame damping
 * 5. Audio-reactive bass pulse when ambient music is playing
 * 6. Touch / pointer drag support for mobile and tablet devices
 */

export function init3DModelViewer() {
  const card = document.getElementById('hero-3d-card');
  const viewport = document.getElementById('hero-3d-viewport');
  const revealImg = document.getElementById('h3d-reveal-layer');
  const lensRing = document.getElementById('h3d-lens-ring');

  if (!card || !viewport || !revealImg) return;

  // State variables
  let isHovered = false;
  let targetX = 50; // percentage
  let targetY = 32; // default centered around head/helmet
  let currentX = 50;
  let currentY = 32;

  let targetTiltX = 0; // degrees
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  let animFrameId = null;

  // Read initial bounds
  function getViewportBounds() {
    return viewport.getBoundingClientRect();
  }

  // Pointer move handler
  function handlePointerMove(e) {
    const rect = getViewportBounds();
    if (rect.width === 0 || rect.height === 0) return;

    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Constrain to container
    const clampedX = Math.max(0, Math.min(rect.width, relX));
    const clampedY = Math.max(0, Math.min(rect.height, relY));

    // Calculate percentage (0 to 100)
    targetX = (clampedX / rect.width) * 100;
    targetY = (clampedY / rect.height) * 100;

    // Calculate 3D tilt angles (-10deg to +10deg)
    const normalizedX = (clampedX / rect.width) * 2 - 1; // -1 to 1
    const normalizedY = (clampedY / rect.height) * 2 - 1; // -1 to 1

    targetTiltY = normalizedX * 10;  // Rotate around Y-axis
    targetTiltX = -normalizedY * 10; // Rotate around X-axis
  }

  function handlePointerEnter(e) {
    isHovered = true;
    card.classList.add('is-hovered');
    viewport.style.setProperty('--reveal-opacity', '1');

    // Trigger audio snap effect if available
    try {
      if (window.omarchy && typeof window.omarchy.playWindowSnap === 'function') {
        window.omarchy.playWindowSnap();
      }
    } catch (_) {}

    handlePointerMove(e);
  }

  function handlePointerLeave() {
    isHovered = false;
    card.classList.remove('is-hovered');
    viewport.style.setProperty('--reveal-opacity', '0');

    // Reset tilt back to flat
    targetTiltX = 0;
    targetTiltY = 0;

    // Slowly return mask center toward head
    targetX = 50;
    targetY = 32;
  }

  // Physics animation loop using smooth lerp (linear interpolation)
  function updatePhysics() {
    const damping = isHovered ? 0.14 : 0.08;

    // Lerp coordinates
    currentX += (targetX - currentX) * damping;
    currentY += (targetY - currentY) * damping;

    // Lerp tilt
    currentTiltX += (targetTiltX - currentTiltX) * damping;
    currentTiltY += (targetTiltY - currentTiltY) * damping;

    // Audio reactive pulse if music is playing
    let audioBoost = 1.0;
    if (window.isAudioPlaying && window.audioFrequencyData) {
      // Bass frequency average (bins 1-4)
      const bass = (window.audioFrequencyData[1] + window.audioFrequencyData[2] + window.audioFrequencyData[3]) / (3 * 255);
      audioBoost = 1.0 + bass * 0.18;
    }

    // Apply CSS variables for mask coordinates
    viewport.style.setProperty('--mask-x', `${currentX.toFixed(2)}%`);
    viewport.style.setProperty('--mask-y', `${currentY.toFixed(2)}%`);
    
    const baseRadius = 140;
    const finalRadius = Math.round(baseRadius * audioBoost);
    viewport.style.setProperty('--mask-radius', `${finalRadius}px`);

    // Apply 3D perspective tilt to the outer card
    if (isHovered || Math.abs(currentTiltX) > 0.05 || Math.abs(currentTiltY) > 0.05) {
      card.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    } else {
      card.style.transform = '';
    }

    animFrameId = requestAnimationFrame(updatePhysics);
  }

  // Event Listeners
  viewport.addEventListener('mouseenter', handlePointerEnter);
  viewport.addEventListener('mousemove', handlePointerMove);
  viewport.addEventListener('mouseleave', handlePointerLeave);

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

  // Click / tap toggle for mobile
  viewport.addEventListener('click', (e) => {
    handlePointerMove(e);
  });

  // Start animation loop
  animFrameId = requestAnimationFrame(updatePhysics);

  // Scroll collapse controller: When user scrolls, collapse 3D model and reveal details
  const scrollThreshold = 35;
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
  // Initial state check
  handleScroll();

  // Scroll prompt button click to smoothly collapse 3D model & reveal details
  const scrollPrompt = document.getElementById('hero-scroll-prompt');
  scrollPrompt?.addEventListener('click', () => {
    const targetY = Math.min(320, window.innerHeight * 0.42);
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
