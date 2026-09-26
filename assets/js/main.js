document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Lenis Smooth Inertia Scrolling (Lando Norris style)
  // ==========================================
  if (typeof Lenis !== 'undefined') {
    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis smooth scroll failed to initialize:', e);
    }
  }

  // ==========================================
  // 2. Hero Parallax on Scroll
  // ==========================================
  const heroImg = document.querySelector('.f1-hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight * 1.2) {
        heroImg.style.transform = `translate3d(0, ${scrollY * 0.22}px, 0) scale(${1 + scrollY * 0.00015})`;
      }
    }, { passive: true });
  }

  // ==========================================
  // 3. Scroll Reveal Animation (Staggered IntersectionObserver)
  // ==========================================
  const revealElements = document.querySelectorAll(
    '[data-reveal], .f1-stat-card, .f1-race-card, .f1-article-card, .f1-callout-panel'
  );

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // ==========================================
  // 4. Animated Telemetry Counters
  // ==========================================
  const counterElements = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window && counterElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetVal = parseFloat(el.getAttribute('data-counter'));
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          const duration = 1600; // ms
          const startTime = performance.now();

          const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo for sports telemetry feel
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = targetVal * ease;

            el.textContent = `${prefix}${current.toLocaleString('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            })}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            }
          };

          requestAnimationFrame(updateCount);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.25 });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  // ==========================================
  // 5. Interactive Card Spotlight (Mouse Tracker)
  // ==========================================
  const spotlightCards = document.querySelectorAll(
    '.f1-race-card, .f1-stat-card, .f1-article-card, .f1-callout-panel'
  );
  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ==========================================
  // 6. Theme Toggle (Dark / Light) & Giscus Theme Sync
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
  // 7. Mobile Navigation Toggle
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
  // 8. Add Copy Button to Code Blocks
  // ==========================================
  const codeBlocks = document.querySelectorAll('.markdown-body pre');
  codeBlocks.forEach((pre) => {
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
          copyBtn.style.color = '#d2ff00';
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
  // 9. Reading Progress Bar & Table of Contents (TOC)
  // ==========================================
  const progressBar = document.getElementById('reading-progress');
  const tocContainer = document.getElementById('post-toc');
  const tocNav = document.getElementById('toc-nav');
  const tocToggleBtn = document.getElementById('toc-toggle-btn');
  const markdownBody = document.querySelector('.post-body.markdown-body');

  if (markdownBody) {
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const progress = (window.scrollY / totalHeight) * 100;
          progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
      }, { passive: true });
    }

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
            const yOffset = -80;
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
      }, { passive: true });
    }
  }

  // ==========================================
  // 10. Post Share Bar & Copy Link
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
          shareCopyBtn.style.color = '#d2ff00';
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
  // 11. Giscus Comments Loader
  // ==========================================
  const giscusSlot = document.getElementById('giscus-slot');
  if (giscusSlot) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const giscusTheme = currentTheme === 'light' ? 'light' : 'dark_dimmed';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'itsvrushabh/itsvrushabh.github.io');
    script.setAttribute('data-repo-id', 'R_kgDON6U-UA');
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
  // 12. Mermaid.js Diagram Support
  // ==========================================
  const mermaidBlocks = document.querySelectorAll('.language-mermaid, pre code.language-mermaid');
  if (mermaidBlocks.length > 0) {
    mermaidBlocks.forEach(codeBlock => {
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = codeBlock.textContent.trim();
      
      const pre = codeBlock.closest('pre');
      if (pre && pre.parentElement) {
        pre.parentElement.replaceChild(container, pre);
      }
    });

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
  // 13. Blog Search & Tag Filtering
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
