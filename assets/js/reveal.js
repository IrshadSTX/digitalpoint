/**
 * reveal.js
 * Triggers the .reveal → .visible transition for every element
 * that carries the .reveal class as it enters the viewport.
 */

(function () {
  'use strict';

  const THRESHOLD = 0.10; // 10 % of the element must be visible

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // fire once
      });
    },
    { threshold: THRESHOLD }
  );

  // Observe every .reveal element present in the DOM at load time.
  // If elements are injected dynamically, call observeRevealElements() again.
  function observeRevealElements() {
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeRevealElements);
  } else {
    observeRevealElements();
  }
})();
