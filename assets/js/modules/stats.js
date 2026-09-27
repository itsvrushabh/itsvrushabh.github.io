/**
 * OMARCHY GITHUB STATS MODULE
 */
export function initGitHubStats() {
  const CACHE_KEY = 'omarchy_gh_stats_cache';
  const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

  function updateRepoCards(repos) {
    document.querySelectorAll('[data-gh-repo]').forEach(badge => {
      const repoName = badge.dataset.ghRepo;
      const starEl = badge.querySelector('.gh-star-count');
      if (!starEl) return;

      const repoData = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase());
      if (repoData) {
        const stars = repoData.stargazers_count;
        const updated = new Date(repoData.pushed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        starEl.innerHTML = `★ ${stars} &middot; ${updated}`;
      }
    });
  }

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY && parsed.data) {
        updateRepoCards(parsed.data);
        return;
      }
    }
  } catch (e) {
    // Ignore cache parse error
  }

  fetch('https://api.github.com/users/itsvrushabh/repos?sort=pushed&per_page=12')
    .then(res => {
      if (!res.ok) throw new Error('GitHub API response not ok');
      return res.json();
    })
    .then(repos => {
      if (Array.isArray(repos)) {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: repos }));
        updateRepoCards(repos);
      }
    })
    .catch(err => {
      console.warn('Live GitHub stats fallback:', err);
    });
}
