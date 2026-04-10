/**
 * popup.js
 * Entry announcement popup modal.
 *   - Fades in 600ms after page load
 *   - Auto-closes after 8 seconds with countdown
 *   - Closes on CTA click, "Maybe Later", overlay click, or Escape
 */

(function () {
  'use strict';

  const DELAY_MS    = 600;   // wait before showing
  const AUTO_CLOSE  = 8;     // seconds

  function init() {
    const popup      = document.getElementById('entry-popup');
    const overlay    = document.getElementById('popup-overlay');
    const ctaBtn     = document.getElementById('popup-cta');
    const laterBtn   = document.getElementById('popup-later');
    const countdown  = document.getElementById('popup-countdown');
    if (!popup) return;

    // Don't show again if dismissed this session
    if (sessionStorage.getItem('popup-dismissed')) return;

    let timer;
    let remaining = AUTO_CLOSE;

    function closePopup() {
      popup.classList.remove('open');
      document.body.style.overflow = '';
      clearInterval(timer);
      sessionStorage.setItem('popup-dismissed', '1');
    }

    function openPopup() {
      popup.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Countdown
      timer = setInterval(() => {
        remaining--;
        if (countdown) countdown.textContent = remaining;
        if (remaining <= 0) closePopup();
      }, 1000);
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
        slides.forEach((s, i) => {
          s.style.transform = `translateX(${(i - current) * 100}%)`;
        });
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
