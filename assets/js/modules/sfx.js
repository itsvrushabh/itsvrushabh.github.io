/**
 * OMARCHY MECHANICAL AUDIO & SFX ENGINE (Web Audio API)
 */
import { showToastNotice } from './theme.js';

let sfxAudioCtx = null;
let sfxEnabled = localStorage.getItem('omarchy_sfx_enabled') !== 'false';

export function initSFX() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx && !sfxAudioCtx) {
      sfxAudioCtx = new AudioCtx();
    }
    if (sfxAudioCtx && sfxAudioCtx.state === 'suspended') {
      sfxAudioCtx.resume();
    }
  } catch (e) {
    console.warn('Web Audio SFX not available:', e);
  }
}

export function toggleSFX() {
  sfxEnabled = !sfxEnabled;
  localStorage.setItem('omarchy_sfx_enabled', sfxEnabled);
  updateSFXButton();
  showToastNotice(sfxEnabled ? 'Mechanical Audio Feedback: ENABLED' : 'Mechanical Audio Feedback: MUTED');
  if (sfxEnabled) {
    playKeyClick();
  }
}

export function updateSFXButton() {
  const btn = document.getElementById('sfx-toggle-btn');
  if (btn) {
    btn.classList.toggle('active', sfxEnabled);
    btn.style.opacity = sfxEnabled ? '1' : '0.4';
    btn.title = sfxEnabled ? 'Mechanical Typing Audio: ON (Press S)' : 'Mechanical Typing Audio: OFF (Press S)';
  }
}

export function playKeyClick() {
  if (!sfxEnabled) return;
  initSFX();
  if (!sfxAudioCtx) return;

  try {
    const t = sfxAudioCtx.currentTime;
    const osc = sfxAudioCtx.createOscillator();
    const gain = sfxAudioCtx.createGain();
    const filter = sfxAudioCtx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = 1400 + Math.random() * 500;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 + Math.random() * 80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.03);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxAudioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  } catch (e) {}
}

export function playWindowSnap() {
  if (!sfxEnabled) return;
  initSFX();
  if (!sfxAudioCtx) return;

  try {
    const t = sfxAudioCtx.currentTime;
    const osc = sfxAudioCtx.createOscillator();
    const gain = sfxAudioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc.connect(gain);
    gain.connect(sfxAudioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  } catch (e) {}
}

export function playThemeChime() {
  if (!sfxEnabled) return;
  initSFX();
  if (!sfxAudioCtx) return;

  try {
    const t = sfxAudioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = sfxAudioCtx.createOscillator();
      const gain = sfxAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.035);
      gain.gain.setValueAtTime(0.04, t + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.035 + 0.12);
      osc.connect(gain);
      gain.connect(sfxAudioCtx.destination);
      osc.start(t + idx * 0.035);
      osc.stop(t + idx * 0.035 + 0.12);
    });
  } catch (e) {}
}

let lastHoverSoundTime = 0;

export function playHoverTick() {
  if (!sfxEnabled) return;
  const now = performance.now();
  if (now - lastHoverSoundTime < 45) return;
  lastHoverSoundTime = now;

  initSFX();
  if (!sfxAudioCtx) return;

  try {
    const t = sfxAudioCtx.currentTime;
    const osc = sfxAudioCtx.createOscillator();
    const gain = sfxAudioCtx.createGain();
    const filter = sfxAudioCtx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1750, t);
    filter.Q.value = 3.0;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.015);

    gain.gain.setValueAtTime(0.016, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxAudioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.015);
  } catch (e) {}
}

export function initHoverSFX() {
  if (typeof window === 'undefined') return;
  document.addEventListener('mouseover', (e) => {
    if (!sfxEnabled) return;
    const interactive = e.target.closest(
      '.btn-omarchy-primary, .btn-omarchy-secondary, .btn, .mb-item, .tui-cmd-btn, .snippet-tab-btn, .hero-snippet, .filter-btn, .project-card, .post-card, .card-link, .theme-choice-card, .neovim-tab, .neovim-run-btn, .neovim-copy-btn, .floating-shortcut-pill, .omarchy-back-btn, .toc-link, .copy-code-btn, .share-btn'
    );
    if (interactive) {
      playHoverTick();
    }
  }, { passive: true });
}

