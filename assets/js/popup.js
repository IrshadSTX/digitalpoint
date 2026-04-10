/**
 * popup.js
 * Entry announcement popup modal.
 *   - Fades in 600ms after page load
 *   - Closes on CTA click, "Maybe Later", overlay click, × button, or Escape
 */

(function () {
  'use strict';

  const DELAY_MS = 600;

  function init() {
    const popup   = document.getElementById('entry-popup');
    const overlay = document.getElementById('popup-overlay');
    const ctaBtn  = document.getElementById('popup-cta');
    const laterBtn= document.getElementById('popup-later');
    const closeBtn= document.getElementById('popup-close');
    if (!popup) return;

    // Don't show again if dismissed this session
    if (sessionStorage.getItem('popup-dismissed')) return;

    function closePopup() {
      popup.classList.remove('open');
      document.body.style.overflow = '';
      sessionStorage.setItem('popup-dismissed', '1');
    }

    function openPopup() {
      popup.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    // Course poster mini-slider
    (function initSlider() {
      const track = document.getElementById('pcs-track');
      const dotsWrap = document.getElementById('pcs-dots');
      if (!track) return;
      const slides = track.querySelectorAll('.pcs-slide');
      const dots   = dotsWrap ? dotsWrap.querySelectorAll('.pcs-dot') : [];
      if (!slides.length) return;

      let current = 0;
      function goTo(idx) {
        current = (idx + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('active', i === current));
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
      }
      dots.forEach((d) => d.addEventListener('click', () => goTo(+d.dataset.idx)));
      setInterval(() => goTo(current + 1), 2500);
    })();

    // Show after delay
    setTimeout(openPopup, DELAY_MS);

    // Close triggers
    overlay  && overlay.addEventListener('click', closePopup);
    laterBtn && laterBtn.addEventListener('click', closePopup);
    ctaBtn   && ctaBtn.addEventListener('click', closePopup);
    closeBtn && closeBtn.addEventListener('click', closePopup);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopup();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
