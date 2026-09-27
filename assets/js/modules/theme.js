/**
 * OMARCHY THEMES MODULE
 * Handles 22 official Omarchy themes, persistence, toast feedback, and family mapping.
 */

export const OMARCHY_THEMES = [
  'catppuccin-latte',
  'catppuccin',
  'ethereal',
  'everforest',
  'flexoki-light',
  'gruvbox',
  'hackerman',
  'kanagawa',
  'last-horizon',
  'lumon',
  'lupine',
  'matte-black',
  'miasma',
  'nord',
  'osaka-jade',
  'retro-82',
  'ristretto',
  'rose-pine',
  'solitude',
  'tokyo-night',
  'vantablack',
  'white'
];

export const THEMES = OMARCHY_THEMES;

export let currentTheme = localStorage.getItem('omarchy-site-theme') || 'tokyo-night';
if (!OMARCHY_THEMES.includes(currentTheme)) {
  currentTheme = 'tokyo-night';
}
window.currentTheme = currentTheme;

export function getCurrentTheme() {
  return currentTheme;
}

export function getThemeFamily(t) {
  if (['hackerman', 'retro-82'].includes(t)) return 'matrix';
  if (['gruvbox', 'everforest', 'miasma', 'ristretto'].includes(t)) return 'contour';
  if (['matte-black', 'vantablack', 'solitude'].includes(t)) return 'sonar';
  if (['nord', 'catppuccin-latte', 'flexoki-light', 'white', 'lumon'].includes(t)) return 'frost';
  if (['kanagawa', 'osaka-jade'].includes(t)) return 'wave';
  return 'neon'; // tokyo-night, catppuccin, rose-pine, ethereal, last-horizon, lupine
}

export function setTheme(themeName, showToast = true) {
  if (!OMARCHY_THEMES.includes(themeName)) return;
  currentTheme = themeName;
  window.currentTheme = themeName;
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

export function cycleTheme() {
  const idx = OMARCHY_THEMES.indexOf(currentTheme);
  const nextIdx = (idx + 1) % OMARCHY_THEMES.length;
  setTheme(OMARCHY_THEMES[nextIdx], true);
}

export function formatThemeName(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

let toastTimeout;
export function showToastNotice(msg) {
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
