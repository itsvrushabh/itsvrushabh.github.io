#!/usr/bin/env node
/**
 * ==============================================================================
 * OMARCHY // SUITE: AUTOMATED WEBSITE INTEGRITY & E2E HTTP TESTS
 * ==============================================================================
 * Comprehensive pre-deployment test suite for itsvrushabh.github.io.
 * Validates generated static assets, HTML semantics, asset resolution,
 * Liquid template integrity, and live local HTTP server response codes.
 *
 * Usage:
 *   node tests/test-site.js
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const SITE_DIR = path.resolve(__dirname, '..', '_site');

// ANSI Color formatting
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, errorDetails = '') {
  if (condition) {
    passedTests++;
    console.log(`  ${GREEN}✓${RESET} ${testName}`);
  } else {
    failedTests++;
    const msg = errorDetails ? `${testName} -> ${errorDetails}` : testName;
    failures.push(msg);
    console.error(`  ${RED}✗${RESET} ${BOLD}${testName}${RESET}`);
    if (errorDetails) {
      console.error(`    ${RED}Details:${RESET} ${errorDetails}`);
    }
  }
}

console.log(`\n${BOLD}${CYAN}======================================================${RESET}`);
console.log(`${BOLD}${CYAN}  OMARCHY // PRE-DEPLOYMENT WEBSITE TEST SUITE       ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);

// -----------------------------------------------------------------------------
// 1. VERIFY _site DIRECTORY
// -----------------------------------------------------------------------------
console.log(`${BOLD}1. Validating Site Output Directory${RESET}`);
assert(fs.existsSync(SITE_DIR), 'Site output directory exists', `Expected directory at ${SITE_DIR}`);
if (!fs.existsSync(SITE_DIR)) {
  console.error(`\n${RED}Fatal: _site directory missing. Run 'jekyll build' first.${RESET}\n`);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// 2. VERIFY REQUIRED ROUTES & FILES
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}2. Validating Essential Routes & Files${RESET}`);
const REQUIRED_FILES = [
  'index.html',
  '404.html',
  'about/index.html',
  'blog/index.html',
  'projects/index.html',
  'resume/index.html',
  'cli/index.html',
  'contact/index.html',
  'feed.xml',
  'sitemap.xml',
  'site.webmanifest',
  'robots.txt',
  'omarchy.sh',
  'sw.js',
  'assets/css/main.css',
  'assets/js/main.js',
  'assets/js/modules/model3d.js',
  'assets/images/3D_model_v2.webp',
  'assets/images/3D_helmat_model_v2.webp',
  'assets/images/favicon.svg',
  'assets/audio/33_max_verstappen.mp3'
];

for (const relFile of REQUIRED_FILES) {
  const filePath = path.join(SITE_DIR, relFile);
  assert(fs.existsSync(filePath), `Required route/file: ${relFile}`, `Missing expected file: ${filePath}`);
}

// Verify obsolete Kevin Koontz song is absent
const oldSongPath = path.join(SITE_DIR, 'assets/audio/kevin_koontz-we_can_fix_everything.mp3');
assert(!fs.existsSync(oldSongPath), 'Obsolete Kevin Koontz song is absent');

function findFiles(dir, ext, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(fullPath, ext, results);
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

// -----------------------------------------------------------------------------
// 2.5 JAVASCRIPT ES MODULE IMPORT/EXPORT RESOLUTION
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}2.5 Validating JavaScript ES Module Imports & Exports${RESET}`);
const jsFiles = findFiles(path.join(SITE_DIR, 'assets/js'), '.js');
for (const jsFile of jsFiles) {
  const content = fs.readFileSync(jsFile, 'utf8');
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const symbols = match[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
    const importTarget = match[2];
    const resolvedPath = path.resolve(path.dirname(jsFile), importTarget);
    assert(fs.existsSync(resolvedPath), `Module target exists: ${importTarget} in ${path.basename(jsFile)}`);
    if (fs.existsSync(resolvedPath)) {
      const targetContent = fs.readFileSync(resolvedPath, 'utf8');
      for (const sym of symbols) {
        const hasExport = new RegExp(`export\\s+(const|let|function|class|var)\\s+${sym}\\b`).test(targetContent) ||
                          new RegExp(`export\\s*\\{[^}]*\\b${sym}\\b[^}]*\\}`).test(targetContent);
        assert(hasExport, `Symbol "${sym}" exported by ${path.basename(resolvedPath)} for ${path.basename(jsFile)}`, `Export missing in ${resolvedPath}`);
      }
    }
  }
}

// -----------------------------------------------------------------------------
// 3. RECURSIVE HTML SCAN: LIQUID LEAKS & SYNTAX ARTIFACTS
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}3. Scanning Generated HTML for Template Leakage${RESET}`);

const htmlFiles = findFiles(SITE_DIR, '.html');
assert(htmlFiles.length >= 7, `Discovered at least 7 generated HTML pages (found ${htmlFiles.length})`);

for (const htmlFile of htmlFiles) {
  const relPath = path.relative(SITE_DIR, htmlFile);
  const content = fs.readFileSync(htmlFile, 'utf8');

  // Check for raw Liquid tags
  const liquidTagMatch = content.match(/(\{[{%][^{}%]*[%}]\})/);
  assert(!liquidTagMatch, `No unrendered Liquid tags in ${relPath}`, liquidTagMatch ? `Found: ${liquidTagMatch[0]}` : '');

  // Check for Jekyll/Liquid error output
  const hasLiquidError = content.includes('Liquid error:');
  assert(!hasLiquidError, `No Liquid build errors in ${relPath}`, hasLiquidError ? 'Contains "Liquid error:" string' : '');

  // Skip doctype/title assertion for CLI ANSI terminal page
  const isCliEndpoint = relPath === 'cli/index.html' || relPath === 'cli.html';
  if (!isCliEndpoint) {
    // Check valid non-empty HTML structure
    assert(content.includes('<!DOCTYPE html>') || content.includes('<html'), `Valid HTML doctype/tag in ${relPath}`);
    assert(content.includes('<title>') && !content.includes('<title></title>'), `Non-empty <title> present in ${relPath}`);
  } else {
    assert(content.length > 50, `CLI ANSI endpoint ${relPath} contains terminal output`);
  }
}

// -----------------------------------------------------------------------------
// 4. CRITICAL DOM ELEMENTS IN INDEX.HTML
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}4. Validating Critical Homepage DOM Selectors${RESET}`);
const indexPath = path.join(SITE_DIR, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const CRITICAL_SELECTORS = [
  { id: 'hero-3d-viewport', desc: 'Hero Viewport container' },
  { id: 'h3d-base-layer', desc: 'Base Helmet layer img' },
  { id: 'hero-scroll-prompt', desc: 'Scroll prompt navigation button' },
  { id: 'omarchy-canvas', desc: 'Omarchy background canvas' },
  { id: 'home', desc: 'Home anchor section' },
  { id: 'terminal', desc: 'Interactive Omarchy TUI Terminal' },
  { id: 'projects', desc: 'Flagship Projects section' },
  { id: 'dispatches', desc: 'Latest Engineering Dispatches section' }
];

for (const item of CRITICAL_SELECTORS) {
  const regex = new RegExp(`id=["']${item.id}["']`);
  assert(regex.test(indexHtml), `Selector #${item.id} (${item.desc}) exists in index.html`);
}

// Ensure "Pick a theme, change everything" and themes section are absent
assert(!indexHtml.includes('Pick a theme, change everything'), '"Pick a theme, change everything" is absent from website');
assert(!indexHtml.includes('More Omarchy Themes'), '"More Omarchy Themes" link is absent from website');
assert(!indexHtml.includes('id="themes"'), 'Theme section container #themes is absent from index.html');

// Ensure "click to reveal face" badge and "hero-landing-sound" button are absent
assert(!indexHtml.includes('id="hero-landing-sound"'), 'Landing sound toggle #hero-landing-sound is absent from index.html');
assert(!indexHtml.includes('id="hero-helmet-badge"'), 'Helmet badge #hero-helmet-badge is absent from index.html');
assert(!indexHtml.includes('CLICK TO REVEAL FACE'), '"CLICK TO REVEAL FACE" text is absent from index.html');

// Ensure 3D effect animation layers and filters are absent
assert(!indexHtml.includes('id="h3d-reveal-layer"'), 'Animated 3D reveal layer is absent');
assert(!indexHtml.includes('id="h3d-sheen"'), '3D sheen layer is absent');
assert(!indexHtml.includes('id="h3d-water-canvas"'), 'Water ripple canvas is absent');
assert(!indexHtml.includes('water-ripple-filter'), 'Water ripple SVG filter is absent');

// Ensure static helmet image points to 3D_helmat_model_v2.webp
assert(indexHtml.includes('3D_helmat_model_v2.webp'), 'Base layer src points to 3D_helmat_model_v2.webp');

// Ensure no obsolete duplicate hero-3d-card wrapper
assert(!indexHtml.includes('id="hero-3d-card"'), 'Obsolete duplicate id="hero-3d-card" is absent');

// Ensure omarchy-themes.css is directly linked in <head> for fast theme application
assert(indexHtml.includes('/assets/css/omarchy-themes.css'), 'omarchy-themes.css is directly linked in index.html <head>');

// Ensure Back Navigation buttons exist on critical subpages
const SUBPAGES_WITH_BACK_BUTTON = ['projects/index.html', 'contact/index.html', 'resume/index.html', 'about/index.html', 'blog/index.html'];
for (const subpage of SUBPAGES_WITH_BACK_BUTTON) {
  const subHtml = fs.readFileSync(path.join(SITE_DIR, subpage), 'utf8');
  assert(subHtml.includes('omarchy-back-btn'), `Subpage ${subpage} includes .omarchy-back-btn`);
  assert(subHtml.includes('Back to Home'), `Subpage ${subpage} includes "Back to Home" label`);
  assert(subHtml.includes('/assets/css/omarchy-themes.css'), `Subpage ${subpage} includes omarchy-themes.css link`);
}

// -----------------------------------------------------------------------------
// 5. LOCAL ASSET INTEGRITY (Ensure referenced internal files exist on disk)
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}5. Verifying Local Asset References in HTML${RESET}`);
const assetRegex = /(?:src|href)=["'](\/assets\/[^"'#?]+|\.\.?\/assets\/[^"'#?]+)["']/g;
const missingAssets = new Set();
let checkedAssetCount = 0;

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  let match;
  while ((match = assetRegex.exec(content)) !== null) {
    let assetUrl = match[1];
    // Normalize to file path inside _site
    let cleanPath = assetUrl.replace(/^\.?\//, '');
    const diskPath = path.join(SITE_DIR, cleanPath);
    checkedAssetCount++;
    if (!fs.existsSync(diskPath)) {
      missingAssets.add(`${assetUrl} (referenced in ${path.relative(SITE_DIR, htmlFile)})`);
    }
  }
}

assert(missingAssets.size === 0, `All internal HTML assets exist on disk (checked ${checkedAssetCount} refs)`, Array.from(missingAssets).join(', '));

// -----------------------------------------------------------------------------
// 6. LIVE LOCAL HTTP SERVER & STATUS CODE TESTS
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}6. Testing Live HTTP Server & Response Codes${RESET}`);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.sh': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let parsedUrl = req.url.split('?')[0].split('#')[0];
  let safePath = path.normalize(parsedUrl).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(SITE_DIR, safePath);

  // If path is a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404 handling
    const custom404 = path.join(SITE_DIR, '404.html');
    if (fs.existsSync(custom404)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(custom404).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

function httpGet(port, routePath) {
  return new Promise((resolve, reject) => {
    http.get({
      host: '127.0.0.1',
      port: port,
      path: routePath
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function runHttpTests() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`  ${DIM}Ephemeral HTTP server active on http://127.0.0.1:${port}${RESET}`);

  const HTTP_TEST_ROUTES = [
    { path: '/', expectedStatus: 200, contentType: 'text/html' },
    { path: '/about/', expectedStatus: 200, contentType: 'text/html' },
    { path: '/blog/', expectedStatus: 200, contentType: 'text/html' },
    { path: '/projects/', expectedStatus: 200, contentType: 'text/html' },
    { path: '/resume/', expectedStatus: 200, contentType: 'text/html' },
    { path: '/cli/', expectedStatus: 200, contentType: 'text/html' },
    { path: '/contact/', expectedStatus: 200, contentType: 'text/html' },
    { path: '/404.html', expectedStatus: 200, contentType: 'text/html' },
    { path: '/omarchy.sh', expectedStatus: 200, contentType: 'text/plain' },
    { path: '/site.webmanifest', expectedStatus: 200, contentType: 'application/manifest+json' },
    { path: '/sitemap.xml', expectedStatus: 200, contentType: 'application/xml' },
    { path: '/feed.xml', expectedStatus: 200, contentType: 'application/xml' },
    { path: '/robots.txt', expectedStatus: 200, contentType: 'text/plain' },
    { path: '/assets/css/main.css', expectedStatus: 200, contentType: 'text/css' },
    { path: '/assets/js/main.js', expectedStatus: 200, contentType: 'text/javascript' },
    { path: '/assets/images/3D_model_v2.webp', expectedStatus: 200, contentType: 'image/webp' },
    { path: '/assets/images/3D_helmat_model_v2.webp', expectedStatus: 200, contentType: 'image/webp' },
    { path: '/assets/audio/33_max_verstappen.mp3', expectedStatus: 200, contentType: 'audio/mpeg' },
    { path: '/non-existent-canary-route', expectedStatus: 404, contentType: 'text/html' }
  ];

  for (const item of HTTP_TEST_ROUTES) {
    try {
      const res = await httpGet(port, item.path);
      const statusOk = res.statusCode === item.expectedStatus;
      const typeOk = item.contentType ? (res.headers['content-type'] && res.headers['content-type'].includes(item.contentType)) : true;
      assert(
        statusOk && typeOk,
        `GET ${item.path} -> ${item.expectedStatus} (${item.contentType})`,
        `Received status ${res.statusCode}, content-type: ${res.headers['content-type']}`
      );
    } catch (err) {
      assert(false, `GET ${item.path}`, err.message);
    }
  }

  server.close();
}

runHttpTests().then(() => {
  console.log(`\n${BOLD}======================================================${RESET}`);
  if (failedTests === 0) {
    console.log(`${BOLD}${GREEN}  ALL TESTS PASSED! (${passedTests} checks succeeded)${RESET}`);
    console.log(`${BOLD}${GREEN}  Website verified and ready for deployment.${RESET}`);
    console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);
    process.exit(0);
  } else {
    console.error(`${BOLD}${RED}  TEST SUITE FAILED! (${failedTests} failures, ${passedTests} passed)${RESET}`);
    for (const f of failures) {
      console.error(`  ${RED}• ${f}${RESET}`);
    }
    console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);
    process.exit(1);
  }
}).catch(err => {
  server.close();
  console.error(`\n${RED}Unexpected test runner crash:${RESET}`, err);
  process.exit(1);
});
