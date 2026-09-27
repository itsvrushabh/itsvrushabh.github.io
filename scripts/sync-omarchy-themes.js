#!/usr/bin/env node
/**
 * ==============================================================================
 * OMARCHY // UPSTREAM THEME SYNCHRONIZATION BOT
 * ==============================================================================
 * Fetches the latest official themes & color definitions from basecamp/omarchy
 * and generates _data/themes.json, updates assets/js/modules/theme.js,
 * and maintains assets/css/omarchy-themes.css.
 *
 * Usage:
 *   node scripts/sync-omarchy-themes.js
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const UPSTREAM_REPO = 'basecamp/omarchy';
const UPSTREAM_BRANCH = 'quattro';
const BASE_RAW_URL = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${UPSTREAM_BRANCH}/themes`;
const API_URL = `https://api.github.com/repos/${UPSTREAM_REPO}/contents/themes?ref=${UPSTREAM_BRANCH}`;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'itsvrushabh-omarchy-theme-bot'
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    https.get(url, { headers }, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'itsvrushabh-omarchy-theme-bot' } }, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseToml(tomlStr) {
  const result = {};
  const lines = tomlStr.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']([^"']+)["']/);
    if (match) {
      result[match[1]] = match[2];
    }
  }
  return result;
}

function formatThemeName(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Rose', 'Rosé');
}

async function run() {
  console.log(`\x1b[1;36mFetching official Omarchy themes from ${UPSTREAM_REPO} (${UPSTREAM_BRANCH})...\x1b[0m`);

  let themeSlugs = [];
  try {
    const contents = await fetchJson(API_URL);
    themeSlugs = contents
      .filter(item => item.type === 'dir' && !item.name.startsWith('.'))
      .map(item => item.name);
    console.log(`Found ${themeSlugs.length} themes via GitHub Contents API.`);
  } catch (err) {
    console.warn(`Contents API failed (${err.message}). Using fallback theme list.`);
    themeSlugs = [
      'tokyo-night', 'catppuccin', 'gruvbox', 'nord', 'everforest', 'rose-pine',
      'hackerman', 'kanagawa', 'matte-black', 'solitude', 'lumon', 'retro-82',
      'miasma', 'osaka-jade', 'last-horizon', 'ethereal', 'catppuccin-latte',
      'flexoki-light', 'lupine', 'ristretto', 'vantablack', 'white'
    ];
  }

  const themesData = [];
  for (const slug of themeSlugs) {
    const tomlUrl = `${BASE_RAW_URL}/${slug}/colors.toml`;
    try {
      const rawToml = await fetchText(tomlUrl);
      const parsed = parseToml(rawToml);
      themesData.push({
        id: slug,
        name: formatThemeName(slug),
        mode: parsed.mode || 'dark',
        accent: parsed.accent || '#9ece6a',
        background: parsed.background || '#1a1b26',
        dark_background: parsed.dark_background || parsed.background || '#13141c',
        lighter_background: parsed.lighter_background || '#24283b',
        foreground: parsed.foreground || '#c0caf5',
        bright_foreground: parsed.bright_foreground || parsed.foreground || '#ffffff',
        muted: parsed.muted || '#414868',
        selection: parsed.selection || '#292e42',
        green: parsed.green || parsed.accent || '#9ece6a',
        cyan: parsed.cyan || '#449dab',
        blue: parsed.blue || '#7aa2f7',
        magenta: parsed.magenta || '#ad8ee6',
        yellow: parsed.yellow || '#e0af68',
        red: parsed.red || '#f7768e'
      });
      console.log(`  ✓ Synced theme: ${slug}`);
    } catch (e) {
      console.warn(`  ! Could not fetch colors.toml for ${slug}: ${e.message}`);
    }
  }

  // 1. Write _data/themes.json
  const dataPath = path.resolve(__dirname, '..', '_data', 'themes.json');
  fs.writeFileSync(dataPath, JSON.stringify(themesData, null, 2) + '\n', 'utf8');
  console.log(`\x1b[32m✓ Updated ${dataPath} (${themesData.length} themes)\x1b[0m`);

  // 2. Update assets/js/modules/theme.js
  const themeJsPath = path.resolve(__dirname, '..', 'assets', 'js', 'modules', 'theme.js');
  if (fs.existsSync(themeJsPath)) {
    let content = fs.readFileSync(themeJsPath, 'utf8');
    const slugList = themesData.map(t => `  '${t.id}'`).join(',\n');
    const regex = /export const OMARCHY_THEMES = \[[^\]]*\];/;
    const replacement = `export const OMARCHY_THEMES = [\n${slugList}\n];`;
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      fs.writeFileSync(themeJsPath, content, 'utf8');
      console.log(`\x1b[32m✓ Updated OMARCHY_THEMES array in ${themeJsPath}\x1b[0m`);
    }
  }

  // 3. Generate updated CSS rules in assets/css/omarchy-themes.css
  const themesCssPath = path.resolve(__dirname, '..', 'assets', 'css', 'omarchy-themes.css');
  let cssOutput = `/* ==========================================================================\n`;
  cssOutput += `   OMARCHY OFFICIAL THEMES (${themesData.length} THEMES - AUTO-SYNCED)\n`;
  cssOutput += `   ========================================================================== */\n\n`;

  // Base root default (tokyo-night)
  const defaultTheme = themesData.find(t => t.id === 'tokyo-night') || themesData[0];
  cssOutput += `:root {\n`;
  cssOutput += `  --t-bg-deep: ${defaultTheme.dark_background};\n`;
  cssOutput += `  --t-bg: ${defaultTheme.background};\n`;
  cssOutput += `  --t-surface: ${defaultTheme.dark_background};\n`;
  cssOutput += `  --t-surface-2: ${defaultTheme.lighter_background};\n`;
  cssOutput += `  --t-border-subtle: ${defaultTheme.lighter_background};\n`;
  cssOutput += `  --t-border-strong: ${defaultTheme.muted};\n`;
  cssOutput += `  --t-text: ${defaultTheme.bright_foreground};\n`;
  cssOutput += `  --t-text-secondary: ${defaultTheme.foreground};\n`;
  cssOutput += `  --t-text-muted: ${defaultTheme.muted};\n`;
  cssOutput += `  --t-brand: ${defaultTheme.green || defaultTheme.accent};\n`;
  cssOutput += `  --t-brand-soft: color-mix(in srgb, var(--t-brand) 15%, transparent);\n`;
  cssOutput += `  --t-brand-ink: #0c0e10;\n`;
  cssOutput += `  --t-selection: ${defaultTheme.selection};\n`;
  cssOutput += `  color-scheme: ${defaultTheme.mode};\n`;
  cssOutput += `}\n\n`;

  for (const t of themesData) {
    const isLight = t.mode === 'light';
    const brandColor = t.green || t.accent;
    cssOutput += `[data-theme="${t.id}"] {\n`;
    cssOutput += `  --t-bg-deep: ${t.dark_background};\n`;
    cssOutput += `  --t-bg: ${t.background};\n`;
    cssOutput += `  --t-surface: ${t.dark_background};\n`;
    cssOutput += `  --t-surface-2: ${t.lighter_background};\n`;
    cssOutput += `  --t-border-subtle: ${t.lighter_background};\n`;
    cssOutput += `  --t-border-strong: ${t.muted};\n`;
    cssOutput += `  --t-text: ${t.bright_foreground};\n`;
    cssOutput += `  --t-text-secondary: ${t.foreground};\n`;
    cssOutput += `  --t-text-muted: ${t.muted};\n`;
    cssOutput += `  --t-brand: ${brandColor};\n`;
    cssOutput += `  --t-brand-soft: color-mix(in srgb, ${brandColor} 16%, transparent);\n`;
    cssOutput += `  --t-brand-ink: ${isLight ? '#ffffff' : '#0c0e10'};\n`;
    cssOutput += `  --t-selection: ${t.selection};\n`;
    cssOutput += `  color-scheme: ${t.mode};\n`;
    cssOutput += `}\n\n`;
  }

  fs.writeFileSync(themesCssPath, cssOutput, 'utf8');
  console.log(`\x1b[32m✓ Generated complete theme rules in ${themesCssPath}\x1b[0m\n`);
}

run().catch(err => {
  console.error('\x1b[31mError during theme synchronization:\x1b[0m', err);
  process.exit(1);
});
