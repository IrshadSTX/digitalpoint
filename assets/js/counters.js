/**
 * counters.js
 * Animates numeric stat counters (.stat-num) when the .hero-stats
 * block enters the viewport.
 *
 * Supports suffixes like "+", "%", and text like "12 Yrs".
 * Numbers are parsed from the element's existing text content.
 */

(function () {
  'use strict';

  const DURATION_MS = 1400; // total animation time
  const FPS         = 60;
  const STEPS       = Math.round(DURATION_MS / (1000 / FPS));

  /**
   * Parse the initial text content of a .stat-num element into
   * { value: Number, suffix: String }.
   *
   * Examples:
   *   "2,400+" → { value: 2400, suffix: "+" }
   *   "98%"    → { value: 98,   suffix: "%" }
   *   "12 Yrs" → { value: 12,   suffix: " Yrs" }
   */
  function parse(el) {
    const raw   = el.textContent.trim();
    const match = raw.match(/^[\d,]+/);
    if (!match) return null;

    const value  = parseInt(match[0].replace(/,/g, ''), 10);
    const suffix = raw.slice(match[0].length); // everything after the number
    return { value, suffix };
  }

  /**
   * Format a number with thousand-separators if the original had them.
   */
  function format(n, useComma) {
    return useComma ? n.toLocaleString('en-IN') : String(n);
  }

  function animateCounter(el, value, suffix) {
    const useComma = el.textContent.includes(',');
    let   step     = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / STEPS;
      // Ease-out quad
      const eased    = 1 - Math.pow(1 - progress, 2);
      const current  = Math.round(value * eased);

      el.textContent = format(current, useComma) + suffix;

      if (step >= STEPS) {
        clearInterval(timer);
        el.textContent = format(value, useComma) + suffix; // exact final value
      }
    }, 1000 / FPS);
  }

  function initCounters() {
    const statsBlock = document.querySelector('.hero-stats');
    if (!statsBlock) return;

    // Collect all stat elements and their parsed targets before animating
    const stats = [];
    statsBlock.querySelectorAll('.stat-num').forEach((el) => {
      const parsed = parse(el);
      if (parsed) stats.push({ el, ...parsed });
    });

    if (!stats.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          stats.forEach(({ el, value, suffix }) => animateCounter(el, value, suffix));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.40 }
    );

    observer.observe(statsBlock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
