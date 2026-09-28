/**
 * OMARCHY BLOG & DISPATCHES ENGINE
 * Handles:
 * 1. Blog search and tag filtering
 * 2. Reading progress bar on post articles
 * 3. Automatic Table of Contents (TOC) generator & scroll-spy
 * 4. Share link to clipboard
 * 5. Code block copy buttons
 */

export function initBlog() {
  initBlogFiltering();
  initReadingProgressBar();
  initPostTOC();
  initShareButtons();
  initCodeBlockCopy();
}

/**
 * 1. Blog Search & Tag Filtering for /blog/
 */
export function initBlogFiltering() {
  const searchInput = document.getElementById('blog-search');
  const filterButtons = document.querySelectorAll('.tags-filter-bar .filter-btn');
  const postCards = document.querySelectorAll('.post-item-card');
  const emptyNotice = document.getElementById('no-posts-found');

  if (!postCards.length) return;

  let currentTag = 'all';
  let currentQuery = '';

  function filterPosts() {
    let visibleCount = 0;
    postCards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      const desc = (card.getAttribute('data-desc') || '').toLowerCase();

      const matchesQuery = !currentQuery || 
                           title.includes(currentQuery) || 
                           desc.includes(currentQuery) || 
                           tags.includes(currentQuery);

      const tagList = tags.split(',').map(t => t.trim().toLowerCase());
      const matchesTag = currentTag === 'all' || tagList.includes(currentTag);

      if (matchesQuery && matchesTag) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyNotice) {
      emptyNotice.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      currentQuery = e.target.value.toLowerCase().trim();
      filterPosts();
    });
  }

  if (filterButtons.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTag = (btn.getAttribute('data-tag') || 'all').toLowerCase();
        filterPosts();
      });
    });

    // Check for ?tag= query in URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tagParam = urlParams.get('tag');
      if (tagParam) {
        const targetBtn = Array.from(filterButtons).find(
          b => (b.getAttribute('data-tag') || '').toLowerCase() === tagParam.toLowerCase()
        );
        if (targetBtn) {
          targetBtn.click();
        }
      }
    } catch (_) {}
  }
}

/**
 * 2. Reading Progress Bar on individual blog posts
 */
export function initReadingProgressBar() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  function updateProgress() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/**
 * 3. Auto-generated Table of Contents & Scroll-Spy
 */
export function initPostTOC() {
  const tocContainer = document.getElementById('post-toc');
  const tocNav = document.getElementById('toc-nav');
  const tocToggleBtn = document.getElementById('toc-toggle-btn');
  const markdownBody = document.querySelector('.post-body.markdown-body');

  if (!markdownBody || !tocContainer || !tocNav) return;

  const headings = markdownBody.querySelectorAll('h2, h3');
  if (headings.length < 2) return;

  tocNav.innerHTML = '';
  headings.forEach((heading, idx) => {
    if (!heading.id) {
      heading.id = heading.textContent
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') || `heading-${idx}`;
    }

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.className = `toc-link ${heading.tagName.toLowerCase() === 'h3' ? 'toc-h3' : 'toc-h2'}`;

    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(heading.id);
      if (target) {
        const yOffset = -70; // Account for sticky navbar
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });

    tocNav.appendChild(link);
  });

  tocContainer.style.display = 'block';

  if (tocToggleBtn) {
    tocToggleBtn.addEventListener('click', () => {
      const isHidden = tocNav.style.display === 'none';
      tocNav.style.display = isHidden ? 'flex' : 'none';
      tocToggleBtn.textContent = isHidden ? 'Hide' : 'Show';
    });
  }

  // Scroll Spy for TOC links
  const tocLinks = tocNav.querySelectorAll('.toc-link');
  function updateScrollSpy() {
    let currentActive = '';
    headings.forEach(heading => {
      const top = heading.getBoundingClientRect().top;
      if (top <= 120) {
        currentActive = heading.id;
      }
    });

    tocLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentActive}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
}

/**
 * 4. Share Link & Copy to Clipboard
 */
export function initShareButtons() {
  const shareCopyBtn = document.getElementById('share-copy-btn');
  if (!shareCopyBtn) return;

  shareCopyBtn.addEventListener('click', async () => {
    const shareText = shareCopyBtn.querySelector('.share-copy-text');
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        if (shareText) shareText.textContent = 'Copied!';
        shareCopyBtn.classList.add('copied');
        setTimeout(() => {
          if (shareText) shareText.textContent = 'Copy Link';
          shareCopyBtn.classList.remove('copied');
        }, 2000);
      }
    } catch (_) {}
  });
}

/**
 * 5. Code Block Copy Buttons
 */
export function initCodeBlockCopy() {
  const codeBlocks = document.querySelectorAll('.markdown-body pre');
  codeBlocks.forEach(pre => {
    if (pre.parentElement && pre.parentElement.classList.contains('code-block-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.setAttribute('aria-label', 'Copy code to clipboard');

    copyBtn.addEventListener('click', async () => {
      const codeText = pre.querySelector('code')?.innerText || pre.innerText;
      try {
        await navigator.clipboard.writeText(codeText);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (_) {
        copyBtn.textContent = 'Failed';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      }
    });

    wrapper.appendChild(copyBtn);
  });
}
