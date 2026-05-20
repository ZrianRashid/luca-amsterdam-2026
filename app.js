// LUCA — motion behaviors
// Particles, scroll reveal, parallax, nav state

(function () {
  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

  // ───────────  STEAM PARTICLES  ───────────
  function spawnParticles(host, count, opts = {}) {
    const {
      sizeMin = 30,
      sizeMax = 120,
      durMin = 8,
      durMax = 22,
      driftMax = 80,
      peakMin = 0.3,
      peakMax = 0.7,
    } = opts;

    host.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const size = sizeMin + Math.random() * (sizeMax - sizeMin);
      const dur = durMin + Math.random() * (durMax - durMin);
      const delay = -Math.random() * dur; // negative so they're mid-animation on load
      const left = Math.random() * 100;
      const drift = (Math.random() * 2 - 1) * driftMax;
      const peak = peakMin + Math.random() * (peakMax - peakMin);

      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${left}%`;
      p.style.animationDuration = `${dur}s`;
      p.style.animationDelay = `${delay}s`;
      p.style.setProperty('--drift', `${drift}px`);
      p.style.setProperty('--peak', peak);

      host.appendChild(p);
    }
  }

  // Hero particles — denser, more variety for cinematic steam
  const heroParticles = document.querySelector('[data-particles="hero"]');
  if (heroParticles) {
    const density = parseInt(heroParticles.dataset.count || '55', 10);
    spawnParticles(heroParticles, density, {
      sizeMin: 40,
      sizeMax: 180,
      durMin: 10,
      durMax: 28,
      driftMax: 140,
      peakMin: 0.25,
      peakMax: 0.75,
    });
  }

  // Card particles — smaller, fewer
  document.querySelectorAll('[data-particles="card"]').forEach((host) => {
    spawnParticles(host, 14, {
      sizeMin: 20,
      sizeMax: 70,
      durMin: 6,
      durMax: 14,
      driftMax: 40,
      peakMin: 0.25,
      peakMax: 0.55,
    });
  });

  // Sticky Book FAB visibility — show after scroll past hero
  const fab = document.getElementById('book-fab');
  function updateFab() {
    if (!fab) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const threshold = hero.offsetHeight - 200;
    fab.classList.toggle('is-visible', window.scrollY > threshold);
  }
  window.addEventListener('scroll', updateFab, { passive: true });
  updateFab();

  // Expose so Tweaks can re-spawn at new density
  window.__lucaSpawnHero = (count) => {
    if (heroParticles) spawnParticles(heroParticles, count);
  };

  // ───────────  SCROLL REVEAL (IntersectionObserver)  ───────────
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ───────────  PARALLAX (hero content + bg)  ───────────
  const heroContent = document.querySelector('.hero__content');
  const heroMotion = document.querySelector('.hero__motion');
  const heroVeil = document.querySelector('.hero__veil');
  const nav = document.querySelector('.nav');

  let lastY = -1;
  let rafId = null;

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y === lastY) {
        rafId = null;
        return;
      }
      lastY = y;

      const intensity = parseFloat(document.documentElement.dataset.parallax || '1');
      if (heroContent) {
        heroContent.style.transform = `translate3d(0, ${y * 0.35 * intensity}px, 0)`;
        heroContent.style.opacity = Math.max(0, 1 - y / 600);
      }
      if (heroMotion) {
        heroMotion.style.transform = `translate3d(0, ${y * 0.18 * intensity}px, 0) scale(${1 + y * 0.0004})`;
      }
      if (heroVeil) {
        heroVeil.style.opacity = Math.min(1, 0.7 + y / 800);
      }
      if (nav) {
        nav.classList.toggle('is-scrolled', y > 40);
      }
      rafId = null;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ───────────  GIF SWAP HOOK  ───────────
  // Allows: <img data-motion-src="…gif"> to live-replace CSS motion later
  document.querySelectorAll('[data-motion-src]').forEach((img) => {
    img.src = img.dataset.motionSrc;
  });
})();
