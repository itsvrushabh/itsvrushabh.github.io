/**
 * OMARCHY GLOBAL SHORTCUTS & MODAL MODULE
 */
import { openCommandPalette, closeCommandPalette } from './palette.js';
import { cycleTheme, setTheme, showToastNotice } from './theme.js';
import { toggleSFX } from './sfx.js';
import { toggleMusic } from './audio.js';

export function openShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) {
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
  }
}

export function closeShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
  }
}

export function openThemePickerModal() {
  const modal = document.getElementById('theme-picker-modal');
  if (modal) {
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    const input = document.getElementById('theme-search-input');
    if (input) {
      input.value = '';
      filterThemesInModal('');
      setTimeout(() => input.focus(), 60);
    }
  }
}

export function closeThemePickerModal() {
  const modal = document.getElementById('theme-picker-modal');
  if (modal) {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
  }
}

export function filterThemesInModal(query) {
  const q = (query || '').toLowerCase().trim();
  const cards = document.querySelectorAll('#theme-picker-grid .theme-choice-card');
  cards.forEach(card => {
    const name = card.dataset.themeName || '';
    const id = card.dataset.themeChoice || '';
    const mode = card.dataset.themeMode || '';
    const matches = !q || name.includes(q) || id.includes(q) || mode.includes(q);
    card.style.display = matches ? '' : 'none';
  });
}

export function initShortcuts() {
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
      closeThemePickerModal();
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

    // Handle 'H' / 'h' or 'V' / 'v' to toggle 3D helmet visor reveal (unless in terminal input)
    if ((e.key === 'h' || e.key === 'H' || e.key === 'v' || e.key === 'V') && document.activeElement.id !== 'tui-input' && !gPressed) {
      const viewport = document.getElementById('hero-3d-viewport');
      if (viewport) {
        e.preventDefault();
        viewport.click();
        return;
      }
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
        '4': { section: null, url: '/contact/' },
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
    themeBtn.addEventListener('click', (e) => {
      if (e.shiftKey || e.altKey) {
        cycleTheme();
      } else {
        openThemePickerModal();
      }
    });
  }

  // Open theme picker triggers
  document.querySelectorAll('[data-open-themes]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openThemePickerModal();
    });
  });

  // Close theme picker triggers
  document.querySelectorAll('[data-close-themes]').forEach(el => {
    el.addEventListener('click', closeThemePickerModal);
  });

  // Theme search filter input
  const themeSearchInput = document.getElementById('theme-search-input');
  if (themeSearchInput) {
    themeSearchInput.addEventListener('input', e => {
      filterThemesInModal(e.target.value);
    });
  }

  // Theme picker chips
  document.querySelectorAll('[data-theme-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = btn.dataset.themeChoice;
      setTheme(chosen, true);
    });
  });

  // Quick copy snippet in hero
  const copyBtn = document.getElementById('copy-install-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const snippet = copyBtn.dataset.snippet || 'curl -sL https://itsvrushabh.github.io/cli';
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
}
