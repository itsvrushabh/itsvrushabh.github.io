/**
 * OMARCHY AMBIENT AUDIO ENGINE (Multi-Track)
 * Tracks: Kevin Koontz & 33 Max Verstappen
 * Features: Web Audio API analyser, real-time beat sync, seek scrubber, volume control, auto-next playback
 */
import { showToastNotice } from './theme.js';

let audioInstance = null;
export let isAudioPlaying = false;

export const TRACKS = {
  kevin: {
    src: '/assets/audio/kevin_koontz-we_can_fix_everything.mp3',
    title: 'We Can Fix Everything',
    artist: 'Kevin Koontz · Omarchy OST',
    art: '/assets/images/kevin_koontz.webp',
    artAlt: 'Kevin Koontz Album Art',
    bpm: 112,
    toast: '▶ Kevin Koontz – We Can Fix Everything'
  },
  max: {
    src: '/assets/audio/33_max_verstappen.mp3',
    title: '33 Max Verstappen',
    artist: 'Carte Blanq · Maxx Power · Nils van Zandt',
    art: null, // F1 helmet emoji fallback
    artAlt: '33 Max Verstappen',
    bpm: 130,
    toast: '▶ 33 Max Verstappen – Tu-tu-du-du 🏎️'
  }
};

export let currentTrack = 'kevin';

export function getAudio() {
  if (!audioInstance) {
    audioInstance = new Audio();
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
    audioInstance.loop = false;
    audioInstance.preload = 'metadata';
    audioInstance.src = TRACKS[currentTrack].src;

    // Auto-play next track when track finishes
    audioInstance.addEventListener('ended', () => {
      const trackKeys = Object.keys(TRACKS);
      const nextIdx = (trackKeys.indexOf(currentTrack) + 1) % trackKeys.length;
      const nextId = trackKeys[nextIdx];
      switchTrack(nextId);
      playMusic();
    });

    audioInstance.addEventListener('error', () => {
      console.warn('Audio load failed. Retrying without crossOrigin.');
      audioInstance.removeAttribute('crossOrigin');
      audioInstance.load();
    });

    const seek = document.getElementById('music-seek');
    const currTimeEl = document.getElementById('music-curr-time');
    const durationEl = document.getElementById('music-duration');
    const volBar = document.getElementById('music-volume');
    const volBtn = document.getElementById('music-vol-btn');

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

    if (volBar) {
      audioInstance.volume = parseFloat(volBar.value) || 0.8;
      volBar.addEventListener('input', () => {
        audioInstance.volume = parseFloat(volBar.value);
      });
    }

    if (volBtn) {
      volBtn.addEventListener('click', () => {
        if (audioInstance.volume > 0) {
          audioInstance.dataset.savedVol = audioInstance.volume;
          audioInstance.volume = 0;
          if (volBar) volBar.value = 0;
        } else {
          const restored = parseFloat(audioInstance.dataset.savedVol) || 0.8;
          audioInstance.volume = restored;
          if (volBar) volBar.value = restored;
        }
      });
    }
  }
  return audioInstance;
}

export function applyTrackMeta(trackId) {
  const t = TRACKS[trackId];
  const titleEl = document.getElementById('music-track-title');
  const artistEl = document.getElementById('music-track-artist');
  const artEl = document.getElementById('music-art-img');

  if (titleEl) titleEl.textContent = t.title;
  if (artistEl) artistEl.textContent = t.artist;
  if (artEl) {
    if (t.art) {
      artEl.src = t.art;
      artEl.alt = t.artAlt;
      artEl.style.fontSize = '';
      artEl.style.display = 'block';
    } else {
      artEl.style.display = 'none';
      const btn = document.querySelector('.music-art-btn');
      if (btn && !btn.querySelector('.music-emoji-art')) {
        const em = document.createElement('span');
        em.className = 'music-emoji-art';
        em.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;z-index:1;';
        em.textContent = '🏎️';
        btn.insertBefore(em, btn.querySelector('.music-play-overlay'));
      }
    }
  }

  if (t.art) {
    const em = document.querySelector('.music-emoji-art');
    if (em) em.remove();
  }

  document.querySelectorAll('.music-track-btn').forEach(b => {
    const isActive = b.dataset.track === trackId;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  window.currentTrackBPM = t.bpm;
}

export function switchTrack(trackId) {
  if (!TRACKS[trackId] || trackId === currentTrack) return;
  const wasPlaying = isAudioPlaying;
  currentTrack = trackId;

  const audio = getAudio();
  const wasPaused = audio.paused;
  audio.pause();
  audio.currentTime = 0;
  audio.src = TRACKS[trackId].src;

  applyTrackMeta(trackId);

  if (wasPlaying || !wasPaused) {
    audio.play().then(() => {
      updateMusicUI(true);
      showToastNotice(TRACKS[trackId].toast);
    }).catch(() => {
      updateMusicUI(false);
    });
  } else {
    updateMusicUI(false);
  }
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
    showToastNotice('Click music button to enable sound');
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

  // Wire track switcher buttons
  document.querySelectorAll('.music-track-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trackId = btn.dataset.track;
      if (trackId && trackId !== currentTrack) {
        switchTrack(trackId);
      }
    });
  });

  // Set initial track metadata
  applyTrackMeta(currentTrack);
  window.currentTrackBPM = TRACKS[currentTrack].bpm;
}
