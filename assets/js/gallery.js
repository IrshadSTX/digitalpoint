/**
 * gallery.js
 * Handles:
 *   1. Photo / Video tab switching
 *   2. Photo lightbox (click image → full screen)
 *   3. Video modal (click play → YouTube embed in modal)
 */

(function () {
  'use strict';

  /* ── Tab switching ─────────────────────────────────────────── */
  function initTabs() {
    const tabs    = document.querySelectorAll('.gallery-tab');
    const photos  = document.getElementById('tab-photos');
    const videos  = document.getElementById('tab-videos');
    if (!tabs.length || !photos || !videos) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.tab === 'photos') {
          photos.classList.remove('hidden');
          videos.classList.add('hidden');
        } else {
          videos.classList.remove('hidden');
          photos.classList.add('hidden');
        }
      });
    });
  }

  /* ── Lightbox (photos) ─────────────────────────────────────── */
  function initLightbox() {
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn    = document.getElementById('lightbox-close');
    if (!lightbox || !lightboxImg) return;

    // Open on clicking any real (non-placeholder) media-item
    document.querySelectorAll('.media-item:not(.media-placeholder)').forEach((item) => {
      item.addEventListener('click', () => {
        const src = item.querySelector('img')?.src || item.dataset.src;
        if (!src) return;
        lightboxImg.src = src;
        lightboxImg.alt = item.dataset.alt || 'Gallery image';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function close() {
      lightbox.classList.remove('open');
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ── Video modal ───────────────────────────────────────────── */
  function initVideoModal() {
    const modal    = document.getElementById('video-modal');
    const iframe   = document.getElementById('video-iframe');
    const closeBtn = document.getElementById('video-modal-close');
    if (!modal || !iframe) return;

    document.querySelectorAll('.video-thumb').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const url = thumb.dataset.video;
        if (!url) return;
        // Append autoplay
        iframe.src = url.includes('?') ? url + '&autoplay=1' : url + '?autoplay=1';
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function close() {
      modal.classList.remove('open');
      iframe.src = '';                     // stop playback
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function init() {
    initTabs();
    initLightbox();
    initVideoModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
