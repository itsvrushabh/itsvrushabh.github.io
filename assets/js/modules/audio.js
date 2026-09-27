/**
 * OMARCHY AMBIENT AUDIO ENGINE (33 Max Verstappen)
 * Track: 33 Max Verstappen (Carte Blanq · Maxx Power · Nils van Zandt)
 * Features: Web Audio API analyser, real-time beat sync, seek scrubber, shortcut keybinding (M)
 */
import { showToastNotice } from './theme.js';

let audioInstance = null;
export let isAudioPlaying = false;

export const TRACKS = {
  max: {
    src: '/assets/audio/33_max_verstappen.mp3',
    title: '33 Max Verstappen',
    artist: 'Carte Blanq · Maxx Power · Nils van Zandt',
    art: null, // F1 helmet emoji
    artAlt: '33 Max Verstappen',
    bpm: 130,
    toast: '▶ 33 Max Verstappen – Tu-tu-du-du 🏎️'
  }
};

export let currentTrack = 'max';

export function getAudio() {
  if (!audioInstance) {
    audioInstance = new Audio();
    window.audioInstance = audioInstance;
    audioInstance.crossOrigin = 'anonymous';

    // Setup Web Audio API Analyser for real-time visualizer
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !window.audioContext) {
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;
        const source = audioCtx.createMediaElementSource(audioInstance);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        window.audioAnalyser = analyser;
        window.audioContext = audioCtx;
        window.audioFrequencyData = new Uint8Array(analyser.frequencyBinCount);
      }
    } catch (e) {
      console.warn('Web Audio API not supported or restricted:', e);
    }

    audioInstance.loop = true;
    audioInstance.volume = 0.85;
    audioInstance.preload = 'metadata';
    audioInstance.src = TRACKS[currentTrack].src;

    audioInstance.addEventListener('error', () => {
      console.warn('Audio load failed. Retrying without crossOrigin.');
      audioInstance.removeAttribute('crossOrigin');
      audioInstance.load();
    });

    const seek = document.getElementById('music-seek');
    const currTimeEl = document.getElementById('music-curr-time');
    const durationEl = document.getElementById('music-duration');

    audioInstance.addEventListener('timeupdate', () => {
      if (audioInstance.duration) {
        const progress = (audioInstance.currentTime / audioInstance.duration) * 100;
        if (seek && !seek.dataset.seeking) seek.value = progress;
        if (currTimeEl) currTimeEl.textContent = formatAudioTime(audioInstance.currentTime);
        if (durationEl) durationEl.textContent = formatAudioTime(audioInstance.duration);
      }
    });

    audioInstance.addEventListener('loadedmetadata', () => {
      if (durationEl) durationEl.textContent = formatAudioTime(audioInstance.duration);
    });

    if (seek) {
      seek.addEventListener('input', () => {
        seek.dataset.seeking = 'true';
        if (audioInstance.duration) {
          const t = (seek.value / 100) * audioInstance.duration;
          if (currTimeEl) currTimeEl.textContent = formatAudioTime(t);
        }
      });
      seek.addEventListener('change', () => {
        seek.dataset.seeking = '';
        if (audioInstance.duration) {
          audioInstance.currentTime = (seek.value / 100) * audioInstance.duration;
        }
      });
    }
  }
  return audioInstance;
}

export function formatAudioTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export function updateMusicUI(playing) {
  isAudioPlaying = playing;
  window.isAudioPlaying = playing;
  if (playing && window.audioContext && window.audioContext.state === 'suspended') {
    window.audioContext.resume();
  }
  const playerEl = document.getElementById('omarchy-music-player');
  const iconPlay = document.getElementById('music-overlay-icon-play');
  const iconPause = document.getElementById('music-overlay-icon-pause');
  const headSoundOff = document.getElementById('header-sound-off-icon');
  const headSoundOn = document.getElementById('header-sound-on-icon');
  const headerEqBars = document.getElementById('header-eq-bars');

  if (playerEl) playerEl.classList.toggle('playing', playing);
  if (iconPlay) iconPlay.style.display = playing ? 'none' : 'block';
  if (iconPause) iconPause.style.display = playing ? 'block' : 'none';
  if (headSoundOff) headSoundOff.style.display = playing ? 'none' : 'block';
  if (headSoundOn) headSoundOn.style.display = playing ? 'block' : 'none';
  if (headerEqBars) headerEqBars.classList.toggle('active', playing);
  if (!playing) {
    document.querySelectorAll('#omarchy-music-player .eq-bar').forEach(bar => {
      bar.style.height = '3px';
    });
  }
}

export function playMusic() {
  const audio = getAudio();
  audio.play().then(() => {
    updateMusicUI(true);
    showToastNotice(TRACKS[currentTrack].toast);
  }).catch(err => {
    console.warn('User gesture required to play audio:', err);
    showToastNotice('Press M or click music button to enable sound');
  });
  return true;
}

export function pauseMusic() {
  const audio = getAudio();
  audio.pause();
  updateMusicUI(false);
  showToastNotice('❚❚ Sound off');
  return false;
}

export function toggleMusic() {
  const audio = getAudio();
  if (audio.paused) {
    return playMusic();
  } else {
    return pauseMusic();
  }
}

export function initMusicPlayer() {
  const playBtn = document.getElementById('music-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', toggleMusic);
  }
  const headerToggle = document.getElementById('header-music-toggle');
  if (headerToggle) {
    headerToggle.addEventListener('click', toggleMusic);
  }

  window.currentTrackBPM = TRACKS.max.bpm;
}
