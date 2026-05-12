/**
 * institute-hero.js
 * Fullscreen institute photo spotlight slider.
 */

(function () {
  'use strict';

  const INTERVAL_MS = 5000;

  function init() {
    const section  = document.querySelector('.inst-hero');
    const slides   = document.querySelectorAll('.ih-slide');
    const dotsWrap = document.getElementById('ih-dots');
    const prevBtn  = document.getElementById('ih-prev');
    const nextBtn  = document.getElementById('ih-next');
    const progress = document.getElementById('ih-progress');
    const nav      = document.querySelector('nav.main-nav');
    if (!section || !slides.length) return;

    let current = 0;
    let timer   = null;

    /* ── Detect broken images → fallback gradient ─────────── */
    slides.forEach((slide) => {
      const raw = slide.style.backgroundImage || '';
      const url = raw.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
      if (!url) { slide.classList.add('ih-no-img'); return; }
      const img = new Image();
      img.onerror = () => slide.classList.add('ih-no-img');
      img.src = url;
    });

    /* ── Build dots ───────────────────────────────────────── */
    const dots = [];
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'ih-dot-btn' + (i === 0 ? ' ih-dot-active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => { goTo(i); startTimer(); });
      dotsWrap && dotsWrap.appendChild(d);
      dots.push(d);
    });

    /* ── Go to slide ──────────────────────────────────────── */
    function goTo(idx) {
      slides[current].classList.remove('ih-active');
      dots[current] && dots[current].classList.remove('ih-dot-active');

      current = (idx + slides.length) % slides.length;

      slides[current].classList.add('ih-active');
      dots[current] && dots[current].classList.add('ih-dot-active');

      animateProgress();
    }

    /* ── Progress bar ─────────────────────────────────────── */
    function animateProgress() {
      if (!progress) return;
      progress.style.transition = 'none';
      progress.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        progress.style.transition = `width ${INTERVAL_MS}ms linear`;
        progress.style.width = '100%';
      }));
    }

    /* ── Auto-advance ─────────────────────────────────────── */
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), INTERVAL_MS);
    }

    /* ── Arrows ───────────────────────────────────────────── */
    prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
    nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });

    /* ── Touch swipe ──────────────────────────────────────── */
    let touchX = 0;
    section.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    section.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) { goTo(dx < 0 ? current + 1 : current - 1); startTimer(); }
    }, { passive: true });

    /* ── Navbar: transparent over slider, solid after ──────── */
    function updateNav() {
      if (!nav) return;
      const bottom = section.getBoundingClientRect().bottom;
      if (bottom > 80) {
        nav.classList.add('ih-at-top');
      } else {
        nav.classList.remove('ih-at-top');
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav(); // run once on load

    /* ── Pause when tab hidden ────────────────────────────── */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        startTimer();
        animateProgress();
      }
    });

    /* ── Start ────────────────────────────────────────────── */
    goTo(0);
    startTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
