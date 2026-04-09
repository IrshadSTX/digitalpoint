/**
 * interactions.js
 * Handles all DOM interactions:
 *   1. Navbar shrink on scroll
 *   2. Mouse-parallax tilt on the hero glass card
 *   3. Enquiry form submission feedback
 */

(function () {
  'use strict';

  /* ── 1. Navbar shrink ──────────────────────────────────────── */
  function initNavShrink() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── 2. Hero card mouse-parallax tilt ──────────────────────── */
  function initCardTilt() {
    const card = document.querySelector('.hero-card');
    if (!card) return;

    // Disable tilt on touch/small screens
    const mq = window.matchMedia('(max-width: 1100px)');
    if (mq.matches) return;

    document.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / window.innerWidth;
      const dy    = (e.clientY - cy) / window.innerHeight;

      card.style.transform =
        `rotateY(${-6 + dx * 12}deg) rotateX(${3 - dy * 8}deg)`;
    });

    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateY(-6deg) rotateX(3deg)';
    });
  }

  /* ── 3. Enquiry form submission ────────────────────────────── */
  function initForm() {
    const form = document.querySelector('.card-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = "✓ Request Received — We'll Call You Soon!";
      btn.style.background = 'linear-gradient(90deg, #0a7c2e, #00e5a0)';
      btn.disabled = true;
    });
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function init() {
    initNavShrink();
    initCardTilt();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
