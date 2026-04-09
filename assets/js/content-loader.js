/**
 * content-loader.js
 * Reads the CONTENT object from content.js and injects all
 * values into the DOM using [data-c="key.path"] attributes.
 *
 * Must load AFTER content.js (see index.html script order).
 */

(function () {
  'use strict';

  if (typeof CONTENT === 'undefined') {
    console.error('[content-loader] content.js not loaded.');
    return;
  }

  /* ── Helper: deep-get "a.b.c" from object ─────────────── */
  function get(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  /* ── 1. Simple text / html injection via [data-c] ─────── */
  function injectText() {
    document.querySelectorAll('[data-c]').forEach((el) => {
      const val = get(CONTENT, el.dataset.c);
      if (val !== null) el.textContent = val;
    });
  }

  /* ── 2. Link href injection via [data-href] ───────────── */
  function injectHrefs() {
    document.querySelectorAll('[data-href]').forEach((el) => {
      const val = get(CONTENT, el.dataset.href);
      if (val !== null) el.href = val;
    });
  }

  /* ── 3. Features strip ────────────────────────────────── */
  function renderFeatures() {
    const wrap = document.getElementById('features-strip');
    if (!wrap || !CONTENT.features) return;
    wrap.innerHTML = CONTENT.features.map((f) => `
      <div class="feature-item">
        <div class="feature-icon-wrap" aria-hidden="true">${f.icon}</div>
        <div class="feature-text">
          <strong>${f.title}</strong>
          <span>${f.desc}</span>
        </div>
      </div>`).join('');
  }

  /* ── 4. Why-us cards ──────────────────────────────────── */
  function renderWhyCards() {
    const wrap = document.getElementById('why-grid');
    if (!wrap || !CONTENT.why?.cards) return;
    wrap.innerHTML = CONTENT.why.cards.map((c, i) => `
      <div class="why-card reveal" style="transition-delay:${i * 0.1}s">
        <div class="why-icon">${c.icon}</div>
        <div class="why-label">${c.title}</div>
        <p class="why-desc">${c.desc}</p>
      </div>`).join('');
  }

  /* ── 5. Process steps ─────────────────────────────────── */
  function renderSteps() {
    const wrap = document.getElementById('process-steps');
    if (!wrap || !CONTENT.process?.steps) return;
    wrap.innerHTML = CONTENT.process.steps.map((s, i) => `
      <div class="step reveal" style="transition-delay:${i * 0.12}s">
        <div class="step-num">${s.num}</div>
        <h4 class="step-title">${s.title}</h4>
        <p class="step-desc">${s.desc}</p>
      </div>`).join('');
  }

  /* ── 6. Achievements carousel cards ──────────────────── */
  function renderAchievements() {
    const wrap = document.getElementById('carousel-track');
    if (!wrap || !CONTENT.achievements) return;
    wrap.innerHTML = CONTENT.achievements.map((a) => `
      <div class="achievement-card">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-num">${a.num}</div>
        <div class="ach-title">${a.title}</div>
        <p class="ach-desc">${a.desc}</p>
      </div>`).join('');
  }

  /* ── 7. Testimonials ──────────────────────────────────── */
  function renderTestimonials() {
    const wrap = document.getElementById('testimonials-grid');
    if (!wrap || !CONTENT.testimonials?.cards) return;
    wrap.innerHTML = CONTENT.testimonials.cards.map((t, i) => `
      <article class="testimonial-card reveal" style="transition-delay:${i * 0.12}s">
        <div class="quote-mark" aria-hidden="true">"</div>
        <div class="stars" aria-label="${t.stars} out of 5 stars">${'★'.repeat(t.stars)}</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">
          <div class="author-avatar" aria-hidden="true">${t.initials}</div>
          <div>
            <div class="author-name">${t.name}</div>
            <div class="author-meta">${t.meta}</div>
          </div>
        </div>
      </article>`).join('');
  }

  /* ── 8. Gallery photos ────────────────────────────────── */
  function renderPhotos() {
    const wrap = document.getElementById('tab-photos');
    if (!wrap || !CONTENT.gallery?.photos) return;
    wrap.innerHTML = CONTENT.gallery.photos.map((p) => {
      if (!p.src) {
        return `<div class="media-item media-placeholder">
          <div class="placeholder-inner"><span>📷</span><p>Add photo here</p></div>
        </div>`;
      }
      return `<div class="media-item" data-alt="${p.alt}">
        <img src="${p.src}" alt="${p.alt}" loading="lazy" />
      </div>`;
    }).join('');
  }

  /* ── 9. Gallery videos ────────────────────────────────── */
  function renderVideos() {
    const wrap = document.getElementById('tab-videos');
    if (!wrap || !CONTENT.gallery?.videos) return;
    wrap.innerHTML = CONTENT.gallery.videos.map((v, i) => {
      const embedUrl = v.id
        ? `https://www.youtube.com/embed/${v.id}`
        : 'https://www.youtube.com/embed/';
      return `<div class="video-card reveal" style="transition-delay:${i * 0.1}s">
        <div class="video-thumb" data-video="${embedUrl}">
          ${v.id
            ? `<img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="${v.caption}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" />`
            : ''}
          <div class="play-btn" aria-label="Play video">▶</div>
          <p class="video-caption">${v.caption}</p>
        </div>
      </div>`;
    }).join('');
  }

  /* ── 10. Popup features ───────────────────────────────── */
  function renderPopupFeatures() {
    const wrap = document.getElementById('popup-features');
    if (!wrap) return;
    const p = CONTENT.popup;
    if (!p) return;
    const feats = [p.feat1, p.feat2, p.feat3, p.feat4];
    const icons = ['✅','🏛️','📱','📚'];
    wrap.innerHTML = feats.map((f, i) => `
      <div class="popup-feat"><span>${icons[i]}</span> ${f}</div>`).join('');
  }

  /* ── 11. Social links ─────────────────────────────────── */
  function injectSocialLinks() {
    const s = CONTENT.social;
    if (!s) return;
    const map = { instagram: s.instagram, facebook: s.facebook, x: s.x, telegram: s.telegram };
    Object.entries(map).forEach(([platform, url]) => {
      document.querySelectorAll(`[data-social="${platform}"]`).forEach((el) => {
        el.href = url;
      });
    });
  }

  /* ── Run all ──────────────────────────────────────────── */
  function run() {
    injectText();
    injectHrefs();
    renderFeatures();
    renderWhyCards();
    renderSteps();
    renderAchievements();
    renderTestimonials();
    renderPhotos();
    renderVideos();
    renderPopupFeatures();
    injectSocialLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
