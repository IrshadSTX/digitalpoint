/**
 * interactions.js
 * Handles all DOM interactions:
 *   1. Hamburger mobile menu
 *   2. Navbar shrink on scroll
 *   3. Mouse-parallax tilt on the hero glass card (desktop only)
 *   4. Enquiry form submission feedback
 */

(function () {
  'use strict';

  /* ── 1. Hamburger mobile menu ──────────────────────────────── */
  function initHamburger() {
    const btn      = document.getElementById('hamburger');
    const menu     = document.getElementById('nav-links');
    const backdrop = document.getElementById('nav-backdrop');
    if (!btn || !menu) return;

    function openMenu() {
      menu.classList.add('open');
      backdrop && backdrop.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menu.classList.remove('open');
      backdrop && backdrop.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', () => {
      btn.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close on backdrop click
    backdrop && backdrop.addEventListener('click', closeMenu);

    // Close when a nav link is tapped
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ── 2. Navbar shrink on scroll ────────────────────────────── */
  function initNavShrink() {
    const nav = document.querySelector('nav.main-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── 3. Hero card mouse-parallax tilt (desktop only) ───────── */
  function initCardTilt() {
    const card = document.querySelector('.hero-card');
    if (!card) return;

    // Only on non-touch devices with enough width
    if (window.matchMedia('(hover: none), (max-width: 1100px)').matches) return;

    document.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / window.innerWidth;
      const dy   = (e.clientY - cy) / window.innerHeight;
      card.style.transform = `rotateY(${-6 + dx * 12}deg) rotateX(${3 - dy * 8}deg)`;
    });

    document.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateY(-6deg) rotateX(3deg)';
    });
  }

  /* ── 4. Enquiry form submission ────────────────────────────── */
  function initForm() {
    const form = document.querySelector('.card-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = "✓ We'll Call You Within 24 Hours!";
      btn.style.background = 'linear-gradient(90deg, #0a7c2e, #00e5a0)';
      btn.disabled = true;
    });
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function init() {
    initHamburger();
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
