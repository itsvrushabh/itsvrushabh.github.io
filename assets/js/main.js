/**
 * OMARCHY RUNTIME & CORE SUITE
 * Main Application Entry Point
 *
 * Modular ES Architecture:
 * - modules/theme.js     : 22 themes, switching, local storage persistence
 * - modules/canvas.js    : Audio reactive WebGL/2D canvas ambient animations
 * - modules/sfx.js       : Web Audio mechanical typing & UI sounds
 * - modules/menubar.js   : Topbar live clock, uptime, calendar popover, workspace HUD
 * - modules/audio.js     : Ambient synthwave & techno audio player engine
 * - modules/palette.js   : Command palette (Ctrl+K / Super+Space)
 * - modules/shortcuts.js : Global keyboard shortcuts & modal cheatsheet
 * - modules/terminal.js  : Wayland TUI interactive terminal emulator
 * - modules/stats.js     : Live GitHub repo stars & commits stats fetcher
 * - modules/widgets.js   : Interactive playgrounds (Neovim, WASM, Architecture, Memory, Raft, Shaders)
 */

import {
  currentTheme,
  setTheme,
  cycleTheme,
  getThemeFamily,
  formatThemeName,
  showToastNotice,
  THEMES
} from './modules/theme.js';

import {
  initBackgroundCanvas
} from './modules/canvas.js';

import {
  initSFX,
  toggleSFX,
  updateSFXButton,
  playKeyClick,
  playWindowSnap,
  playThemeChime
} from './modules/sfx.js';

import {
  initMenubarClock,
  initMenubarCalendar,
  initWorkspaceHUD,
  siteStartTime,
  getUptimeString
} from './modules/menubar.js';

import {
  initMusicPlayer,
  toggleMusic,
  playMusic,
  pauseMusic,
  switchTrack,
  TRACKS,
  isAudioPlaying
} from './modules/audio.js';

import {
  initCommandPalette,
  openCommandPalette,
  closeCommandPalette
} from './modules/palette.js';

import {
  initShortcuts,
  openShortcutsModal,
  closeShortcutsModal
} from './modules/shortcuts.js';

import { initTUI } from './modules/terminal.js';
import { initGitHubStats } from './modules/stats.js';

import {
  initNeovimPlayground,
  initWasmPlayground,
  initArchitectureExplorer,
  initSnippetSwitcher,
  initMemoryProfiler,
  initRaftMesh,
  initShaderSandbox,
  initWidgets
} from './modules/widgets.js';

// =========================================================================
// GLOBAL PUBLIC API (window.omarchy)
// =========================================================================
window.omarchy = {
  setTheme,
  cycleTheme,
  currentTheme,
  toggleMusic,
  playMusic,
  pauseMusic,
  toggleSFX,
  openCommandPalette,
  closeCommandPalette,
  openShortcutsModal,
  closeShortcutsModal,
  getUptimeString,
  showToastNotice
};

// =========================================================================
// APPLICATION INITIALIZATION
// =========================================================================
function initOmarchyApp() {
  // 1. Initial theme load
  setTheme(currentTheme, false);

  // 2. Audio-reactive canvas background
  initBackgroundCanvas();

  // 3. TUI terminal
  initTUI();

  // 4. Global keyboard shortcuts
  initShortcuts();

  // 5. Audio engine & player
  initMusicPlayer();

  // 6. Command palette
  initCommandPalette();

  // 7. Interactive widgets & playgrounds
  initWidgets();

  // 8. GitHub dynamic stats
  initGitHubStats();

  // 9. Sound FX button
  updateSFXButton();
  document.getElementById('sfx-toggle-btn')?.addEventListener('click', toggleSFX);

  // 10. Topbar Menubar Clock, Calendar popover, and Workspace HUD
  initMenubarClock();
  initMenubarCalendar();
  initWorkspaceHUD();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOmarchyApp);
} else {
  initOmarchyApp();
}

// Re-export modules for external consumption
export {
  THEMES,
  currentTheme,
  setTheme,
  cycleTheme,
  getThemeFamily,
  formatThemeName,
  showToastNotice,
  initBackgroundCanvas,
  initSFX,
  toggleSFX,
  updateSFXButton,
  playKeyClick,
  playWindowSnap,
  playThemeChime,
  initMenubarClock,
  initMenubarCalendar,
  initWorkspaceHUD,
  siteStartTime,
  getUptimeString,
  TRACKS,
  isAudioPlaying,
  initMusicPlayer,
  toggleMusic,
  playMusic,
  pauseMusic,
  switchTrack,
  initCommandPalette,
  openCommandPalette,
  closeCommandPalette,
  initShortcuts,
  openShortcutsModal,
  closeShortcutsModal,
  initTUI,
  initGitHubStats,
  initNeovimPlayground,
  initWasmPlayground,
  initArchitectureExplorer,
  initSnippetSwitcher,
  initMemoryProfiler,
  initRaftMesh,
  initShaderSandbox,
  initWidgets
};
