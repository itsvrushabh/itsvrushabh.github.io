/**
 * OMARCHY MENUBAR MODULE
 * Handles:
 * 1. Live system clock in topbar
 * 2. Terminal calendar popover (`cal`) & uptime tracking
 * 3. Hyprland-style floating workspace tooltip HUD
 */

export const siteStartTime = Date.now();

export function getUptimeString() {
  const s = Math.floor((Date.now() - siteStartTime) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s (active session)`;
}

export function initMenubarClock() {
  const clockEl = document.getElementById('menubar-datetime');
  if (!clockEl) return;
  const dateEl = clockEl.querySelector('.mb-clock-date');
  const timeEl = clockEl.querySelector('.mb-clock-time');

  function updateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    if (dateEl && timeEl) {
      dateEl.textContent = dateStr;
      timeEl.textContent = timeStr;
    } else {
      clockEl.textContent = `${dateStr} · ${timeStr}`;
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
}

export function initMenubarCalendar() {
  const trigger = document.getElementById('menubar-datetime');
  const popover = document.getElementById('menubar-calendar-popover');
  if (!trigger || !popover) return;

  const monthYearEl = document.getElementById('cal-month-year');
  const uptimeEl = document.getElementById('cal-uptime');
  const gridEl = document.getElementById('cal-days-grid');
  const timeLiveEl = document.getElementById('cal-time-live');

  function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();

    const monthName = now.toLocaleString('en-US', { month: 'long' });
    if (monthYearEl) monthYearEl.textContent = `${monthName} ${year}`;

    const uptimeSec = Math.floor((Date.now() - siteStartTime) / 1000);
    const uptimeMins = Math.floor(uptimeSec / 60);
    const uptimeHours = Math.floor(uptimeMins / 60);
    if (uptimeEl) {
      uptimeEl.textContent = uptimeHours > 0 ? `up ${uptimeHours}h ${uptimeMins % 60}m` : `up ${Math.max(1, uptimeMins)}m`;
    }

    if (timeLiveEl) {
      timeLiveEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }

    if (gridEl && (!gridEl.dataset.renderedMonth || gridEl.dataset.renderedMonth !== `${year}-${month}`)) {
      gridEl.dataset.renderedMonth = `${year}-${month}`;
      gridEl.innerHTML = '';

      const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      dayHeaders.forEach(d => {
        const h = document.createElement('div');
        h.className = 'cal-header-cell';
        h.textContent = d;
        gridEl.appendChild(h);
      });

      const firstDayIdx = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let e = 0; e < firstDayIdx; e++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day-cell empty';
        gridEl.appendChild(empty);
      }

      for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell';
        if (day === todayDate) cell.classList.add('cal-today');
        cell.textContent = day;
        gridEl.appendChild(cell);
      }
    }
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = popover.classList.toggle('open');
    trigger.classList.toggle('active', isOpen);
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) renderCalendar();
  });

  document.addEventListener('click', (e) => {
    if (!popover.contains(e.target) && !trigger.contains(e.target)) {
      popover.classList.remove('open');
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popover.classList.contains('open')) {
      popover.classList.remove('open');
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  setInterval(() => {
    if (popover.classList.contains('open')) {
      const now = new Date();
      const uptimeSec = Math.floor((Date.now() - siteStartTime) / 1000);
      const uptimeMins = Math.floor(uptimeSec / 60);
      const uptimeHours = Math.floor(uptimeMins / 60);
      if (uptimeEl) {
        uptimeEl.textContent = uptimeHours > 0 ? `up ${uptimeHours}h ${uptimeMins % 60}m` : `up ${Math.max(1, uptimeMins)}m`;
      }
      if (timeLiveEl) {
        timeLiveEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
      }
    }
  }, 1000);
}

export function initWorkspaceHUD() {
  const hud = document.getElementById('mb-workspace-hud');
  if (!hud) return;
  const hudNum = hud.querySelector('.hud-num');
  const hudName = hud.querySelector('.hud-name');

  const items = document.querySelectorAll('.menubar-left .mb-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const num = item.dataset.wsNum;
      const name = item.dataset.wsName;
      if (hudNum) hudNum.textContent = num ? `[${num}]` : `[~]`;
      if (hudName) hudName.textContent = name || 'Workspace';

      const rect = item.getBoundingClientRect();
      hud.style.left = `${Math.max(8, rect.left)}px`;
      hud.classList.add('visible');
    });

    item.addEventListener('mouseleave', () => {
      hud.classList.remove('visible');
    });
  });
}
