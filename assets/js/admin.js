/**
 * admin.js — Digital Point site management
 * ────────────────────────────────────────────────────────────
 * The website is a static GitHub Pages site, so there is no server.
 * The admin signs in with a GitHub fine-grained access token that can
 * write to this repository. Edits are made to the CONTENT object (the
 * same one content.js defines) and published as ONE commit on the
 * Pages branch: the new content.js plus any uploaded images.
 * GitHub Pages then rebuilds the live site (~1–2 minutes).
 */

(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────── */
  const CFG = {
    owner: 'IrshadSTX',
    repo: 'digitalpoint',
    branch: 'main',            // GitHub Pages source branch
    contentPath: 'content.js',
    api: 'https://api.github.com',
    maxImageSide: 1600,        // px — larger uploads are scaled down
    jpegQuality: 0.85,
  };
  const TOKEN_KEY = 'dp_admin_token';

  /* Section metadata — order = sidebar order. Unknown keys in
     content.js are still editable; they appear at the end. */
  const SECTIONS = [
    { key: 'company',      icon: '🏢', label: 'Company Info',      hint: 'Name, address, phone numbers and email used across the site.' },
    { key: 'social',       icon: '🔗', label: 'Social Links',      hint: 'Links for the social media icons. Use # to hide a link target.' },
    { key: 'nav',          icon: '🧭', label: 'Navbar',            hint: 'Top navigation bar.' },
    { key: 'popup',        icon: '💬', label: 'Admission Popup',   hint: 'The popup shown to visitors. Its course slider uses the images under "More Courses".' },
    { key: 'institute',    icon: '🏫', label: 'Institute Slider',  hint: 'Full-width institute photos at the very top of the page.', imgDir: 'assets/images/institute' },
    { key: 'hero',         icon: '✨', label: 'Hero',              hint: 'Main headline, buttons and statistics.' },
    { key: 'card',         icon: '📝', label: 'Enquiry Card',      hint: 'The free counselling form next to the hero.' },
    { key: 'features',     icon: '✅', label: 'Features Strip',    hint: 'Short highlights below the hero.' },
    { key: 'faculty',      icon: '🧑‍🏫', label: 'Faculty',           hint: 'Faculty photos in the "Learn From Experienced Experts" grid.', imgDir: 'assets/images/faculties' },
    { key: 'app',          icon: '📱', label: 'DiGi App',          hint: 'Store links and the screenshots shown inside the phone.', imgDir: 'assets/images/mobile' },
    { key: 'achievements', icon: '🏆', label: 'Achievements',      hint: 'Cards in the achievements carousel.' },
    { key: 'programs',     icon: '🎓', label: 'Programs',          hint: 'Universities and the B.Ed / M.Ed program cards.' },
    { key: 'catalogue',    icon: '📚', label: 'Course Catalogue',  hint: 'UG and PG course lists, one course per line.' },
    { key: 'courses',      icon: '🖼️', label: 'More Courses',      hint: 'Course posters. Also used in the scrolling poster strip and the popup slider.', imgDir: 'assets/images/courses' },
    { key: 'why',          icon: '💡', label: 'Why Choose Us',     hint: 'Reasons to choose Digital Point.' },
    { key: 'process',      icon: '🪜', label: 'Admission Process', hint: 'The step-by-step admission process.' },
    { key: 'gallery',      icon: '📷', label: 'Gallery',           hint: 'Photos and YouTube videos. Note: the Gallery section is currently switched off on the website, so changes here will not be visible to visitors.', imgDir: 'assets/images/gallery' },
    { key: 'testimonials', icon: '⭐', label: 'Testimonials',      hint: 'Student reviews.' },
    { key: 'cta',          icon: '📣', label: 'Call To Action',    hint: 'The "Seats are limited" band near the bottom.' },
  ];

  const FIELD_LABELS = {
    section_label: 'Small label above title', section_title: 'Section title',
    section_title_span: 'Section title (highlighted part)', section_sub: 'Section subtitle',
    cta: 'Button text', cta_btn: 'Button text', later_btn: '"Later" button text',
    cta_primary: 'Primary button text', cta_secondary: 'Secondary button text',
    btn_primary: 'Primary button text', btn_social: 'Social button text',
    img: 'Image', src: 'Image', alt: 'Image description (alt text)',
    url: 'Website link', desc: 'Description', num: 'Number / value', meta: 'Course · Place',
    initials: 'Initials (avatar)', stars: 'Star rating (1–5)', featured: 'Highlight this card',
    ug: 'UG courses', pg: 'PG courses', details: 'Bullet points', id: 'YouTube video ID',
    full: 'Full name', x: 'X (Twitter)', android: 'Play Store link', ios: 'App Store link',
    phone1: 'Phone 1', phone2: 'Phone 2', phone3: 'Phone 3', items: 'Items', cards: 'Cards',
    screens: 'App screenshots', slides: 'Slides', photos: 'Photos', videos: 'Videos',
    steps: 'Steps', universities: 'Universities',
  };
  const LONG_TEXT_KEYS = new Set(['desc', 'text', 'subtitle', 'section_sub']);
  const IMAGE_KEYS = new Set(['img', 'src']);
  const TITLE_KEYS = ['name', 'title', 'caption', 'subject', 'alt', 'num'];

  /* ── State ───────────────────────────────────────────────── */
  let token = null;
  let original = null;          // CONTENT as last loaded / published
  let state = null;             // working copy being edited
  let contentSha = null;        // blob sha of content.js we loaded
  let currentKey = null;
  const pendingImages = new Map();   // repo path -> { base64 }
  const previews = new Map();        // repo path -> dataURL (local preview)
  const pendingDeletes = new Set();  // repo paths staged for deletion
  let repoFiles = new Map();         // image path in git -> { size }
  let headSha = null;                // commit the admin is looking at
  let protectedPaths = new Set();    // images referenced by index.html / CSS
  const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

  /* ── DOM helpers ─────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else if (k === 'value') el.value = v;
        else if (k === 'checked') el.checked = !!v;
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  function show(id, on) { $(id).hidden = !on; }

  function toast(msg, type = 'info', ms = 4500) {
    const t = h('div', { class: `adm-toast adm-toast-${type}` }, msg);
    $('adm-toasts').append(t);
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 400);
  }

  function humanize(key) {
    if (FIELD_LABELS[key]) return FIELD_LABELS[key];
    return String(key)
      .replace(/_/g, ' ')
      .replace(/(\D)(\d+)/g, '$1 $2')
      .replace(/^./, (c) => c.toUpperCase());
  }

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const sectionMeta = (key) => SECTIONS.find((s) => s.key === key) || { key, icon: '📄', label: humanize(key), hint: '' };

  /* ── Path helpers ────────────────────────────────────────── */
  function getAt(path) { return path.reduce((o, k) => (o == null ? o : o[k]), state); }
  function setAt(path, value) {
    const parent = getAt(path.slice(0, -1));
    parent[path[path.length - 1]] = value;
    onChange();
  }

  /* ── Encoding helpers ────────────────────────────────────── */
  function b64ToUtf8(b64) {
    const bin = atob(b64.replace(/\s/g, ''));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  }

  /* ── GitHub API ──────────────────────────────────────────── */
  async function gh(path, { method = 'GET', body } = {}) {
    const res = await fetch(CFG.api + path, {
      method,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let msg = res.statusText;
      try { msg = (await res.json()).message || msg; } catch (_) { /* ignore */ }
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  const repoPath = (p) => `/repos/${CFG.owner}/${CFG.repo}${p}`;

  /* ── Storage (may be blocked) ────────────────────────────── */
  function readToken() {
    try { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
  }
  function writeToken(tok, remember) {
    try {
      (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, tok);
      (remember ? sessionStorage : localStorage).removeItem(TOKEN_KEY);
    } catch (_) { /* session only in memory */ }
  }
  function clearToken() {
    try { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); } catch (_) { /* ignore */ }
  }

  /* ════════════════════════════════════════════════════════════
     AUTH
  ════════════════════════════════════════════════════════════ */
  async function verify(tok) {
    token = tok;
    const user = await gh('/user');
    const repo = await gh(repoPath(''));
    if (!repo.permissions || !repo.permissions.push) {
      throw new Error('This account does not have permission to edit the website.');
    }
    return user;
  }

  function friendlyAuthError(err) {
    if (err.status === 401) return 'That token is invalid or has expired. Please create a new one.';
    if (err.status === 403 || err.status === 404) return 'This token cannot access the website repository. Check that it has access to "digitalpoint".';
    if (err instanceof TypeError) return 'Could not reach GitHub. Check your internet connection.';
    return err.message;
  }

  async function onLogin(e) {
    e.preventDefault();
    const tok = $('adm-token').value.trim();
    const errEl = $('adm-login-error');
    errEl.hidden = true;
    if (!tok) return;
    const btn = $('adm-login-btn');
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      const user = await verify(tok);
      writeToken(tok, $('adm-remember').checked);
      $('adm-token').value = '';
      await enterApp(user);
    } catch (err) {
      token = null;
      errEl.textContent = friendlyAuthError(err);
      errEl.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  }

  function signOut() {
    if (isDirty() && !confirm('You have unpublished changes. Sign out and lose them?')) return;
    clearToken();
    token = null; original = state = null;
    pendingImages.clear(); previews.clear(); pendingDeletes.clear();
    show('adm-app', false); show('adm-savebar', false); show('adm-user', false);
    show('adm-login', true);
  }

  /* ════════════════════════════════════════════════════════════
     LOAD CONTENT
  ════════════════════════════════════════════════════════════ */
  async function loadContent() {
    const file = await gh(repoPath(`/contents/${CFG.contentPath}?ref=${CFG.branch}`));
    const src = b64ToUtf8(file.content);
    // content.js declares `const CONTENT = {...}` — evaluate it in isolation.
    const data = new Function(`${src}\n;return CONTENT;`)();
    if (!data || typeof data !== 'object') throw new Error('content.js did not define CONTENT.');
    contentSha = file.sha;
    original = data;
    state = clone(data);
    await loadRepoImages();
  }

  /* Every image file in the repo (one request) + images that
     index.html / CSS reference directly, which must never be deleted. */
  async function loadRepoImages() {
    const ref = await gh(repoPath(`/git/ref/heads/${CFG.branch}`));
    headSha = ref.object.sha;
    const tree = await gh(repoPath(`/git/trees/${headSha}?recursive=1`));
    repoFiles = new Map();
    const pageFiles = [];
    for (const t of tree.tree) {
      if (t.type !== 'blob') continue;
      if (t.path.startsWith('assets/images/') && IMAGE_RE.test(t.path)) repoFiles.set(t.path, { size: t.size });
      if (/\.(html|css)$/.test(t.path) && t.path !== 'admin.html' && !t.path.endsWith('admin.css')) pageFiles.push(t.path);
    }
    protectedPaths = new Set();
    await Promise.all(pageFiles.map(async (p) => {
      try {
        const text = await (await fetch(rawUrl(p), { cache: 'no-store' })).text();
        for (const m of text.matchAll(/assets\/images\/[\w\-./]+/g)) protectedPaths.add(m[0]);
      } catch (_) { /* best effort */ }
    }));
  }

  function rawUrl(p) {
    return `https://raw.githubusercontent.com/${CFG.owner}/${CFG.repo}/${headSha}/${p.split('/').map(encodeURIComponent).join('/')}`;
  }

  /* Where to show an image from: a fresh upload, else git, else as-is. */
  function imageSrc(p) {
    if (!p) return '';
    if (previews.has(p)) return previews.get(p);
    if (repoFiles.has(p) && headSha) return rawUrl(p);
    return p;
  }

  function isUsed(p) {
    return protectedPaths.has(p) || JSON.stringify(state).includes(JSON.stringify(p));
  }

  async function enterApp(user) {
    show('adm-login', false);
    show('adm-loading', true);
    $('adm-loading-text').textContent = 'Loading website content…';
    try {
      await loadContent();
    } catch (err) {
      show('adm-loading', false);
      show('adm-login', true);
      const errEl = $('adm-login-error');
      errEl.textContent = 'Could not load content: ' + friendlyAuthError(err);
      errEl.hidden = false;
      return;
    }
    show('adm-user', true);
    show('adm-loading', false);
    show('adm-app', true);
    const first = sectionKeys()[0];
    selectSection(location.hash.slice(1) in state ? location.hash.slice(1) : first);
    updateSaveBar();
  }

  /* ════════════════════════════════════════════════════════════
     SIDEBAR + SECTIONS
  ════════════════════════════════════════════════════════════ */
  function sectionKeys() {
    const known = SECTIONS.map((s) => s.key).filter((k) => k in state);
    const extra = Object.keys(state).filter((k) => !known.includes(k));
    return [...known, ...extra];
  }

  function hasImages(val, key) {
    if (typeof val === 'string') return IMAGE_KEYS.has(key);
    if (Array.isArray(val)) return val.some((v) => hasImages(v, key));
    if (val && typeof val === 'object') return Object.entries(val).some(([k, v]) => hasImages(v, k));
    return false;
  }

  function renderSidebar() {
    const nav = $('adm-sidebar');
    nav.innerHTML = '';
    nav.append(h('div', { class: 'adm-sidebar-title' }, 'Sections'));
    for (const key of sectionKeys()) {
      const m = sectionMeta(key);
      const dirty = JSON.stringify(state[key]) !== JSON.stringify(original[key]);
      nav.append(h('button', {
        type: 'button',
        class: 'adm-nav-item' + (key === currentKey ? ' active' : ''),
        'aria-current': key === currentKey ? 'page' : null,
        onclick: () => selectSection(key),
      },
        h('span', { class: 'adm-nav-label' }, m.label),
        hasImages(state[key]) ? h('span', { class: 'adm-nav-tag', title: 'Has images' }, '🖼') : null,
        dirty ? h('span', { class: 'adm-nav-dirty', title: 'Unsaved changes' }) : null,
      ));
    }
  }

  function selectSection(key) {
    currentKey = key;
    history.replaceState(null, '', '#' + key);
    renderSidebar();
    renderSection();
    window.scrollTo({ top: 0 });
    const active = $('adm-sidebar').querySelector('.active');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function renderSection() {
    const wrap = $('adm-section');
    const y = window.scrollY;
    wrap.innerHTML = '';
    const m = sectionMeta(currentKey);
    wrap.append(
      h('div', { class: 'adm-section-head' },
        h('h1', null, h('span', { 'aria-hidden': 'true' }, m.icon + ' '), m.label),
        m.hint ? h('p', { class: 'adm-muted' }, m.hint) : null),
    );
    wrap.append(renderBlock(state[currentKey], [currentKey], currentKey));
    if (sectionMeta(currentKey).imgDir) wrap.append(h('div', { id: 'adm-library' }));
    renderLibraryOnly();
    window.scrollTo({ top: y });
  }

  /* ════════════════════════════════════════════════════════════
     IMAGE LIBRARY — every image in this heading's git folder
  ════════════════════════════════════════════════════════════ */
  function libraryDir(sectionKey, currentPath) {
    if (currentPath && currentPath.includes('/')) return currentPath.slice(0, currentPath.lastIndexOf('/'));
    return sectionMeta(sectionKey).imgDir || 'assets/images';
  }

  function filesIn(dir) {
    const set = new Set();
    for (const p of repoFiles.keys()) if (p.startsWith(dir + '/') && !p.slice(dir.length + 1).includes('/')) set.add(p);
    for (const p of pendingImages.keys()) if (p.startsWith(dir + '/') && isUsed(p)) set.add(p);
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  function fmtSize(bytes) {
    if (bytes == null) return 'new';
    return bytes > 1024 * 1024 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
  }

  function renderLibraryOnly() {
    const host = document.getElementById('adm-library');
    if (!host) return;
    const dir = sectionMeta(currentKey).imgDir;
    const files = filesIn(dir);
    const unused = files.filter((p) => !isUsed(p) && !pendingImages.has(p));
    // An image that is used again must not stay staged for deletion
    for (const p of [...pendingDeletes]) if (isUsed(p)) pendingDeletes.delete(p);

    const allStaged = unused.length > 0 && unused.every((p) => pendingDeletes.has(p));
    host.innerHTML = '';
    host.append(
      h('div', { class: 'adm-lib-head' },
        h('h2', { class: 'adm-subhead' }, 'Image library'),
        unused.length
          ? h('button', {
              type: 'button', class: 'adm-btn adm-btn-sm adm-btn-ghost',
              onclick: () => {
                unused.forEach((p) => (allStaged ? pendingDeletes.delete(p) : pendingDeletes.add(p)));
                renderLibraryOnly(); onChange();
              },
            }, allStaged ? 'Keep all unused' : `Delete all unused (${unused.length})`)
          : null),
      h('p', { class: 'adm-muted adm-lib-note' },
        `All images stored in ${dir}/. Images marked "Not used" are not shown anywhere on the website and can be deleted. Images in use cannot be deleted. Replace or remove them above first.`));

    if (!files.length) {
      host.append(h('div', { class: 'adm-card adm-muted' }, 'No images in this folder yet.'));
      return;
    }
    host.append(h('div', { class: 'adm-lib-grid' }, files.map((p) => {
      const used = isUsed(p);
      const isNew = pendingImages.has(p);
      const staged = pendingDeletes.has(p);
      const info = repoFiles.get(p);
      return h('div', { class: 'adm-lib-item' + (staged ? ' adm-lib-staged' : '') + (used ? '' : ' adm-lib-unused') },
        h('div', { class: 'adm-lib-thumb' }, h('img', { src: imageSrc(p), alt: '', loading: 'lazy' })),
        h('div', { class: 'adm-lib-meta' },
          h('span', { class: 'adm-lib-name', title: p }, p.split('/').pop()),
          h('span', { class: 'adm-lib-size' }, fmtSize(info && info.size))),
        h('div', { class: 'adm-lib-foot' },
          isNew ? h('span', { class: 'adm-pill adm-pill-new' }, 'New')
            : used ? h('span', { class: 'adm-pill adm-pill-used' }, protectedPaths.has(p) ? 'Used by page' : 'In use')
            : staged ? h('span', { class: 'adm-pill adm-pill-del' }, 'Will be deleted')
            : h('span', { class: 'adm-pill' }, 'Not used'),
          !used && !isNew
            ? h('button', {
                type: 'button', class: 'adm-btn adm-btn-sm ' + (staged ? 'adm-btn-ghost' : 'adm-btn-danger'),
                onclick: () => { staged ? pendingDeletes.delete(p) : pendingDeletes.add(p); renderLibraryOnly(); onChange(); },
              }, staged ? 'Undo' : 'Delete')
            : null));
    })));
  }

  /* Picker dialog: choose an existing image from git */
  function pickFromLibrary(dir, onPick) {
    const files = filesIn(dir);
    const dlg = h('dialog', { class: 'adm-dialog adm-dialog-wide' });
    const close = () => { dlg.close(); dlg.remove(); };
    dlg.append(h('div', { class: 'adm-dialog-body' },
      h('h2', null, 'Choose an existing image'),
      h('p', { class: 'adm-muted' }, `From ${dir}/ in the website repository.`),
      files.length
        ? h('div', { class: 'adm-lib-grid adm-lib-pick' }, files.map((p) => h('button', {
            type: 'button', class: 'adm-lib-item adm-lib-choice',
            onclick: () => { onPick(p); close(); },
          },
            h('div', { class: 'adm-lib-thumb' }, h('img', { src: imageSrc(p), alt: '', loading: 'lazy' })),
            h('div', { class: 'adm-lib-meta' }, h('span', { class: 'adm-lib-name' }, p.split('/').pop()),
              h('span', { class: 'adm-lib-size' }, isUsed(p) ? 'in use' : 'not used')))))
        : h('p', { class: 'adm-muted' }, 'No images in this folder yet. Use "Upload new" instead.'),
      h('div', { class: 'adm-dialog-actions' },
        h('button', { type: 'button', class: 'adm-btn adm-btn-ghost', onclick: close }, 'Cancel'))));
    dlg.addEventListener('cancel', () => setTimeout(() => dlg.remove(), 0));
    document.body.append(dlg);
    dlg.showModal();
  }

  function stagedDeletes() {
    return [...pendingDeletes].filter((p) => repoFiles.has(p) && !isUsed(p));
  }

  /* ════════════════════════════════════════════════════════════
     FORM RENDERING
  ════════════════════════════════════════════════════════════ */
  function isStringList(val) {
    return Array.isArray(val) && val.every((v) => typeof v === 'string');
  }

  /* An object/array at any depth → cards. Primitives grouped. */
  function renderBlock(val, path, key) {
    if (Array.isArray(val)) {
      return isStringList(val)
        ? h('div', { class: 'adm-card' }, stringListField(val, path, key))
        : repeater(val, path, key);
    }
    if (val && typeof val === 'object') {
      const frag = document.createDocumentFragment();
      const prims = Object.entries(val).filter(([, v]) => v === null || typeof v !== 'object' || isStringList(v));
      const nested = Object.entries(val).filter(([, v]) => v !== null && typeof v === 'object' && !isStringList(v));
      if (prims.length) {
        frag.append(h('div', { class: 'adm-card' },
          h('div', { class: 'adm-grid' }, prims.map(([k, v]) => field(k, v, [...path, k], path[0])))));
      }
      for (const [k, v] of nested) {
        frag.append(h('h2', { class: 'adm-subhead' }, humanize(k)));
        frag.append(renderBlock(v, [...path, k], k));
      }
      return frag;
    }
    return h('div', { class: 'adm-card' }, field(key, val, path, path[0]));
  }

  function field(key, val, path, sectionKey) {
    if (isStringList(val)) return stringListField(val, path, key);
    if (IMAGE_KEYS.has(key) && (typeof val === 'string')) return imageField(key, val, path, sectionKey);
    const label = humanize(key);

    if (typeof val === 'boolean') {
      return h('label', { class: 'adm-check adm-span-2' },
        h('input', { type: 'checkbox', checked: val, onchange: (e) => setAt(path, e.target.checked) }),
        h('span', null, label));
    }
    if (typeof val === 'number') {
      const isStars = key === 'stars';
      return h('label', { class: 'adm-field' },
        h('span', { class: 'adm-label' }, label),
        h('input', {
          type: 'number', value: val, min: isStars ? 1 : null, max: isStars ? 5 : null,
          oninput: (e) => { const n = Number(e.target.value); if (!Number.isNaN(n)) setAt(path, n); },
        }));
    }
    const str = val == null ? '' : String(val);
    const long = LONG_TEXT_KEYS.has(key) || str.length > 70;
    const onInput = (e) => { setAt(path, e.target.value); updateItemTitle(e.target, key, e.target.value); };
    return h('label', { class: 'adm-field' + (long ? ' adm-span-2' : '') },
      h('span', { class: 'adm-label' }, label),
      long
        ? h('textarea', { rows: Math.min(6, Math.max(2, Math.ceil(str.length / 80))), value: str, oninput: onInput })
        : h('input', { type: /url|android|ios|instagram|facebook|telegram|^x$/.test(key) ? 'url' : 'text', value: str, oninput: onInput }));
  }

  function stringListField(val, path, key) {
    return h('label', { class: 'adm-field adm-span-2' },
      h('span', { class: 'adm-label' }, humanize(key), h('em', { class: 'adm-label-note' }, ' — one per line')),
      h('textarea', {
        rows: Math.min(14, Math.max(3, val.length + 1)),
        value: val.join('\n'),
        oninput: (e) => setAt(path, e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)),
      }));
  }

  /* ── Repeatable cards (arrays of objects) ────────────────── */
  function itemTitle(item, i) {
    if (item && typeof item === 'object') {
      for (const k of TITLE_KEYS) if (item[k]) return String(item[k]);
    }
    return `Item ${i + 1}`;
  }

  function updateItemTitle(input, key, value) {
    if (!TITLE_KEYS.includes(key)) return;
    const card = input.closest('.adm-item');
    if (!card) return;
    const t = card.querySelector('.adm-item-title');
    const idx = Number(card.dataset.idx);
    if (t) t.textContent = itemTitle(getAt(JSON.parse(card.dataset.path)), idx);
  }

  function blankLike(tpl) {
    if (Array.isArray(tpl)) return [];
    if (tpl && typeof tpl === 'object') {
      const o = {};
      for (const [k, v] of Object.entries(tpl)) o[k] = blankLike(v);
      return o;
    }
    if (typeof tpl === 'number') return tpl;
    if (typeof tpl === 'boolean') return false;
    return '';
  }

  function repeater(arr, path, key) {
    const imageList = arr.some((it) => it && typeof it === 'object' && Object.keys(it).some((k) => IMAGE_KEYS.has(k)));
    const list = h('div', { class: 'adm-items' + (imageList ? ' adm-items-grid' : '') });

    arr.forEach((item, i) => {
      const itemPath = [...path, i];
      const move = (d) => {
        const j = i + d;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        onChange(); renderSection();
      };
      const remove = () => {
        if (!confirm(`Remove "${itemTitle(item, i)}"?`)) return;
        arr.splice(i, 1);
        onChange(); renderSection();
      };
      const body = h('div', { class: 'adm-item-body' });
      if (item && typeof item === 'object') {
        const entries = Object.entries(item);
        // image first, then the rest
        entries.sort(([a], [b]) => (IMAGE_KEYS.has(b) ? 1 : 0) - (IMAGE_KEYS.has(a) ? 1 : 0));
        const grid = h('div', { class: 'adm-grid' + (imageList ? ' adm-grid-1' : '') });
        for (const [k, v] of entries) {
          if (v && typeof v === 'object' && !isStringList(v)) {
            body.append(h('h3', { class: 'adm-subhead adm-subhead-sm' }, humanize(k)), renderBlock(v, [...itemPath, k], k));
          } else {
            grid.append(field(k, v, [...itemPath, k], path[0]));
          }
        }
        body.prepend(grid);
      } else {
        body.append(field(key, item, itemPath, path[0]));
      }

      list.append(h('div', { class: 'adm-item', 'data-idx': i, 'data-path': JSON.stringify(itemPath) },
        h('div', { class: 'adm-item-head' },
          h('span', { class: 'adm-item-num' }, String(i + 1)),
          h('span', { class: 'adm-item-title' }, itemTitle(item, i)),
          h('div', { class: 'adm-item-tools' },
            h('button', { type: 'button', class: 'adm-icon-btn', title: 'Move up', 'aria-label': 'Move up', disabled: i === 0, onclick: () => move(-1) }, imageList ? '←' : '↑'),
            h('button', { type: 'button', class: 'adm-icon-btn', title: 'Move down', 'aria-label': 'Move down', disabled: i === arr.length - 1, onclick: () => move(1) }, imageList ? '→' : '↓'),
            h('button', { type: 'button', class: 'adm-icon-btn adm-icon-danger', title: 'Remove', 'aria-label': 'Remove', onclick: remove }, '✕'))),
        body));
    });

    const add = () => {
      arr.push(blankLike(arr[0] ?? ''));
      onChange(); renderSection();
      const items = $('adm-section').querySelectorAll(`.adm-item[data-path^='${JSON.stringify(path).slice(0, -1)}']`);
      const last = items[items.length - 1];
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return h('div', { class: 'adm-repeater' },
      list,
      h('button', { type: 'button', class: 'adm-btn adm-btn-add', onclick: add }, `+ Add ${singular(humanize(key))}`));
  }

  function singular(label) {
    const s = label.toLowerCase();
    if (s.endsWith('ies')) return s.slice(0, -3) + 'y';
    if (s.endsWith('s')) return s.slice(0, -1);
    return s;
  }

  /* ── Image field ─────────────────────────────────────────── */
  function imageField(key, val, path, sectionKey) {
    const img = h('img', { alt: '', class: 'adm-img-preview' });
    const empty = h('div', { class: 'adm-img-empty' }, '🖼', h('span', null, 'No image'));
    const pathText = h('span', { class: 'adm-img-path' });
    const input = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', hidden: true });

    function paint(p) {
      const src = imageSrc(p);
      img.hidden = !src; empty.hidden = !!src;
      if (src) img.src = src;
      pathText.textContent = p ? p.split('/').pop() : '';
      const isNew = pendingImages.has(p);
      box.classList.toggle('adm-img-new', isNew);
    }

    async function handle(file) {
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast('Please choose a JPG, PNG or WebP image.', 'error'); return; }
      box.classList.add('adm-img-busy');
      try {
        const { dataUrl, base64 } = await processImage(file);
        const current = getAt(path) || '';
        const dir = current.includes('/') ? current.slice(0, current.lastIndexOf('/'))
          : (sectionMeta(sectionKey).imgDir || 'assets/images/uploads');
        const item = getAt(path.slice(0, -1));
        const base = slug((item && (item.name || item.title || item.alt || item.caption)) || file.name.replace(/\.[^.]+$/, '')) || 'image';
        const newPath = `${dir}/${base}-${Date.now().toString(36)}.jpg`;
        pendingImages.set(newPath, { base64 });
        previews.set(newPath, dataUrl);
        setAt(path, newPath);
        paint(newPath);
        renderLibraryOnly();
        toast('Image ready. Click "Publish changes" to make it live.', 'success', 3000);
      } catch (err) {
        toast('Could not read that image: ' + err.message, 'error');
      } finally {
        box.classList.remove('adm-img-busy');
      }
    }

    input.addEventListener('change', () => { handle(input.files[0]); input.value = ''; });

    const box = h('div', {
      class: 'adm-img-box',
      ondragover: (e) => { e.preventDefault(); box.classList.add('adm-img-drag'); },
      ondragleave: () => box.classList.remove('adm-img-drag'),
      ondrop: (e) => { e.preventDefault(); box.classList.remove('adm-img-drag'); handle(e.dataTransfer.files[0]); },
    },
      h('div', { class: 'adm-img-frame', onclick: () => input.click(), title: 'Click or drop an image to replace' },
        img, empty, h('span', { class: 'adm-img-badge' }, 'New')),
      h('div', { class: 'adm-img-actions' },
        pathText,
        h('div', { class: 'adm-img-btns' },
          h('button', { type: 'button', class: 'adm-btn adm-btn-sm', onclick: () => input.click() }, val ? 'Upload new' : 'Upload image'),
          h('button', {
            type: 'button', class: 'adm-btn adm-btn-sm adm-btn-ghost',
            onclick: () => pickFromLibrary(libraryDir(sectionKey, getAt(path)), (chosen) => {
              pendingDeletes.delete(chosen);
              setAt(path, chosen); paint(chosen); renderLibraryOnly();
            }),
          }, 'Choose existing'),
          sectionKey === 'gallery'
            ? h('button', { type: 'button', class: 'adm-btn adm-btn-sm adm-btn-ghost', onclick: () => { setAt(path, ''); paint(''); renderLibraryOnly(); } }, 'Clear')
            : null)),
      input);

    paint(val);
    return h('div', { class: 'adm-field adm-span-2' }, h('span', { class: 'adm-label' }, humanize(key)), box);
  }

  function slug(s) {
    return String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '')
      .trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 40);
  }

  function processImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, CFG.maxImageSide / Math.max(im.naturalWidth, im.naturalHeight));
        const w = Math.round(im.naturalWidth * scale);
        const hgt = Math.round(im.naturalHeight * scale);
        const c = document.createElement('canvas');
        c.width = w; c.height = hgt;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';             // flatten transparency for JPEG
        ctx.fillRect(0, 0, w, hgt);
        ctx.drawImage(im, 0, 0, w, hgt);
        const dataUrl = c.toDataURL('image/jpeg', CFG.jpegQuality);
        resolve({ dataUrl, base64: dataUrl.split(',')[1] });
      };
      im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unsupported or damaged file')); };
      im.src = url;
    });
  }

  /* ════════════════════════════════════════════════════════════
     DIRTY TRACKING
  ════════════════════════════════════════════════════════════ */
  function isDirty() {
    return !!state && (JSON.stringify(state) !== JSON.stringify(original) || stagedDeletes().length > 0);
  }

  let sidebarTimer = null;
  function onChange() {
    updateSaveBar();
    clearTimeout(sidebarTimer);
    sidebarTimer = setTimeout(renderSidebar, 250);
  }

  function changedSections() {
    return sectionKeys().filter((k) => JSON.stringify(state[k]) !== JSON.stringify(original[k]));
  }

  function referencedImages() {
    const json = JSON.stringify(state);
    return [...pendingImages.keys()].filter((p) => json.includes(JSON.stringify(p)));
  }

  function updateSaveBar() {
    const dirty = isDirty();
    show('adm-savebar', dirty);
    document.body.classList.toggle('adm-has-savebar', dirty);
    if (dirty) {
      const n = changedSections().length;
      const imgs = referencedImages().length;
      const dels = stagedDeletes().length;
      const parts = [];
      if (n) parts.push(`Unsaved changes in ${n} section${n === 1 ? '' : 's'}`);
      if (imgs) parts.push(`${imgs} new image${imgs === 1 ? '' : 's'}`);
      if (dels) parts.push(`${dels} image${dels === 1 ? '' : 's'} to delete`);
      $('adm-savebar-text').textContent = parts.join(' · ');
    }
  }

  function discard() {
    if (!confirm('Discard all unpublished changes?')) return;
    state = clone(original);
    pendingImages.clear();
    pendingDeletes.clear();
    updateSaveBar(); renderSidebar(); renderSection();
    toast('Changes discarded.');
  }

  /* ════════════════════════════════════════════════════════════
     PUBLISH — one commit: content.js + new images
  ════════════════════════════════════════════════════════════ */
  const HEADER = `/**
 * ============================================================
 *  DIGITAL POINT — SITE CONTENT
 *  ────────────────────────────────────────────────────────
 *  All text, numbers, links and image paths for the website.
 *
 *  EASIEST WAY TO EDIT: open /admin.html on the website,
 *  sign in, make your changes and click "Publish changes".
 *
 *  EDITING BY HAND:
 *    • Do NOT remove or rename the property keys (left side)
 *    • Only change the values (right side, inside quotes)
 *    • Keep all commas and quote marks intact
 *    • Push to GitHub — the live site updates in ~2 minutes
 * ============================================================
 */
`;

  function serialize(content) {
    const out = [HEADER, 'const CONTENT = {', ''];
    for (const [k, v] of Object.entries(content)) {
      const label = sectionMeta(k).label;
      out.push(`  /* ── ${label} ${'─'.repeat(Math.max(3, 50 - label.length))} */`);
      const body = JSON.stringify(v, null, 2)
        .replace(/^(\s*)"([A-Za-z_$][\w$]*)":/gm, '$1$2:')   // unquote simple keys for readability
        .replace(/\n/g, '\n  ');
      out.push(`  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${body},`);
      out.push('');
    }
    out.push('};', '');
    return out.join('\n');
  }

  function openPublish() {
    const list = $('adm-changes');
    list.innerHTML = '';
    for (const k of changedSections()) {
      const m = sectionMeta(k);
      list.append(h('li', null, `${m.icon} ${m.label}`));
    }
    const imgs = referencedImages().length;
    if (imgs) list.append(h('li', null, `🖼 ${imgs} new image${imgs === 1 ? '' : 's'}`));
    const dels = stagedDeletes().length;
    if (dels) list.append(h('li', { class: 'adm-change-del' }, `🗑 ${dels} image${dels === 1 ? '' : 's'} deleted`));
    $('adm-commit-msg').value = '';
    $('adm-publish-dialog').showModal();
  }

  async function publish() {
    const btn = $('adm-save');
    btn.disabled = true; btn.textContent = 'Publishing…';
    let step = 'checking for changes made elsewhere';
    try {
      // 1. Make sure nobody else changed content.js since we loaded it
      const latest = await gh(repoPath(`/contents/${CFG.contentPath}?ref=${CFG.branch}`));
      if (latest.sha !== contentSha) {
        const err = new Error('The website content was changed somewhere else since you opened this page. Reload the page to get the latest version, then make your changes again.');
        err.conflict = true;
        throw err;
      }

      // 2. Current branch head
      step = 'reading the latest version';
      const ref = await gh(repoPath(`/git/ref/heads/${CFG.branch}`));
      const headSha = ref.object.sha;
      const head = await gh(repoPath(`/git/commits/${headSha}`));

      // 3. Blobs for new images still in use
      step = 'uploading images';
      const tree = [];
      const imgs = referencedImages();
      let done = 0;
      for (const p of imgs) {
        btn.textContent = `Uploading images ${++done}/${imgs.length}…`;
        const blob = await gh(repoPath('/git/blobs'), {
          method: 'POST', body: { content: pendingImages.get(p).base64, encoding: 'base64' },
        });
        tree.push({ path: p, mode: '100644', type: 'blob', sha: blob.sha });
      }
      btn.textContent = 'Publishing…';

      // 4. content.js + deletions of unused images
      tree.push({ path: CFG.contentPath, mode: '100644', type: 'blob', content: serialize(state) });
      const dels = stagedDeletes();
      for (const p of dels) tree.push({ path: p, mode: '100644', type: 'blob', sha: null });

      // 5. Tree → commit → move branch
      step = 'saving the changes';
      const newTree = await gh(repoPath('/git/trees'), { method: 'POST', body: { base_tree: head.tree.sha, tree } });
      const sections = [...changedSections().map((k) => sectionMeta(k).label),
        ...(dels.length ? [`delete ${dels.length} unused image${dels.length === 1 ? '' : 's'}`] : [])].join(', ');
      const note = $('adm-commit-msg').value.trim();
      const message = `content: ${note || 'update ' + (sections || 'site content')} (via admin panel)`;
      const commit = await gh(repoPath('/git/commits'), {
        method: 'POST', body: { message, tree: newTree.sha, parents: [headSha] },
      });
      step = 'updating the live branch';
      await gh(repoPath(`/git/refs/heads/${CFG.branch}`), { method: 'PATCH', body: { sha: commit.sha } });

      // 6. New baseline
      const entry = (newTree.tree || []).find((t) => t.path === CFG.contentPath);
      contentSha = entry ? entry.sha
        : (await gh(repoPath(`/contents/${CFG.contentPath}?ref=${commit.sha}`))).sha;
      original = clone(state);
      pendingImages.clear();           // keep `previews` so new images still show
      pendingDeletes.clear();
      try { await loadRepoImages(); } catch (_) { /* library refreshes on next load */ }
      updateSaveBar(); renderSidebar(); renderSection();
      toast('Published! The live website will update in about 1–2 minutes.', 'success', 7000);
    } catch (err) {
      const detail = `GitHub said: "${err.message}" (while ${step}).`;
      if (err.status === 401) {
        askNewToken('Your token has expired or was deleted. ' + detail);
      } else if (err.status === 403 || err.status === 404) {
        askNewToken('GitHub refused to save. This token can read the website but is not allowed to change it. ' + detail);
      } else if (err.status === 409 || err.status === 422) {
        toast('The website was updated somewhere else at the same moment. Please try publishing again.', 'error', 9000);
      } else {
        toast(err.conflict ? err.message : 'Publish failed: ' + err.message, 'error', 10000);
      }
    } finally {
      btn.disabled = false; btn.textContent = 'Publish changes';
    }
  }

  /* ── Swap token without losing unsaved edits ─────────────── */
  function askNewToken(reason) {
    $('adm-token-reason').textContent = reason;
    $('adm-token-new').value = '';
    $('adm-token-error').hidden = true;
    let remembered = false;
    try { remembered = !!localStorage.getItem(TOKEN_KEY); } catch (_) { /* ignore */ }
    $('adm-token-remember').checked = remembered;
    $('adm-token-dialog').showModal();
  }

  async function onTokenRetry(e) {
    e.preventDefault();
    const tok = $('adm-token-new').value.trim() || token;
    const btn = $('adm-token-retry');
    const errEl = $('adm-token-error');
    errEl.hidden = true;
    btn.disabled = true; btn.textContent = 'Checking…';
    const previous = token;
    try {
      await verify(tok);
      writeToken(tok, $('adm-token-remember').checked);
      $('adm-token-dialog').close();
      publish();
    } catch (err) {
      token = previous;
      errEl.textContent = friendlyAuthError(err);
      errEl.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Try publishing again';
    }
  }

  /* ════════════════════════════════════════════════════════════
     BOOT
  ════════════════════════════════════════════════════════════ */
  function bind() {
    $('adm-login-form').addEventListener('submit', onLogin);
    $('adm-signout').addEventListener('click', signOut);
    $('adm-discard').addEventListener('click', discard);
    $('adm-save').addEventListener('click', openPublish);
    $('adm-publish-cancel').addEventListener('click', () => $('adm-publish-dialog').close());
    $('adm-publish-form').addEventListener('submit', () => { setTimeout(publish, 0); });
    $('adm-token-form').addEventListener('submit', onTokenRetry);
    $('adm-token-cancel').addEventListener('click', () => $('adm-token-dialog').close());
    window.addEventListener('beforeunload', (e) => {
      if (isDirty()) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  async function boot() {
    bind();
    const saved = readToken();
    if (!saved) { show('adm-loading', false); show('adm-login', true); return; }
    $('adm-loading-text').textContent = 'Signing in…';
    try {
      const user = await verify(saved);
      await enterApp(user);
    } catch (err) {
      if (err.status === 401) clearToken();
      token = null;
      show('adm-loading', false);
      show('adm-login', true);
      const errEl = $('adm-login-error');
      errEl.textContent = friendlyAuthError(err);
      errEl.hidden = false;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
