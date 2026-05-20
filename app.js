// LUCA Amsterdam — app.js
// Particles · Scroll reveal · Parallax · Nav · FAB

(function () {
  'use strict';

  // ─────────── PARTICLES ───────────
  function createParticle(container) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 20 + 8;
    const x = Math.random() * 100;
    const duration = Math.random() * 18 + 12;
    const delay = Math.random() * 15;
    const drift = (Math.random() - 0.5) * 120;
    const peak = Math.random() * 0.5 + 0.3;

    p.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `left:${x}%`,
      `animation-duration:${duration}s`,
      `animation-delay:${delay}s`,
      `--drift:${drift}px`,
      `--peak:${peak}`,
    ].join(';');

    container.appendChild(p);

    // Remove and recreate when done
    p.addEventListener('animationend', () => {
      p.remove();
      if (document.contains(container)) createParticle(container);
    }, { once: true });
  }

  function initParticles() {
    document.querySelectorAll('[data-particles]').forEach((container) => {
      const count = parseInt(container.dataset.count) || 12;
      const isHero = container.dataset.particles === 'hero';

      // Create initial set
      for (let i = 0; i < count; i++) {
        setTimeout(() => createParticle(container), i * (300));
      }
    });
  }

  // ─────────── SCROLL REVEAL ───────────
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    els.forEach((el) => observer.observe(el));
  }

  // ─────────── NAV SCROLL ───────────
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('is-scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ─────────── PARALLAX ───────────
  function initParallax() {
    const hero = document.querySelector('.hero__content');
    const motion = document.querySelector('.hero__motion');
    if (!hero || !motion) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const rate = scrolled * 0.35;
          hero.style.transform = `translateY(${rate * 0.4}px)`;
          hero.style.opacity = 1 - (scrolled / 700);
          if (motion) motion.style.transform = `translateY(${rate * 0.15}px) scale(1.06)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ─────────── FLOATING BOOK FAB ───────────
  function initFAB() {
    const fab = document.getElementById('book-fab');
    if (!fab) return;

    const threshold = window.innerHeight * 0.6;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fab.classList.remove('is-visible');
        } else if (window.scrollY > threshold) {
          fab.classList.add('is-visible');
        }
      });
    }, { threshold: 0 });

    // Observe all major sections
    document.querySelectorAll('section').forEach((s) => observer.observe(s));

    // Show FAB once user has scrolled enough
    window.addEventListener('scroll', () => {
      fab.classList.toggle('is-visible', window.scrollY > threshold);
    }, { passive: true });
  }

  // ─────────── EXPERIENCE CARD MOTION LAYERS ───────────
  function initCardMotion() {
    // Each card has its CSS animation inline; just ensure hover feels responsive
    document.querySelectorAll('.exp-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.querySelectorAll('.exp-card__motion-layer').forEach((layer, i) => {
          layer.style.animationPlayState = 'running';
        });
      });
    });
  }

  // ─────────── AMENITIES MARQUEE ───────────
  function initMarquee() {
    const marquee = document.querySelector('.amenities-marquee__track');
    if (!marquee) return;

    // Duplicate for seamless loop
    const original = marquee.innerHTML;
    marquee.innerHTML = original + original;
  }

  // ─────────── INIT ───────────
  function init() {
    initParticles();
    initReveal();
    initNav();
    initParallax();
    initFAB();
    initCardMotion();
    initMarquee();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();