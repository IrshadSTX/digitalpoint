/**
 * carousel.js
 * Achievement slider with:
 *   - Auto-play (4 second interval)
 *   - Prev / Next buttons
 *   - Dot indicators
 *   - Touch / swipe support
 *   - Pauses on hover
 *   - Responsive (cards-per-view changes with breakpoints)
 */

(function () {
  'use strict';

  function getCardsPerView() {
    const w = window.innerWidth;
    if (w <= 480)  return 1;
    if (w <= 768)  return 2;
    if (w <= 1100) return 3;
    return 4;
  }

  function init() {
    const track    = document.getElementById('carousel-track');
    const prevBtn  = document.getElementById('carousel-prev');
    const nextBtn  = document.getElementById('carousel-next');
    const dotsWrap = document.getElementById('carousel-dots');
    if (!track) return;

    const cards      = Array.from(track.children);
    const total      = cards.length;
    let   current    = 0;
    let   autoTimer  = null;
    let   perView    = getCardsPerView();

    // ── Build dots ────────────────────────────────────────────
    function buildDots() {
      dotsWrap.innerHTML = '';
      const pages = Math.ceil(total / perView);
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i * perView));
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = dotsWrap.querySelectorAll('.carousel-dot');
      const page = Math.floor(current / perView);
      dots.forEach((d, i) => d.classList.toggle('active', i === page));
    }

    // ── Move ──────────────────────────────────────────────────
    function goTo(index) {
      const max = total - perView;
      current = Math.max(0, Math.min(index, max));

      // Card width = (track-outer width - gaps) / perView
      const outer     = track.parentElement;
      const gap       = 20;
      const cardWidth = (outer.offsetWidth - gap * (perView - 1)) / perView;
      const offset    = current * (cardWidth + gap);

      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
    }

    function next() {
      const max = total - perView;
      goTo(current >= max ? 0 : current + perView);
    }

    function prev() {
      const max = total - perView;
      goTo(current <= 0 ? max : current - perView);
    }

    // ── Auto-play ─────────────────────────────────────────────
    function startAuto() { autoTimer = setInterval(next, 4000); }
    function stopAuto()  { clearInterval(autoTimer); }

    prevBtn && prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    nextBtn && nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

    track.parentElement.addEventListener('mouseenter', stopAuto);
    track.parentElement.addEventListener('mouseleave', startAuto);

    // ── Touch / swipe ─────────────────────────────────────────
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
      startAuto();
    }, { passive: true });

    // ── Resize ────────────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        perView = getCardsPerView();
        current = 0;
        buildDots();
        goTo(0);
      }, 200);
    });

    // ── Init ──────────────────────────────────────────────────
    buildDots();
    goTo(0);
    startAuto();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
