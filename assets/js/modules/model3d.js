/**
 * OMARCHY HERO MODEL & SCROLL CONTROLLER
 * Static clean hero display with scroll-driven reveal mechanics.
 * 3D perspective tilt, water ripples, and hover animations removed.
 */

export function init3DModelViewer() {
  const viewport = document.getElementById('hero-3d-viewport');
  const baseLayer = document.getElementById('h3d-base-layer');

  if (!viewport && !baseLayer) return;

  // Scroll collapse controller: When user scrolls, collapse hero model and reveal details
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

  // Scroll prompt button click to smoothly scroll down and reveal details
  const scrollPrompt = document.getElementById('hero-scroll-prompt');
  scrollPrompt?.addEventListener('click', () => {
    const targetY = Math.min(window.innerHeight * 0.85, 680);
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  });
}
