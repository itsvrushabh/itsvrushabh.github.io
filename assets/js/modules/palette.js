/**
 * OMARCHY COMMAND PALETTE (Wofi / Ctrl+K / Super+Space)
 */
import { setTheme } from './theme.js';
import { toggleSFX, playKeyClick } from './sfx.js';
import { toggleMusic, playMusic, pauseMusic } from './audio.js';

export const PALETTE_COMMANDS = [
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
  { id: 'music-toggle', label: 'Toggle Background Music (Kevin Koontz / Max Verstappen)', category: 'Media', icon: '🎵', action: () => toggleMusic() },
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

export function openCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('palette-input');
  if (!modal || !input) return;

  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
  input.value = '';
  filterPalette('');
  setTimeout(() => input.focus(), 50);
}

export function closeCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  if (modal) {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
  }
}

export function filterPalette(query) {
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

export function renderPaletteResults() {
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

export function updateSelectedPaletteItem() {
  const items = document.querySelectorAll('#palette-results .palette-item');
  items.forEach((item, idx) => {
    item.classList.toggle('selected', idx === selectedPaletteIndex);
  });
}

export function scrollSelectedIntoView() {
  const selected = document.querySelector('#palette-results .palette-item.selected');
  if (selected) {
    selected.scrollIntoView({ block: 'nearest' });
  }
}

export function initCommandPalette() {
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
