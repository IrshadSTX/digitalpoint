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

  /* ── 10. Course catalogue ─────────────────────────────── */
  function renderCatalogue() {
    const ugWrap = document.getElementById('cat-ug');
    const pgWrap = document.getElementById('cat-pg');
    const cat = CONTENT.catalogue;
    if (!cat) return;

    function chips(list) {
      return list.map((name) => `<span class="cat-chip">${name}</span>`).join('');
    }
    if (ugWrap && cat.ug) ugWrap.innerHTML = chips(cat.ug);
    if (pgWrap && cat.pg) pgWrap.innerHTML = chips(cat.pg);

    // Tab switching
    document.querySelectorAll('.cat-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-tab').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
        document.querySelectorAll('.cat-panel').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected','true');
        const panel = document.getElementById('cat-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ── 11. Popup course slider ─────────────────────────── */
  function renderPopupSlider() {
    const track = document.getElementById('pcs-track');
    const dotsWrap = document.getElementById('pcs-dots');
    const courses = CONTENT.courses?.items;
    if (!track || !courses?.length) return;

    track.innerHTML = courses.map((c, i) => `
      <div class="pcs-slide${i === 0 ? ' active' : ''}">
        <img src="${c.img}" alt="${c.name}" loading="lazy" />
        <div class="pcs-slide-name">${c.name}</div>
      </div>`).join('');

    if (dotsWrap) {
      dotsWrap.innerHTML = courses.map((_, i) =>
        `<div class="pcs-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></div>`
      ).join('');
    }
  }

  /* ── 11. Courses scroll section ───────────────────────── */
  function renderCoursesSection() {
    const wrap = document.getElementById('courses-track');
    const courses = CONTENT.courses?.items;
    if (!wrap || !courses?.length) return;

    wrap.innerHTML = courses.map((c) => `
      <div class="course-poster-card reveal" data-course-img="${c.img}" data-course-name="${c.name}">
        <img src="${c.img}" alt="${c.name}" loading="lazy" />
        <div class="course-poster-label">${c.name}</div>
      </div>`).join('');

    // Lightbox
    const lb = document.createElement('div');
    lb.className = 'course-lightbox';
    lb.id = 'course-lightbox';
    lb.innerHTML = `
      <button class="course-lightbox-close" id="clb-close" aria-label="Close">✕</button>
      <img id="clb-img" src="" alt="" />
      <div class="course-lightbox-name" id="clb-name"></div>`;
    document.body.appendChild(lb);

    wrap.querySelectorAll('.course-poster-card').forEach((card) => {
      card.addEventListener('click', () => {
        document.getElementById('clb-img').src = card.dataset.courseImg;
        document.getElementById('clb-img').alt = card.dataset.courseName;
        document.getElementById('clb-name').textContent = card.dataset.courseName;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.id === 'clb-close') {
        lb.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.classList.contains('open')) {
        lb.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 12. Social links ─────────────────────────────────── */
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
    renderCatalogue();
    renderPopupSlider();
    renderCoursesSection();
    injectSocialLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
