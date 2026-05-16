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
      document.documentElement.classList.add('nav-open');
    }

    function closeMenu() {
      menu.classList.remove('open');
      backdrop && backdrop.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('nav-open');
    }

    btn.addEventListener('click', () => {
      btn.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close on backdrop click
    backdrop && backdrop.addEventListener('click', closeMenu);

    // Close when a nav link is tapped; use programmatic scroll for anchors
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          closeMenu();
          const target = document.querySelector(href);
          if (target) {
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 350);
          }
        } else {
          closeMenu();
        }
      });
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

  /* ── 5. App screenshot auto-slider ────────────────────────── */
  function initAppScreenSlider() {
    const slides = document.querySelectorAll('.app-screen-slide');
    if (slides.length < 2) return;

    let current = 0;

    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 3000);
  }

  /* ── 6. Faculty mobile 2×2 breathing carousel ─────────────── */
  function initFacultyMobileCarousel() {
    if (!window.matchMedia('(max-width: 600px)').matches) return;

    const grid = document.getElementById('faculty-grid');
    if (!grid) return;

    const allCards = Array.from(grid.querySelectorAll('.faculty-card'));
    if (allCards.length < 4) return;

    // Snapshot image data from every card before CSS hides cards 5+
    const images = allCards.map((c) => ({
      src:  c.dataset.src,
      name: c.dataset.name,
      idx:  c.dataset.idx,
    }));

    const SLOTS      = 4;
    const slots      = allCards.slice(0, SLOTS);
    const BREATHE_ON = 1100; // ms class stays on: 0.5s float-up + 0.75s shimmer sweep + hold
    const GAP        = 300;  // ms gap between breaths

    let nextImg    = SLOTS;  // index of next image not yet shown
    let slotPtr    = 0;
    let cyclesDone = 0;

    function swapImage(card, imgIdx) {
      const data = images[imgIdx % images.length];
      const img  = card.querySelector('.faculty-card-img');
      img.style.transition = 'opacity 0.25s';
      img.style.opacity    = '0';
      setTimeout(() => {
        img.src            = data.src;
        img.alt            = data.name;
        card.dataset.src   = data.src;
        card.dataset.name  = data.name;
        card.dataset.idx   = data.idx;
        img.style.opacity  = '1';
      }, 250);
    }

    function tick() {
      const card = slots[slotPtr];
      card.classList.add('fac-breathe-active');

      setTimeout(() => {
        card.classList.remove('fac-breathe-active');

        // Completed a full round of all 4 slots?
        if (slotPtr === SLOTS - 1) cyclesDone++;

        slotPtr = (slotPtr + 1) % SLOTS;

        if (cyclesDone > 0) {
          // Swap next slot's image before it breathes, then wait for crossfade
          swapImage(slots[slotPtr], nextImg++);
          setTimeout(tick, GAP + 300);
        } else {
          setTimeout(tick, GAP);
        }
      }, BREATHE_ON);
    }

    setTimeout(tick, 800);
  }

  /* ── 7. Marquee poster tap-to-fullscreen lightbox ─────────── */
  function initMarqueeLightbox() {
    const posters = document.querySelectorAll('.mq-poster');
    if (!posters.length) return;

    // Build unique image list from posters that have alt text (original set)
    const items = [];
    posters.forEach((p) => {
      const img = p.querySelector('img');
      const label = p.querySelector('span');
      if (img && img.alt) {
        items.push({ src: img.getAttribute('src'), label: label ? label.textContent.trim() : '' });
      }
    });

    // Create lightbox element
    const lb = document.createElement('div');
    lb.id = 'mq-lightbox';
    lb.className = 'mq-lightbox';
    lb.innerHTML = `
      <button class="mq-lb-close" id="mq-lb-close" aria-label="Close">✕</button>
      <button class="mq-lb-prev" id="mq-lb-prev" aria-label="Previous">&#8249;</button>
      <img id="mq-lb-img" src="" alt="" />
      <button class="mq-lb-next" id="mq-lb-next" aria-label="Next">&#8250;</button>`;
    document.body.appendChild(lb);

    const lbImg = document.getElementById('mq-lb-img');
    let current = 0;

    function openLb(idx) {
      current = ((idx % items.length) + items.length) % items.length;
      lbImg.src = items[current].src;
      lbImg.alt = items[current].label;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Click on any poster (originals + duplicates)
    posters.forEach((p) => {
      p.addEventListener('click', () => {
        const src = p.querySelector('img').getAttribute('src');
        const idx = items.findIndex((it) => it.src === src);
        openLb(idx >= 0 ? idx : 0);
      });
    });

    document.getElementById('mq-lb-close').addEventListener('click', closeLb);
    document.getElementById('mq-lb-prev').addEventListener('click', (e) => { e.stopPropagation(); openLb(current - 1); });
    document.getElementById('mq-lb-next').addEventListener('click', (e) => { e.stopPropagation(); openLb(current + 1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });

    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLb();
      if (e.key === 'ArrowLeft')  openLb(current - 1);
      if (e.key === 'ArrowRight') openLb(current + 1);
    });
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function init() {
    initHamburger();
    initNavShrink();
    initCardTilt();
    initForm();
    initAppScreenSlider();
    initFacultyMobileCarousel();
    initMarqueeLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
