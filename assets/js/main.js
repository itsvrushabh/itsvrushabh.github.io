document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Theme Toggle (Dark / Light)
  // ==========================================
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
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

    // Close mobile nav when clicking outside
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
    // Only wrap if not already wrapped
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
  // 4. Blog Search & Tag Filtering
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
