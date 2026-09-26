document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Theme Toggle (Dark / Light) & Giscus Theme Sync
  // ==========================================
  const themeToggle = document.getElementById('theme-toggle');
  
  const updateGiscusTheme = (theme) => {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe && iframe.contentWindow) {
      const giscusTheme = theme === 'light' ? 'light' : 'dark_dimmed';
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
      );
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateGiscusTheme(newTheme);
    });
  }

  // ==========================================
  // 2. Mobile Navigation Toggle
  // ==========================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  }

  // ==========================================
  // 3. Add Copy Button to Code Blocks
  // ==========================================
  const codeBlocks = document.querySelectorAll('.markdown-body pre');
  codeBlocks.forEach((pre) => {
    // Skip if inside mermaid container
    if (pre.querySelector('.language-mermaid') || pre.classList.contains('mermaid')) {
      return;
    }

    if (!pre.parentElement.classList.contains('code-block-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
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
          copyBtn.style.color = '#4ade80';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.style.color = '';
          }, 2000);
        } catch (err) {
          copyBtn.textContent = 'Failed';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        }
      });

      wrapper.appendChild(copyBtn);
    }
  });

  // ==========================================
  // 4. Reading Progress Bar & Table of Contents (TOC)
  // ==========================================
  const progressBar = document.getElementById('reading-progress');
  const tocContainer = document.getElementById('post-toc');
  const tocNav = document.getElementById('toc-nav');
  const tocToggleBtn = document.getElementById('toc-toggle-btn');
  const markdownBody = document.querySelector('.post-body.markdown-body');

  if (markdownBody) {
    // Reading Progress
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const progress = (window.scrollY / totalHeight) * 100;
          progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
      });
    }

    // Auto-generate TOC from h2 and h3
    const headings = markdownBody.querySelectorAll('h2, h3');
    if (headings.length >= 2 && tocContainer && tocNav) {
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
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.getElementById(heading.id);
          if (target) {
            const yOffset = -80; // Account for sticky navbar
            const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        });

        tocNav.appendChild(link);
      });

      tocContainer.style.display = 'block';

      if (tocToggleBtn) {
        tocToggleBtn.addEventListener('click', () => {
          if (tocNav.style.display === 'none') {
            tocNav.style.display = 'flex';
            tocToggleBtn.textContent = 'Hide';
          } else {
            tocNav.style.display = 'none';
            tocToggleBtn.textContent = 'Show';
          }
        });
      }

      // Scroll Spy for TOC
      const tocLinks = tocNav.querySelectorAll('.toc-link');
      window.addEventListener('scroll', () => {
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
      });
    }
  }

  // ==========================================
  // 5. Post Share Bar & Copy Link
  // ==========================================
  const shareCopyBtn = document.getElementById('share-copy-btn');
  if (shareCopyBtn) {
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
          shareCopyBtn.style.color = '#4ade80';
          setTimeout(() => {
            if (shareText) shareText.textContent = 'Copy Link';
            shareCopyBtn.style.color = '';
          }, 2000);
        }
      } catch (err) {
        // Ignored or dismissed
      }
    });
  }

  // ==========================================
  // 6. Giscus Comments Loader
  // ==========================================
  const giscusSlot = document.getElementById('giscus-slot');
  if (giscusSlot) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const giscusTheme = currentTheme === 'light' ? 'light' : 'dark_dimmed';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'itsvrushabh/itsvrushabh.github.io');
    script.setAttribute('data-repo-id', 'R_kgDON6U-UA'); // Will connect to repository
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDON6U-UM4Cn92L');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', giscusTheme);
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    giscusSlot.appendChild(script);
  }

  // ==========================================
  // 7. Mermaid.js Diagram Support
  // ==========================================
  const mermaidBlocks = document.querySelectorAll('.language-mermaid, pre code.language-mermaid');
  if (mermaidBlocks.length > 0) {
    // Transform code blocks to .mermaid divs
    mermaidBlocks.forEach(codeBlock => {
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = codeBlock.textContent.trim();
      
      const pre = codeBlock.closest('pre');
      if (pre && pre.parentElement) {
        pre.parentElement.replaceChild(container, pre);
      }
    });

    // Dynamically load Mermaid library
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      mermaid.initialize({
        startOnLoad: true,
        theme: isLight ? 'default' : 'dark',
        securityLevel: 'loose',
        fontFamily: 'Inter, sans-serif'
      });
    `;
    document.head.appendChild(script);
  }

  // ==========================================
  // 8. Blog Search & Tag Filtering
  // ==========================================
  const searchInput = document.getElementById('blog-search');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const postCards = document.querySelectorAll('.post-item-card');

  if (postCards.length > 0) {
    let currentTag = 'all';
    let currentQuery = '';

    const filterPosts = () => {
      let visibleCount = 0;
      postCards.forEach(card => {
        const title = card.getAttribute('data-title')?.toLowerCase() || '';
        const tags = card.getAttribute('data-tags')?.toLowerCase() || '';
        const desc = card.getAttribute('data-desc')?.toLowerCase() || '';

        const matchesQuery = !currentQuery || 
                             title.includes(currentQuery) || 
                             desc.includes(currentQuery) || 
                             tags.includes(currentQuery);
                             
        const matchesTag = currentTag === 'all' || tags.split(',').map(t => t.trim()).includes(currentTag);

        if (matchesQuery && matchesTag) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const emptyNotice = document.getElementById('no-posts-found');
      if (emptyNotice) {
        emptyNotice.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value.toLowerCase().trim();
        filterPosts();
      });
    }

    if (filterButtons.length > 0) {
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentTag = btn.getAttribute('data-tag') || 'all';
          filterPosts();
        });
      });

      // Handle ?tag=... parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const tagParam = urlParams.get('tag');
      if (tagParam) {
        const targetBtn = Array.from(filterButtons).find(
          b => b.getAttribute('data-tag')?.toLowerCase() === tagParam.toLowerCase()
        );
        if (targetBtn) {
          targetBtn.click();
        }
      }
    }
  }
});
