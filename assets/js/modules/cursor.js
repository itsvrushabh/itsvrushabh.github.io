/**
 * OMARCHY CYBERNETIC CURSOR & CROSSHAIR MODULE
 * Smooth reactive ambient cursor tracker with interactive magnetic snap
 */

export function initCyberCursor() {
  if (typeof window === 'undefined') return;

  // Only enable on precise pointer devices (desktop mouse/trackpad, not touch)
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;

  // Avoid duplicate creation
  if (document.getElementById('omarchy-cursor')) return;

  const cursorRing = document.createElement('div');
  cursorRing.id = 'omarchy-cursor';
  cursorRing.className = 'omarchy-cursor';
  cursorRing.setAttribute('aria-hidden', 'true');

  const cursorDot = document.createElement('div');
  cursorDot.id = 'omarchy-cursor-dot';
  cursorDot.className = 'omarchy-cursor-dot';
  cursorDot.setAttribute('aria-hidden', 'true');

  document.body.appendChild(cursorRing);
  document.body.appendChild(cursorDot);

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isHovering = false;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorRing.classList.add('cursor-visible');
      cursorDot.classList.add('cursor-visible');
      ringX = mouseX;
      ringY = mouseY;
    }

    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  window.addEventListener('mousedown', () => {
    cursorRing.classList.add('cursor-click');
    cursorDot.classList.add('cursor-click');
  });

  window.addEventListener('mouseup', () => {
    cursorRing.classList.remove('cursor-click');
    cursorDot.classList.remove('cursor-click');
  });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorRing.classList.remove('cursor-visible');
    cursorDot.classList.remove('cursor-visible');
  });

  // Delegated hover detection for all interactive elements
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(
      'a, button, input, textarea, select, [role="button"], .project-card, .post-card, .mb-item, .hero-snippet, .card-tag, .tag-badge, .tui-dot, .theme-choice-card, .floating-shortcut-pill'
    );
    if (target) {
      if (!isHovering) {
        isHovering = true;
        cursorRing.classList.add('cursor-hover');
        cursorDot.classList.add('cursor-hover');
      }
    } else if (isHovering) {
      isHovering = false;
      cursorRing.classList.remove('cursor-hover');
      cursorDot.classList.remove('cursor-hover');
    }
  }, { passive: true });

  // Smooth RAF lag-free loop for the outer ring
  function renderCursor() {
    if (isVisible) {
      ringX += (mouseX - ringX) * 0.35;
      ringY += (mouseY - ringY) * 0.35;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    }
    requestAnimationFrame(renderCursor);
  }

  requestAnimationFrame(renderCursor);
}
