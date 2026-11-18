/* منصة متابعة الاختبارات الإلكترونية الاحتياطية لطلاب التربية الخاصة — الواجهة */
(function () {
  'use strict';
  const L = window.EPLogic;
  const S = window.EPStore;
  const X = window.EPExports;

  /* ================= helpers ================= */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const root = () => document.getElementById('root');

  const ICONS = {
    brand: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
    logout: '<path d="M15 21h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4"/><polyline points="8 17 3 12 8 7"/><line x1="3" y1="12" x2="15" y2="12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  };
  const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  const badge = (status) => `<span class="badge st-${esc(status)}"><span class="dot"></span>${esc(L.statusLabel(status))}</span>`;
  const options = (list, selected, empty) =>
    (empty != null ? `<option value="">${esc(empty)}</option>` : '') +
    list.map((o) => `<option value="${esc(o.key)}"${o.key === selected ? ' selected' : ''}>${esc(o.label)}</option>`).join('');
  const initials = (name) => esc(String(name || '؟').trim().charAt(0));
  const fmtPct = (n) => (Math.round(n * 10) / 10).toLocaleString('en-US') + '%';

  function toast(msg, kind) {
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => el.remove(), kind === 'bad' ? 6000 : 3200);
  }

  function modal({ title, body, foot, wide, onMount }) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"${wide ? ' style="width:min(760px,100%)"' : ''}>
      <div class="modal-head"><h3>${esc(title)}</h3><button class="btn btn-ghost btn-icon" data-close aria-label="إغلاق">${icon('x')}</button></div>
      <div class="modal-body">${body}</div>
      ${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
    const close = () => { back.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    back.addEventListener('click', (e) => { if (e.target === back || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    const api = { el: back, close };
    if (onMount) onMount(api);
    const first = $('input, select, textarea', back);
    if (first) setTimeout(() => first.focus(), 30);
    return api;
  }

  function confirmDialog(title, message, okLabel, danger) {
    return new Promise((resolve) => {
      let done = false;
      const m = modal({
        title,
        body: `<p style="margin:0">${message}</p>`,
        foot: `<button class="btn ${danger ? 'btn-danger-solid' : 'btn-primary'}" data-ok>${esc(okLabel || 'تأكيد')}</button><button class="btn" data-close>إلغاء</button>`,
        onMount: (api) => {
          $('[data-ok]', api.el).addEventListener('click', () => { done = true; api.close(); resolve(true); });
          const obs = new MutationObserver(() => { if (!document.body.contains(api.el)) { obs.disconnect(); if (!done) resolve(false); } });
          obs.observe(document.body, { childList: true });
        },
      });
      setTimeout(() => $('[data-ok]', m.el).focus(), 40);
    });
  }

  async function withBusy(btn, fn) {
    if (btn) btn.disabled = true;
    try { return await fn(); } finally { if (btn) btn.disabled = false; }
  }

  /* ================= state ================= */
  const state = {
    user: null,
    students: [],
    settings: { schoolName: '', termName: '', teacherPortalEnabled: false },
    route: 'dashboard',
    filters: {
      dashboard: { grade: '', subject: '' },
      students: { q: '', grade: '' },
      submissions: { q: '', grade: '', subject: '', status: '', onlyMissing: false },
      reports: { q: '', grade: '', subject: '', status: '', onlyMissing: false, kind: 'full' },
    },
    charts: [],
    pendingRender: false,
  };
  const isAdmin = () => state.user && state.user.role === 'admin';
  const allRows = () => L.examRows(state.students);

  const ROUTES = [
    { key: 'dashboard', label: 'لوحة الإحصائيات', icon: 'dashboard', admin: true },
    { key: 'students', label: 'الطلاب والمواد', icon: 'users', admin: true },
    { key: 'submissions', label: 'تسليم الروابط', icon: 'link', admin: false },
    { key: 'reports', label: 'التقارير والتصدير', icon: 'report', admin: true },
    { key: 'manage', label: 'إدارة البيانات', icon: 'database', admin: true },
  ];
  const allowedRoutes = () => ROUTES.filter((r) => isAdmin() || !r.admin);

  /* ================= boot / auth ================= */
  async function boot() {
    let sess;
    try {
      sess = await S.session();
    } catch (e) {
      return fatal(e.message);
    }
    if (sess.setupRequired) return renderSetup();
    if (!sess.user) return renderLogin(sess);
    state.user = sess.user;
    await start();
  }

  function fatal(msg) {
    root().innerHTML = `<div class="loading"><div class="card card-pad" style="max-width:460px;text-align:center">${icon('alert')}<p>${esc(msg)}</p><button class="btn btn-primary" id="btn-retry">إعادة المحاولة</button></div></div>`;
    $('#btn-retry').addEventListener('click', () => location.reload());
  }

  function authShell(title, lead, form) {
    root().innerHTML = `<div class="auth-wrap"><div class="card auth-card">
      <div class="brand-mark">${icon('brand')}</div>
      <h1>${esc(title)}</h1><p class="lead">${lead}</p>${form}</div></div>`;
  }

  function renderSetup() {
    authShell('إعداد المنصة لأول مرة', 'أنشئ حساب معلم التربية الخاصة (المسؤول). لا توجد بيانات أو حسابات افتراضية.',
      `<form id="f-setup" autocomplete="off">
        <label class="fld">الاسم الظاهر<input class="input" name="displayName" required maxlength="80" placeholder="مثال: أ. فاطمة"></label>
        <label class="fld">اسم المستخدم (بالإنجليزية)<input class="input ltr" name="username" required autocomplete="username" pattern="[A-Za-z0-9._\\-]{3,40}"></label>
        <label class="fld">كلمة المرور (8 أحرف على الأقل)<input class="input ltr" type="password" name="password" required minlength="8" autocomplete="new-password"></label>
        <label class="fld">تأكيد كلمة المرور<input class="input ltr" type="password" name="password2" required minlength="8" autocomplete="new-password"></label>
        <div class="err" id="f-err"></div>
        <button class="btn btn-primary" type="submit">إنشاء الحساب والدخول</button>
      </form>`);
    $('#f-setup').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      if (fd.password !== fd.password2) { $('#f-err').textContent = 'كلمتا المرور غير متطابقتين.'; return; }
      try {
        await withBusy($('button[type=submit]', e.target), () => S.setup(fd));
        boot();
      } catch (err) { $('#f-err').textContent = err.message; }
    });
  }

  function renderLogin(sess) {
    const tLogin = sess.teacherLogin && sess.teachers && sess.teachers.length;
    authShell('منصة متابعة الاختبارات الإلكترونية الاحتياطية', esc(sess.schoolName || 'لطلاب التربية الخاصة'),
      (tLogin ? `<div class="actions" style="justify-content:center;margin-bottom:16px">
        <button type="button" class="btn btn-primary" data-tab="teacher">${icon('link')} معلم مادة</button>
        <button type="button" class="btn" data-tab="admin">${icon('key')} معلم التربية الخاصة</button></div>
      <form id="f-tlogin">
        <label class="fld">ابحث عن اسمك<input class="input" id="t-q" placeholder="اكتب جزءًا من اسمك…" autocomplete="off"></label>
        <select class="input" id="t-pick" size="7" required aria-label="اسم المعلم" style="min-height:190px"></select>
        <label class="fld">رمز الدخول<input class="input ltr" type="password" name="code" required autocomplete="current-password"></label>
        <div class="err" id="t-err"></div>
        <button class="btn btn-primary" type="submit">دخول</button>
        <p class="muted small" style="margin:0;text-align:center">رمز الدخول يزوّدك به معلم التربية الخاصة.</p>
      </form>` : '') +
      `<form id="f-login"${tLogin ? ' hidden' : ''}>
        <label class="fld">اسم المستخدم<input class="input ltr" name="username" required autocomplete="username"></label>
        <label class="fld">كلمة المرور<input class="input ltr" type="password" name="password" required autocomplete="current-password"></label>
        <div class="err" id="f-err"></div>
        <button class="btn btn-primary" type="submit">تسجيل الدخول</button>
        <p class="muted small" style="margin:0;text-align:center">الدخول مخصص لمعلم التربية الخاصة${sess.teacherPortalEnabled ? ' ومعلمي المواد المصرح لهم' : ''}.</p>
      </form>`);
    $('#f-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await withBusy($('button[type=submit]', e.target), () => S.login(Object.fromEntries(new FormData(e.target))));
        boot();
      } catch (err) { $('#f-err').textContent = err.message; }
    });
    if (!tLogin) return;
    $$('[data-tab]').forEach((b) => b.addEventListener('click', () => {
      const t = b.dataset.tab === 'teacher';
      $('#f-tlogin').hidden = !t;
      $('#f-login').hidden = t;
      $$('[data-tab]').forEach((x) => x.classList.toggle('btn-primary', x === b));
    }));
    const draw = (q) => {
      const n = L.normalizeArabic(q);
      $('#t-pick').innerHTML = sess.teachers.filter((t) => !n || L.normalizeArabic(t.name).includes(n))
        .map((t) => `<option value="${esc(t.id)}">${esc(t.name)}${t.subjectLabel ? ' — ' + esc(t.subjectLabel) : ''}</option>`).join('');
    };
    draw('');
    $('#t-q').addEventListener('input', (e) => draw(e.target.value));
    $('#f-tlogin').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!$('#t-pick').value) { $('#t-err').textContent = 'اختر اسمك من القائمة.'; return; }
      try {
        await withBusy($('button[type=submit]', e.target), () => S.teacherLogin({ teacherId: $('#t-pick').value, code: e.target.code.value }));
        boot();
      } catch (err) { $('#t-err').textContent = err.message; }
    });
  }

  let started = false;
  async function start() {
    root().innerHTML = '<div class="loading">جارٍ تحميل البيانات…</div>';
    try {
      state.students = await S.loadStudents();
      if (isAdmin() || S.mode === 'artifact') state.settings = await S.getSettings();
    } catch (e) {
      return fatal(e.message);
    }
    if (S.mode !== 'artifact' && !isAdmin() && state.user.subjects && state.user.subjects.length === 1) {
      state.filters.submissions.subject = state.user.subjects[0];
    }
    if (S.mode === 'artifact' && state.user.role === 'viewer') {
      return fatal('صلاحيتك على هذه الصفحة "عرض فقط". اطلب من معلم التربية الخاصة منحك صلاحية "مساهم" لتسليم روابط الاختبارات.');
    }
    if (S.mode === 'artifact' && state.user.role === 'teacher') {
      if (!state.settings.teacherPortalEnabled) {
        return fatal('واجهة معلمي المواد غير مفعلة حاليًا. تواصل مع معلم التربية الخاصة.');
      }
      if (!chooseTeacherIfNeeded()) return;
    }
    renderShell();
    if (!started) {
      started = true;
      window.addEventListener('hashchange', route);
      S.watch(onExternalChange);
      document.addEventListener('focusout', () => setTimeout(() => { if (state.pendingRender && !editing()) { state.pendingRender = false; renderView(); } }, 50));
    }
    route();
  }

  /* ---- teacher identity (page-database version): the teacher picks their name once on this device ---- */
  function savedTeacher() {
    let id = null;
    try { id = localStorage.getItem('ep_teacher'); } catch (e) { /* storage unavailable */ }
    return (S.listTeachers ? S.listTeachers() : []).find((t) => t.id === id) || null;
  }
  function applyTeacher(t) {
    state.user.displayName = t.name;
    state.user.teacherId = t.id;
    if (t.subjects && t.subjects.length === 1) state.filters.submissions.subject = t.subjects[0];
  }
  function chooseTeacherIfNeeded(force) {
    const cur = savedTeacher();
    if (cur && !force) { applyTeacher(cur); return true; }
    const list = S.listTeachers();
    root().innerHTML = `<div class="auth-wrap"><div class="card auth-card" style="width:min(520px,100%)">
      <div class="brand-mark">${icon('brand')}</div>
      <h1>واجهة معلمي المواد</h1><p class="lead">اختر اسمك لتسليم روابط الاختبارات الإلكترونية الاحتياطية.</p>
      <form id="f-teacher">
        <div class="search" style="position:relative"><input class="input" id="t-q" placeholder="ابحث عن اسمك…" aria-label="البحث عن المعلم"></div>
        <select class="input" id="t-pick" size="8" required aria-label="اسم المعلم" style="min-height:220px"></select>
        <div class="err" id="f-err"></div>
        <button class="btn btn-primary" type="submit">${icon('check')} متابعة</button>
      </form></div></div>`;
    const draw = (q) => {
      const n = L.normalizeArabic(q);
      $('#t-pick').innerHTML = list.filter((t) => !n || L.normalizeArabic(t.name).includes(n))
        .map((t) => `<option value="${esc(t.id)}"${cur && cur.id === t.id ? ' selected' : ''}>${esc(t.name)}${t.subjectLabel ? ' — ' + esc(t.subjectLabel) : ''}</option>`).join('');
    };
    draw('');
    if (!list.length) $('#f-err').textContent = 'لم يضف معلم التربية الخاصة أسماء معلمي المواد بعد.';
    $('#t-q').addEventListener('input', (e) => draw(e.target.value));
    $('#f-teacher').addEventListener('submit', (e) => {
      e.preventDefault();
      const t = list.find((x) => x.id === $('#t-pick').value);
      if (!t) { $('#f-err').textContent = 'اختر اسمك من القائمة.'; return; }
      try { localStorage.setItem('ep_teacher', t.id); } catch (err) { /* remembered for this visit only */ }
      applyTeacher(t);
      renderShell();
      route();
    });
    return false;
  }

  const canon = (v) => JSON.stringify(v, (k, val) => (val && typeof val === 'object' && !Array.isArray(val)
    ? Object.keys(val).sort().reduce((o, key) => { o[key] = val[key]; return o; }, {}) : val));

  const editing = () => {
    const a = document.activeElement;
    return a && $('#view') && $('#view').contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  };

  async function onExternalChange(list) {
    try {
      const next = list || await S.loadStudents();
      // Our own writes come back through the live feed too: skip re-rendering when nothing changed.
      if (canon(next) === canon(state.students)) {
        if (S.mode !== 'artifact') return;
        const s = await S.getSettings();
        if (canon(s) === canon(state.settings)) return;
      }
      state.students = next;
      if (isAdmin() && S.mode === 'artifact') state.settings = await S.getSettings();
    } catch (e) { return; }
    updateNavCounts();
    if (editing() || $('.modal-back')) state.pendingRender = true;
    else renderView();
  }

  window.EPApp = {
    onUnauthorized() { if (state.user) { state.user = null; toast('انتهت الجلسة. يرجى تسجيل الدخول مجددًا.', 'bad'); boot(); } },
  };

  /* ================= shell & routing ================= */
  function renderShell() {
    const roleLabel = isAdmin() ? 'معلم التربية الخاصة' : 'معلم مادة';
    if (!isAdmin() && S.mode === 'artifact') ROUTES.forEach((r) => { if (r.key === 'submissions') r.label = 'تسليم الروابط'; });
    const sub = [state.settings.schoolName, state.settings.termName].filter(Boolean).join(' — ') || 'لطلاب التربية الخاصة';
    root().innerHTML = `<div class="app">
      <header class="topbar">
        <div class="brand"><div class="brand-mark">${icon('brand')}</div>
          <div><h1>منصة متابعة الاختبارات الإلكترونية الاحتياطية</h1><div class="sub">${esc(sub)}</div></div></div>
        <div class="spacer"></div>
        <div class="userbox"><span class="uname">${esc(state.user.displayName)}</span><span class="role">${roleLabel}</span>
          ${S.features.auth ? `<button class="btn btn-ghost btn-sm" id="btn-logout">${icon('logout')}<span class="uname">خروج</span></button>` : ''}
          ${S.mode === 'artifact' && state.user.role === 'teacher' ? `<button class="btn btn-ghost btn-sm" id="btn-switch">${icon('users')}<span class="uname">تغيير الاسم</span></button>` : ''}</div>
      </header>
      <nav class="sidebar"><div class="nav" id="nav">${allowedRoutes().map((r) =>
        `<a href="#${r.key}" data-route="${r.key}">${icon(r.icon)}<span>${esc(r.label)}</span>${r.key === 'submissions' ? '<span class="count" id="nav-missing" hidden></span>' : ''}</a>`).join('')}</div></nav>
      <div class="main">${S.mode === 'artifact' ? `<div class="demo-banner">${icon('alert')} ${isAdmin() ? 'البيانات محفوظة بشكل دائم في قاعدة بيانات هذه الصفحة. معلم التربية الخاصة: المالك أو "محرر" — معلمو المواد: صلاحية "مساهم" (تسليم الروابط فقط).' : 'يمكنك إضافة رابط الاختبار والمنصة لكل مادة. يُحفظ الرابط تلقائيًا ويُسجَّل تاريخ التسليم، ويتولى معلم التربية الخاصة المراجعة والاعتماد.'}</div>` : ''}<main id="view"></main></div>
    </div>`;
    const sw = $('#btn-switch');
    if (sw) sw.addEventListener('click', () => chooseTeacherIfNeeded(true));
    const lo = $('#btn-logout');
    if (lo) lo.addEventListener('click', async () => { try { await S.logout(); } catch (e) { /* ignore */ } state.user = null; boot(); });
    updateNavCounts();
  }

  function updateNavCounts() {
    const el = $('#nav-missing');
    if (!el) return;
    const n = allRows().filter((r) => r.exam.status === 'not_submitted').length;
    el.textContent = n;
    el.hidden = n === 0;
  }

  function route() {
    let r = (location.hash || '').replace(/^#/, '');
    const allowed = allowedRoutes().map((x) => x.key);
    if (!allowed.includes(r)) r = allowed[0];
    state.route = r;
    $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === r));
    renderView();
    window.scrollTo(0, 0);
  }

  function renderView() {
    state.charts.forEach((c) => c.destroy());
    state.charts = [];
    const v = $('#view');
    if (!v) return;
    ({ dashboard: renderDashboard, students: renderStudents, submissions: renderSubmissions, reports: renderReports, manage: renderManage })[state.route](v);
  }

  function pageHead(title, desc, actions) {
    return `<div class="page-head"><div><h2>${esc(title)}</h2>${desc ? `<p>${desc}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
  }

  function emptyState(title, text, action) {
    return `<div class="card empty">${icon('inbox')}<h4>${esc(title)}</h4><p>${text}</p>${action || ''}</div>`;
  }

  // Bind a filter bar: inputs carry data-f="<key>"; onChange re-renders the dependent part.
  function bindFilters(container, filters, onChange) {
    $$('[data-f]', container).forEach((el) => {
      const k = el.dataset.f;
      const ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        filters[k] = el.type === 'checkbox' ? el.checked : el.value;
        onChange();
      });
    });
  }

  function filterBar(f, opts) {
    opts = opts || {};
    return `<div class="card filters">
      ${'q' in f ? `<div class="search">${icon('search')}<input class="input" data-f="q" value="${esc(f.q)}" placeholder="ابحث باسم الطالب…" aria-label="البحث باسم الطالب"></div>` : ''}
      ${'grade' in f ? `<select class="input" data-f="grade" aria-label="الصف">${options(L.GRADES, f.grade, 'كل الصفوف')}</select>` : ''}
      ${'subject' in f ? `<select class="input" data-f="subject" aria-label="المادة">${options(L.SUBJECTS, f.subject, 'كل المواد')}</select>` : ''}
      ${'status' in f ? `<select class="input" data-f="status" aria-label="حالة الاختبار">${options(L.STATUSES, f.status, 'كل الحالات')}</select>` : ''}
      ${'onlyMissing' in f ? `<label class="switch"><input type="checkbox" data-f="onlyMissing"${f.onlyMissing ? ' checked' : ''}> غير المسلمة فقط</label>` : ''}
      ${opts.extra || ''}
    </div>`;
  }

  /* ================= dashboard ================= */
  const STATUS_COLORS = {
    not_submitted: '#d03b3b', received: '#2a78d6', under_review: '#fab219', needs_revision: '#ec835a', approved: '#0ca30c',
  };

  function renderDashboard(v) {
    const f = state.filters.dashboard;
    v.innerHTML = pageHead('لوحة الإحصائيات', 'متابعة مباشرة لروابط الاختبارات الاحتياطية — تتحدث تلقائيًا عند أي تعديل.',
      `<a class="btn btn-primary" href="#submissions">${icon('link')} تسليم الروابط</a>`) +
      filterBar(f) + '<div id="dash-body"></div>';
    bindFilters(v, f, () => drawDashboard($('#dash-body')));
    drawDashboard($('#dash-body'));
  }

  function drawDashboard(box) {
    state.charts.forEach((c) => c.destroy());
    state.charts = [];
    if (!state.students.length) {
      box.innerHTML = emptyState('لا توجد بيانات بعد', 'ابدأ بإضافة الطلاب وتحديد المواد المطلوبة لكل طالب، وستظهر الإحصائيات هنا تلقائيًا.',
        `<a class="btn btn-primary" href="#students">${icon('plus')} إضافة طالب</a>`);
      return;
    }
    if (!allRows().length) {
      box.innerHTML = emptyState('لم تُحدد المواد المطلوبة بعد', `تمت إضافة ${state.students.length} طالب. حدد المواد المطلوبة لكل طالب لتبدأ متابعة الاختبارات والإحصائيات.`,
        `<a class="btn btn-primary" href="#students">${icon('edit')} تحديد المواد</a>`);
      return;
    }
    const rows = L.filterRows(allRows(), state.filters.dashboard);
    const st = L.computeStats(rows);
    const t = st.totals;
    const kpi = (label, value, color, foot) =>
      `<div class="card kpi" style="--kpi-c:${color}"><div class="k-label">${label}</div><div class="k-value">${value}</div>${foot ? `<div class="k-foot">${foot}</div>` : ''}</div>`;
    const share = (n) => (t.total ? fmtPct(L.pct(n, t.total)) + ' من المطلوب' : '');
    box.innerHTML = `
      <div class="kpis">
        <div class="card kpi hero"><div class="k-label">نسبة الإنجاز الإجمالية (الروابط المسلمة)</div>
          <div class="k-value">${fmtPct(t.deliveryRate)}</div>
          <div class="progress"><span style="width:${t.deliveryRate}%"></span></div>
          <div class="k-foot">${t.delivered} من ${t.total} اختبارًا — نسبة الاعتماد ${fmtPct(t.approvalRate)}</div></div>
        ${kpi('إجمالي الاختبارات المطلوبة', t.total, 'var(--primary)', st.byStudent.length + ' طالب')}
        ${kpi('الاختبارات المسلمة', t.delivered, STATUS_COLORS.received, share(t.delivered))}
        ${kpi('غير المسلمة', t.not_submitted, STATUS_COLORS.not_submitted, share(t.not_submitted))}
        ${kpi('قيد المراجعة', t.under_review, STATUS_COLORS.under_review, t.received ? t.received + ' بانتظار بدء المراجعة' : '')}
        ${kpi('تحتاج إلى تعديل', t.needs_revision, STATUS_COLORS.needs_revision, '')}
        ${kpi('معتمدة وجاهزة', t.approved, STATUS_COLORS.approved, share(t.approved))}
      </div>
      <div class="grid grid-2">
        <div class="card card-pad"><h3>توزيع الاختبارات حسب الحالة</h3><p class="card-sub">عدد الاختبارات في كل مرحلة</p>
          <div class="chart-box" style="height:230px"><canvas id="ch-status" role="img" aria-label="توزيع الاختبارات حسب الحالة"></canvas></div>
          ${dataTable(['الحالة', 'العدد'], st.byStatus.map((s) => [s.label, s.count]))}</div>
        <div class="card card-pad"><h3>الإنجاز حسب الصف</h3><p class="card-sub">حالات الاختبارات لكل صف</p>
          ${legendHtml()}<div class="chart-box" style="height:${chartHeight(st.byGrade.length)}px"><canvas id="ch-grade" role="img" aria-label="الإنجاز حسب الصف"></canvas></div>
          ${groupDataTable('الصف', st.byGrade)}</div>
      </div>
      <div class="card card-pad section-gap"><h3>الإنجاز حسب المادة</h3><p class="card-sub">حالات الاختبارات لكل مادة</p>
        ${legendHtml()}<div class="chart-box" style="height:${chartHeight(st.bySubject.length)}px"><canvas id="ch-subject" role="img" aria-label="الإنجاز حسب المادة"></canvas></div>
        ${groupDataTable('المادة', st.bySubject)}</div>
      <div class="card section-gap"><div class="card-pad" style="padding-bottom:6px"><h3>الإنجاز حسب الطالب</h3><p class="card-sub">مرتبة أبجديًا — اضغط على اسم الطالب لعرض روابطه</p></div>
        <div class="table-wrap"><table class="tbl responsive"><thead><tr><th>الطالب</th><th>الصف والشعبة</th><th class="num">المطلوبة</th><th class="num">المسلمة</th><th class="num">غير المسلمة</th><th class="num">تحتاج تعديل</th><th class="num">المعتمدة</th><th>نسبة الإنجاز</th></tr></thead><tbody>
        ${st.byStudent.map((g) => `<tr>
          <td data-label="الطالب"><a href="#submissions" data-student-q="${esc(g.student.name)}">${esc(g.student.name)}</a></td>
          <td data-label="الصف والشعبة" class="nowrap">${esc(L.classLabel(g.student))}</td>
          <td data-label="المطلوبة" class="num">${g.total}</td><td data-label="المسلمة" class="num">${g.delivered}</td>
          <td data-label="غير المسلمة" class="num">${g.not_submitted ? `<b style="color:#a82a2a">${g.not_submitted}</b>` : 0}</td>
          <td data-label="تحتاج تعديل" class="num">${g.needs_revision}</td><td data-label="المعتمدة" class="num">${g.approved}</td>
          <td data-label="نسبة الإنجاز">${stackBar(g)}</td></tr>`).join('')}
        </tbody></table></div></div>`;
    $$('[data-student-q]', box).forEach((a) => a.addEventListener('click', () => {
      Object.assign(state.filters.submissions, { q: a.dataset.studentQ, grade: '', subject: '', status: '', onlyMissing: false });
    }));
    drawCharts(st);
  }

  const chartHeight = (n) => Math.max(140, n * 38 + 50);
  const legendHtml = () => `<div class="legend">${L.STATUSES.map((s) => `<span><i style="background:${STATUS_COLORS[s.key]}"></i>${esc(s.label)}</span>`).join('')}</div>`;
  function stackBar(g) {
    const seg = L.STATUSES.filter((s) => g[s.key]).map((s) =>
      `<span style="width:${(g[s.key] / g.total) * 100}%;background:${STATUS_COLORS[s.key]}" title="${esc(s.label)}: ${g[s.key]}"></span>`).join('');
    return `<div class="mini-progress"><div class="progress stack">${seg}</div><span class="small nowrap">${fmtPct(g.deliveryRate)}</span></div>`;
  }
  function dataTable(head, rows) {
    return `<details class="data-table"><summary>عرض البيانات كجدول</summary><div class="table-wrap"><table class="tbl"><thead><tr>${head.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${
      rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  }
  const groupDataTable = (title, list) => dataTable([title, ...L.STATUSES.map((s) => s.label), 'نسبة الإنجاز'],
    list.map((g) => [g.label, ...L.STATUSES.map((s) => g[s.key]), fmtPct(g.deliveryRate)]));

  function drawCharts(st) {
    if (!window.Chart) return;
    const C = window.Chart;
    C.defaults.font.family = getComputedStyle(document.body).fontFamily;
    C.defaults.font.size = 13;
    C.defaults.color = '#4f5b6a';
    const base = {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y', locale: 'en-US',
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: { rtl: true, textDirection: 'rtl', backgroundColor: '#1b2430', padding: 10, boxPadding: 4 },
      },
      scales: {
        x: { reverse: true, beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef0f3' }, border: { display: false } },
        y: { position: 'right', grid: { display: false }, border: { display: false } },
      },
    };
    const bar = { borderRadius: 4, borderSkipped: false, maxBarThickness: 26, borderWidth: 0 };
    const mk = (id, cfg) => { const el = document.getElementById(id); if (el) state.charts.push(new C(el, cfg)); };

    mk('ch-status', {
      type: 'bar',
      data: {
        labels: st.byStatus.map((s) => s.label),
        datasets: [Object.assign({ label: 'العدد', data: st.byStatus.map((s) => s.count), backgroundColor: st.byStatus.map((s) => STATUS_COLORS[s.key]) }, bar)],
      },
      options: base,
    });
    const stacked = (groups) => ({
      type: 'bar',
      data: {
        labels: groups.map((g) => g.label),
        datasets: L.STATUSES.map((s) => Object.assign({}, bar, {
          label: s.label, data: groups.map((g) => g[s.key]), backgroundColor: STATUS_COLORS[s.key],
          borderColor: '#ffffff', borderWidth: { left: 1, right: 1 }, borderRadius: 0,
        })),
      },
      options: Object.assign({}, base, {
        scales: { x: Object.assign({}, base.scales.x, { stacked: true }), y: Object.assign({}, base.scales.y, { stacked: true }) },
        plugins: Object.assign({}, base.plugins, {
          tooltip: Object.assign({}, base.plugins.tooltip, {
            mode: 'index', filter: (it) => it.raw > 0,
            callbacks: { footer: (items) => { const g = groups[items[0].dataIndex]; return 'نسبة الإنجاز: ' + fmtPct(g.deliveryRate); } },
          }),
        }),
      }),
    });
    mk('ch-grade', stacked(st.byGrade));
    mk('ch-subject', stacked(st.bySubject));
  }

  /* ================= students ================= */
  function renderStudents(v) {
    const f = state.filters.students;
    v.innerHTML = pageHead('الطلاب والمواد المطلوبة', 'أضف الطلاب وحدد المواد المطلوب لها اختبار إلكتروني احتياطي لكل طالب.',
      `<button class="btn" id="btn-bulk">${icon('users')} إضافة مجموعة طلاب</button>
       <button class="btn btn-primary" id="btn-add">${icon('plus')} إضافة طالب</button>`) +
      filterBar(f) + '<div id="stu-body"></div>';
    $('#btn-add').addEventListener('click', () => studentModal());
    $('#btn-bulk').addEventListener('click', () => bulkModal());
    bindFilters(v, f, () => drawStudents($('#stu-body')));
    drawStudents($('#stu-body'));
  }

  function drawStudents(box) {
    if (!state.students.length) {
      box.innerHTML = emptyState('لم تتم إضافة أي طالب بعد', 'اضغط "إضافة طالب" لتسجيل أول طالب وتحديد مواده.', '');
      return;
    }
    const f = state.filters.students;
    const q = L.normalizeArabic(f.q);
    const list = state.students.filter((s) => (!f.grade || s.grade === f.grade) && (!q || L.normalizeArabic(s.name).includes(q)));
    const noSubj = state.students.filter((s) => !s.exams.length).length;
    box.innerHTML = `<div class="result-count">${list.length} طالب${noSubj ? ` — <b style="color:#a24a22">${noSubj} طالب لم تُحدد مواده بعد</b> (اضغط "تعديل" لتحديد المواد)` : ''}</div>` + (list.length ? `<div class="card table-wrap"><table class="tbl responsive"><thead><tr>
      <th>اسم الطالب</th><th>الصف والشعبة</th><th>المواد المطلوبة</th><th>حالة التسليم</th><th></th></tr></thead><tbody>
      ${list.map((s) => {
        const c = L.computeStats(L.examRows([s])).totals;
        return `<tr><td data-label="الطالب"><b>${esc(s.name)}</b></td>
          <td data-label="الصف والشعبة" class="nowrap">${esc(L.classLabel(s))}</td>
          <td data-label="المواد">${s.exams.length ? s.exams.map((e) => `<span class="chip">${esc(L.subjectLabel(e.subject))}</span>`).join('')
            : `<span class="badge st-needs_revision"><span class="dot"></span>لم تُحدد المواد بعد</span>`}</td>
          <td data-label="التسليم">${s.exams.length ? `<div class="mini-progress"><div class="progress"><span style="width:${c.deliveryRate}%"></span></div><span class="small nowrap">${c.delivered}/${c.total}</span></div>` : '<span class="muted">—</span>'}</td>
          <td class="nowrap"><button class="btn btn-sm" data-edit="${esc(s.id)}">${icon('edit')} تعديل</button>
            <button class="btn btn-sm btn-danger" data-del="${esc(s.id)}" aria-label="حذف">${icon('trash')}</button></td></tr>`;
      }).join('')}</tbody></table></div>` : emptyState('لا توجد نتائج', 'لا يوجد طلاب مطابقون للبحث.', ''));
    $$('[data-edit]', box).forEach((b) => b.addEventListener('click', () => studentModal(state.students.find((s) => s.id === b.dataset.edit))));
    $$('[data-del]', box).forEach((b) => b.addEventListener('click', () => deleteStudent(state.students.find((s) => s.id === b.dataset.del))));
  }

  function studentModal(student) {
    const editing = !!student;
    let subjects = editing ? student.exams.map((e) => e.subject) : [];
    const m = modal({
      title: editing ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد',
      body: `<form id="f-stu" class="form-grid" autocomplete="off">
        <label class="fld full">اسم الطالب<input class="input" name="name" required maxlength="120" value="${esc(editing ? student.name : '')}"></label>
        <label class="fld">الصف<select class="input" name="grade" required>${options(L.GRADES, editing ? student.grade : '', 'اختر الصف')}</select></label>
        <label class="fld">الشعبة<input class="input" name="section" required maxlength="20" value="${esc(editing ? student.section : '')}" placeholder="مثال: 1 أو أ"></label>
        <div class="fld full"><span>المواد المطلوبة</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><select class="input" id="subj-pick" style="flex:1;min-width:180px" aria-label="اختر مادة"></select>
          <button type="button" class="btn" id="subj-add">${icon('plus')} إضافة المادة</button>
          <button type="button" class="btn btn-ghost" id="subj-all">إضافة كل المواد</button></div>
          <div id="subj-list" style="margin-top:8px"></div></div>
        <div class="err full" id="f-err"></div></form>`,
      foot: `<button class="btn btn-primary" id="f-save">${icon('check')} حفظ</button><button class="btn" data-close>إلغاء</button>`,
    });
    const el = m.el;
    const draw = () => {
      $('#subj-pick', el).innerHTML = options(L.SUBJECTS.filter((s) => !subjects.includes(s.key)), '', 'اختر مادة من القائمة…');
      $('#subj-list', el).innerHTML = subjects.length
        ? subjects.map((s) => {
          const ex = editing && student.exams.find((e) => e.subject === s);
          return `<span class="chip">${esc(L.subjectLabel(s))}${ex && ex.link ? ' 🔗' : ''}<button type="button" data-rm="${s}" aria-label="حذف المادة">×</button></span>`;
        }).join('')
        : '<span class="muted small">لم يتم تحديد مواد بعد.</span>';
      $$('[data-rm]', el).forEach((b) => b.addEventListener('click', () => { subjects = subjects.filter((x) => x !== b.dataset.rm); draw(); }));
    };
    draw();
    $('#subj-pick', el).addEventListener('change', (e) => { if (e.target.value) { subjects.push(e.target.value); draw(); } });
    $('#subj-add', el).addEventListener('click', () => { const v = $('#subj-pick', el).value; if (v) { subjects.push(v); draw(); } else $('#subj-pick', el).focus(); });
    $('#subj-all', el).addEventListener('click', () => { subjects = L.SUBJECTS.map((s) => s.key).filter((k) => subjects.includes(k)).concat(L.SUBJECTS.map((s) => s.key).filter((k) => !subjects.includes(k))); draw(); });
    const save = async () => {
      const fd = Object.fromEntries(new FormData($('#f-stu', el)));
      const input = { name: fd.name, grade: fd.grade, section: fd.section, subjects };
      try {
        L.validateStudentInput(input);
      } catch (e) { $('#f-err', el).textContent = e.message; return; }
      if (editing) {
        const lost = student.exams.filter((e) => !subjects.includes(e.subject) && e.link);
        if (lost.length && !(await confirmDialog('حذف مواد لها روابط',
          `المواد التالية لها روابط مسلمة وسيتم حذفها مع روابطها: <b>${lost.map((e) => esc(L.subjectLabel(e.subject))).join('، ')}</b>. هل تريد المتابعة؟`, 'نعم، احذف', true))) return;
      }
      try {
        await withBusy($('#f-save', el), async () => {
          const saved = editing ? await S.updateStudent(student.id, input) : await S.createStudent(input);
          upsertStudent(saved);
        });
        m.close();
        toast(editing ? 'تم تحديث بيانات الطالب.' : 'تمت إضافة الطالب.', 'ok');
        renderView();
      } catch (e) { $('#f-err', el).textContent = e.message; }
    };
    $('#f-save', el).addEventListener('click', save);
    $('#f-stu', el).addEventListener('submit', (e) => { e.preventDefault(); save(); });
  }

  function bulkModal() {
    let subjects = [];
    const m = modal({
      title: 'إضافة مجموعة طلاب',
      wide: true,
      body: `<p class="muted small" style="margin-top:0">الصق أسماء الطلاب، كل طالب في سطر، متبوعًا بالصف/الشعبة. مثال:<br><span style="color:var(--text)">سعيد جمعة سعيد النعيمي 5/2</span></p>
        <textarea class="input" id="bulk-text" rows="9" placeholder="اسم الطالب 5/2"></textarea>
        <div class="fld" style="margin-top:12px"><span>المواد المطلوبة لجميع الطلاب في القائمة (اختياري — يمكن تحديدها لاحقًا لكل طالب)</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><select class="input" id="bulk-pick" style="flex:1;min-width:180px" aria-label="اختر مادة"></select>
          <button type="button" class="btn btn-ghost" id="bulk-all">كل المواد</button></div>
          <div id="bulk-subj" style="margin-top:6px"></div></div>
        <div id="bulk-preview" class="small" style="margin-top:12px"></div><div class="err" id="bulk-err"></div>`,
      foot: `<button class="btn btn-primary" id="bulk-save" disabled>${icon('check')} إضافة الطلاب</button><button class="btn" data-close>إلغاء</button>`,
    });
    const el = m.el;
    let parsed = { ok: [], errors: [] };
    let fresh = [];
    const drawSubj = () => {
      $('#bulk-pick', el).innerHTML = options(L.SUBJECTS.filter((s) => !subjects.includes(s.key)), '', 'إضافة مادة…');
      $('#bulk-subj', el).innerHTML = subjects.length ? subjects.map((s) => `<span class="chip">${esc(L.subjectLabel(s))}<button type="button" data-rm="${s}">×</button></span>`).join('') : '<span class="muted small">بدون مواد حاليًا.</span>';
      $$('[data-rm]', el).forEach((b) => b.addEventListener('click', () => { subjects = subjects.filter((x) => x !== b.dataset.rm); drawSubj(); }));
    };
    const preview = () => {
      parsed = L.parseStudentLines($('#bulk-text', el).value);
      fresh = parsed.ok.filter((p, i) => !state.students.some((s) => L.sameStudent(s, p)) && !parsed.ok.slice(0, i).some((q) => L.sameStudent(q, p)));
      const dup = parsed.ok.length - fresh.length;
      $('#bulk-preview', el).innerHTML = (fresh.length ? `<div class="table-wrap" style="max-height:220px;overflow:auto"><table class="tbl"><thead><tr><th>#</th><th>اسم الطالب</th><th>الصف والشعبة</th></tr></thead><tbody>${
        fresh.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td>${esc(L.classLabel(p))}</td></tr>`).join('')}</tbody></table></div>` : '') +
        `<p style="margin:6px 0 0"><b>${fresh.length}</b> طالب جاهز للإضافة${dup ? ` — ${dup} موجود مسبقًا (سيتم تجاهله)` : ''}</p>` +
        parsed.errors.map((e) => `<div class="err">السطر ${e.line}: «${esc(e.text)}» — ${esc(e.reason)}</div>`).join('');
      $('#bulk-save', el).disabled = !fresh.length;
    };
    drawSubj();
    $('#bulk-text', el).addEventListener('input', preview);
    $('#bulk-pick', el).addEventListener('change', (e) => { if (e.target.value) { subjects.push(e.target.value); drawSubj(); } });
    $('#bulk-all', el).addEventListener('click', () => { subjects = L.SUBJECTS.map((s) => s.key); drawSubj(); });
    $('#bulk-save', el).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      let done = 0;
      try {
        for (const p of fresh) {
          btn.textContent = `جارٍ الإضافة… ${done + 1}/${fresh.length}`;
          upsertStudent(await S.createStudent(Object.assign({}, p, { subjects })));
          done++;
        }
        m.close();
        toast(`تمت إضافة ${done} طالب.`, 'ok');
        renderView();
      } catch (err) {
        $('#bulk-err', el).textContent = `تمت إضافة ${done} طالب ثم حدث خطأ: ${err.message}`;
        btn.disabled = false;
        btn.textContent = 'إعادة المحاولة';
        preview();
      }
    });
  }

  function upsertStudent(s) {
    const i = state.students.findIndex((x) => x.id === s.id);
    if (i >= 0) state.students[i] = s; else state.students.push(s);
    state.students = L.sortStudents(state.students);
    updateNavCounts();
  }

  async function deleteStudent(s) {
    if (!s) return;
    const links = s.exams.filter((e) => e.link).length;
    const ok = await confirmDialog('حذف الطالب', `سيتم حذف الطالب <b>${esc(s.name)}</b> وجميع اختباراته (${s.exams.length})${links ? ` بما فيها ${links} رابط مسلم` : ''}. لا يمكن التراجع عن هذه العملية إلا من النسخة الاحتياطية.`, 'حذف نهائي', true);
    if (!ok) return;
    try {
      await S.deleteStudent(s.id);
      state.students = state.students.filter((x) => x.id !== s.id);
      updateNavCounts();
      toast('تم حذف الطالب.', 'ok');
      renderView();
    } catch (e) { toast(e.message, 'bad'); }
  }

  /* ================= submissions ================= */
  function renderSubmissions(v) {
    const f = state.filters.submissions;
    v.innerHTML = pageHead('تسليم روابط الاختبارات',
      'أدخل رابط الاختبار والمنصة الموجود عليها أمام كل مادة — يُحفظ الرابط تلقائيًا ويُسجَّل تاريخ ووقت التسليم.') +
      filterBar(f) + '<div id="sub-body"></div>';
    bindFilters(v, f, () => drawSubmissions($('#sub-body')));
    drawSubmissions($('#sub-body'));
  }

  function drawSubmissions(box) {
    if (!state.students.length) {
      box.innerHTML = emptyState('لا يوجد طلاب', isAdmin() ? 'أضف الطلاب وموادهم أولًا من صفحة "الطلاب والمواد".' : 'لم يقم معلم التربية الخاصة بإضافة طلاب بعد.',
        isAdmin() ? `<a class="btn btn-primary" href="#students">${icon('plus')} إضافة طالب</a>` : '');
      return;
    }
    const rows = L.filterRows(allRows(), state.filters.submissions);
    const groups = [];
    const idx = {};
    for (const r of rows) {
      if (!(r.student.id in idx)) { idx[r.student.id] = groups.length; groups.push({ student: r.student, subjects: [] }); }
      groups[idx[r.student.id]].subjects.push(r.exam.subject);
    }
    const noSubj = state.students.filter((s) => !s.exams.length);
    box.innerHTML = (noSubj.length ? `<div class="card card-pad" style="margin-bottom:14px;border-color:#f6cfbb;background:#fdf6f2">${icon('alert')} ${noSubj.length} طالب لم تُحدد مواده المطلوبة بعد، لذلك لا يظهر هنا: ${noSubj.slice(0, 6).map((s) => esc(s.name)).join('، ')}${noSubj.length > 6 ? '…' : ''}${isAdmin() ? ' — <a href="#students">تحديد المواد</a>' : ''}</div>` : '') +
      `<div class="result-count">${resultCountText(rows, groups.length)}</div>` +
      (groups.length ? groups.map((g) => studentCard(g.student, g.subjects)).join('')
        : emptyState('لا توجد نتائج', state.filters.submissions.onlyMissing ? 'رائع! لا توجد اختبارات غير مسلمة ضمن هذا التصفية.' : 'لا توجد اختبارات مطابقة للتصفية.', ''));
    bindSubmissionEvents(box);
  }

  function resultCountText(rows, nStudents) {
    const missing = rows.filter((r) => r.exam.status === 'not_submitted').length;
    return `${rows.length} اختبار لـ ${nStudents} طالب — منها ${missing} غير مسلم`;
  }

  function studentCard(s, subjects) {
    const c = L.computeStats(L.examRows([s])).totals;
    return `<section class="card stu-card" data-sid="${esc(s.id)}" data-subjects="${esc(subjects.join(','))}">
      <div class="stu-head"><div class="avatar">${initials(s.name)}</div>
        <div><div class="name">${esc(s.name)}</div><div class="meta">${esc(L.classLabel(s))} — ${s.exams.length} مادة مطلوبة</div></div>
        <div class="prog"><span class="nowrap">${c.delivered} من ${c.total} مسلمة</span>${stackBar(c)}</div></div>
      ${subjects.map((subj) => examRow(s, s.exams.find((e) => e.subject === subj))).filter(Boolean).join('')}
    </section>`;
  }

  function examRow(s, e, saveMsg) {
    if (!e) return '';
    const admin = isAdmin();
    const showReview = admin && e.link;
    return `<div class="exam-row" data-subj="${esc(e.subject)}">
      <div class="exam-subject"><span class="s-name">${esc(L.subjectLabel(e.subject))}</span>${badge(e.status)}</div>
      <div class="exam-fields">
        <select class="input platform-select" aria-label="المنصة">${options(L.PLATFORMS, e.platform, 'المنصة…')}</select>
        <input class="input link-input" type="url" inputmode="url" value="${esc(e.link)}" placeholder="https://… الصق رابط الاختبار هنا" aria-label="رابط اختبار ${esc(L.subjectLabel(e.subject))}">
        <div class="act" style="display:flex;gap:6px">
          <button class="btn btn-primary btn-save" type="button">${icon('check')} حفظ</button>
          ${e.link ? `<a class="btn btn-open" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">${icon('external')} فتح الاختبار</a>
            <button class="btn btn-danger btn-icon btn-clear" type="button" title="حذف الرابط" aria-label="حذف الرابط">${icon('trash')}</button>` : ''}
        </div>
        <input class="input other-name" ${e.platform === 'other' ? '' : 'hidden'} value="${esc(e.platformName)}" placeholder="اكتب اسم المنصة" aria-label="اسم المنصة" maxlength="80">
      </div>
      <div class="exam-meta">
        ${e.submittedAt ? `<span>${icon('clock')} تاريخ التسليم: <b>${esc(L.formatDateTime(e.submittedAt))}</b></span>` : '<span>لم يتم تسليم الرابط بعد</span>'}
        ${e.linkUpdatedAt && e.linkUpdatedAt !== e.submittedAt ? `<span>آخر تعديل للرابط: ${esc(L.formatDateTime(e.linkUpdatedAt))}</span>` : ''}
        ${e.platform ? `<span>المنصة: <b>${esc(L.platformLabel(e))}</b></span>` : ''}
        <span class="save-state ${saveMsg ? saveMsg.kind : ''}" role="status">${saveMsg ? esc(saveMsg.text) : ''}</span>
      </div>
      ${showReview ? `<div class="review-box">
          <label class="fld">حالة الاختبار<select class="input status-select">${options(L.STATUSES.filter((x) => x.key !== 'not_submitted'), e.status)}</select></label>
          <label class="fld">ملاحظات المراجعة${e.status === 'needs_revision' ? ' (مطلوبة)' : ''}<textarea class="input notes-input" rows="1" maxlength="2000" placeholder="اكتب ملاحظات التعديل المطلوبة أو أي ملاحظة على الاختبار">${esc(e.reviewNotes)}</textarea></label>
          <div style="grid-column:1/-1;display:flex;gap:8px;align-items:center"><button class="btn btn-sm btn-save-review" type="button">${icon('check')} حفظ الحالة والملاحظات</button><span class="err review-err"></span></div>
        </div>` : ''}
      ${!admin && e.reviewNotes ? `<div class="notes-view"><b>ملاحظات المراجعة:</b> ${esc(e.reviewNotes)}</div>` : ''}
    </div>`;
  }

  function bindSubmissionEvents(box) {
    const ctx = (el) => {
      const row = el.closest('.exam-row');
      const card = el.closest('.stu-card');
      return { row, card, sid: card.dataset.sid, subj: row.dataset.subj };
    };
    const setMsg = (row, text, kind) => { const s = $('.save-state', row); s.textContent = text; s.className = 'save-state ' + (kind || ''); };

    async function saveDelivery(el, force) {
      const { row, sid, subj } = ctx(el);
      const student = state.students.find((s) => s.id === sid);
      const exam = student && student.exams.find((e) => e.subject === subj);
      if (!exam) return;
      const linkEl = $('.link-input', row);
      const platEl = $('.platform-select', row);
      const otherEl = $('.other-name', row);
      let link = L.normalizeUrl(linkEl.value);
      linkEl.classList.remove('invalid'); platEl.classList.remove('invalid'); otherEl.classList.remove('invalid');
      if (!link) {
        if (exam.link && force) return clearLink(el);
        if (!exam.link) setMsg(row, '', '');
        return;
      }
      if (!L.isValidUrl(link)) { linkEl.classList.add('invalid'); setMsg(row, 'الرابط غير صحيح — يجب أن يبدأ بـ https://', 'bad'); return; }
      if (!platEl.value) {
        const guess = L.detectPlatform(link);
        if (guess) { platEl.value = guess; otherEl.hidden = guess !== 'other'; }
      }
      if (!platEl.value) { platEl.classList.add('invalid'); setMsg(row, 'اختر المنصة الموجود عليها الاختبار ليتم الحفظ.', 'bad'); platEl.focus(); return; }
      if (platEl.value === 'other' && !otherEl.value.trim()) { otherEl.hidden = false; otherEl.classList.add('invalid'); setMsg(row, 'اكتب اسم المنصة ليتم الحفظ.', 'bad'); otherEl.focus(); return; }
      const patch = { link, platform: platEl.value, platformName: platEl.value === 'other' ? otherEl.value.trim() : '' };
      if (patch.link === exam.link && patch.platform === exam.platform && patch.platformName === (exam.platformName || '')) {
        if (force) setMsg(row, '✓ محفوظ', 'ok');
        return;
      }
      await persist(row, sid, subj, patch, exam.link ? '✓ تم تحديث الرابط' : '✓ تم حفظ الرابط وتسجيل التسليم');
    }

    async function persist(row, sid, subj, patch, okText) {
      setMsg(row, 'جارٍ الحفظ…', 'busy');
      row.dataset.saving = '1';
      try {
        const saved = await S.patchExam(sid, subj, patch);
        upsertStudent(saved);
        refreshCard(sid, { subj, text: okText, kind: 'ok' });
      } catch (e) {
        delete row.dataset.saving;
        setMsg(row, e.message, 'bad');
      }
    }

    async function clearLink(el) {
      const { row, sid, subj } = ctx(el);
      const ok = await confirmDialog('حذف الرابط', `سيتم حذف رابط اختبار <b>${esc(L.subjectLabel(subj))}</b> وإعادة حالته إلى "لم يُسلم".`, 'حذف الرابط', true);
      if (!ok) { const s = state.students.find((x) => x.id === sid); $('.link-input', row).value = s.exams.find((e) => e.subject === subj).link; return; }
      persist(row, sid, subj, { link: '' }, '✓ تم حذف الرابط');
    }

    box.addEventListener('change', (ev) => {
      const t = ev.target;
      if (t.classList.contains('link-input')) saveDelivery(t, false);
      else if (t.classList.contains('platform-select')) {
        const row = t.closest('.exam-row');
        const other = $('.other-name', row);
        other.hidden = t.value !== 'other';
        if (t.value === 'other' && !other.value) { other.focus(); return; }
        saveDelivery(t, false);
      } else if (t.classList.contains('other-name')) saveDelivery(t, false);
      else if (t.classList.contains('status-select')) {
        const row = t.closest('.exam-row');
        if (t.value === 'needs_revision' && !$('.notes-input', row).value.trim()) {
          $('.review-err', row).textContent = 'اكتب ملاحظات التعديل ثم اضغط "حفظ الحالة والملاحظات".';
          $('.notes-input', row).focus();
          return;
        }
        saveReview(t);
      }
    });
    box.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && (ev.target.classList.contains('link-input') || ev.target.classList.contains('other-name'))) {
        ev.preventDefault();
        ev.target.blur();
      }
    });
    box.addEventListener('paste', (ev) => {
      if (ev.target.classList.contains('link-input')) setTimeout(() => saveDelivery(ev.target, false), 0);
    });
    box.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.classList.contains('btn-save')) saveDelivery(b, true);
      else if (b.classList.contains('btn-clear')) clearLink(b);
      else if (b.classList.contains('btn-save-review')) saveReview(b);
    });

    async function saveReview(el) {
      const { row, sid, subj } = ctx(el);
      const status = $('.status-select', row).value;
      const reviewNotes = $('.notes-input', row).value.trim();
      $('.review-err', row).textContent = '';
      if (status === 'needs_revision' && !reviewNotes) {
        $('.review-err', row).textContent = 'ملاحظات التعديل مطلوبة عند اختيار "يحتاج إلى تعديل".';
        return;
      }
      await persist(row, sid, subj, { status, reviewNotes }, '✓ تم تحديث الحالة إلى: ' + L.statusLabel(status));
    }
  }

  function refreshCard(sid, msg) {
    const card = $(`.stu-card[data-sid="${CSS.escape(sid)}"]`);
    const s = state.students.find((x) => x.id === sid);
    if (!card || !s) return;
    const subjects = card.dataset.subjects.split(',').filter((k) => s.exams.some((e) => e.subject === k));
    const tmp = document.createElement('div');
    tmp.innerHTML = studentCard(s, subjects);
    const fresh = tmp.firstElementChild;
    if (msg) {
      const row = $(`.exam-row[data-subj="${CSS.escape(msg.subj)}"]`, fresh);
      if (row) { const st = $('.save-state', row); st.textContent = msg.text; st.className = 'save-state ' + msg.kind; }
    }
    card.replaceWith(fresh);
    const rc = $('#sub-body .result-count');
    if (rc) {
      const cards = $$('#sub-body .stu-card');
      const rows = [];
      cards.forEach((c) => {
        const st = state.students.find((x) => x.id === c.dataset.sid);
        if (!st) return;
        c.dataset.subjects.split(',').forEach((k) => {
          const e = st.exams.find((x) => x.subject === k);
          if (e) rows.push({ student: st, exam: e });
        });
      });
      rc.textContent = resultCountText(rows, cards.length);
    }
  }

  /* ================= reports ================= */
  function renderReports(v) {
    const f = state.filters.reports;
    v.innerHTML = pageHead('التقارير والتصدير', 'صدّر بيانات الاختبارات إلى Excel أو PDF حسب التصفية المختارة.',
      `<button class="btn btn-accent" id="ex-xlsx">${icon('sheet')} تصدير Excel</button>
       <button class="btn btn-primary" id="ex-pdf">${icon('download')} تصدير PDF</button>
       ${S.features.print ? `<button class="btn" id="ex-print">${icon('printer')} طباعة</button>` : ''}`) +
      filterBar(f, { extra: `<select class="input" data-f="kind" aria-label="نوع التقرير" style="flex:1 1 200px">
        <option value="full"${f.kind === 'full' ? ' selected' : ''}>تقرير تفصيلي + إحصائي</option>
        <option value="stats"${f.kind === 'stats' ? ' selected' : ''}>تقرير إحصائي إجمالي فقط (PDF)</option></select>` }) +
      '<div id="rep-body"></div>';
    bindFilters(v, f, () => drawReport($('#rep-body')));
    drawReport($('#rep-body'));
    const ctx = () => ({ schoolName: state.settings.schoolName, termName: state.settings.termName, filters: Object.assign({}, f) });
    const rows = () => L.filterRows(allRows(), f);
    const guard = () => { if (!rows().length) { toast('لا توجد بيانات للتصدير ضمن التصفية الحالية.', 'bad'); return false; } return true; };
    $('#ex-xlsx').addEventListener('click', (e) => guard() && withBusy(e.currentTarget, async () => {
      try {
        const ok = await S.download(`تقرير-الاختبارات-${X.stamp()}.xlsx`, X.buildExcel(rows(), ctx()));
        if (ok) toast('تم تصدير ملف Excel.', 'ok');
      } catch (err) { toast(err.message, 'bad'); }
    }));
    $('#ex-pdf').addEventListener('click', (e) => { const btn = e.currentTarget; return guard() && withBusy(btn, async () => {
      const old = btn.innerHTML;
      btn.innerHTML = 'جارٍ إنشاء PDF…';
      try {
        const blob = await X.buildPdf(rows(), ctx(), f.kind);
        const ok = await S.download(`${f.kind === 'stats' ? 'التقرير-الإحصائي' : 'تقرير-الاختبارات'}-${X.stamp()}.pdf`, blob);
        if (ok) toast('تم تصدير ملف PDF.', 'ok');
      } catch (err) { toast(err.message || 'تعذر إنشاء ملف PDF.', 'bad'); } finally { btn.innerHTML = old; }
    }); });
    const pr = $('#ex-print');
    if (pr) pr.addEventListener('click', () => guard() && X.printReport(rows(), ctx(), f.kind));
  }

  function drawReport(box) {
    const rows = L.filterRows(allRows(), state.filters.reports);
    const t = L.computeStats(rows).totals;
    const LIMIT = 300;
    box.innerHTML = `<div class="kpis">
      ${[['المطلوبة', t.total, 'var(--primary)'], ['المسلمة', t.delivered, STATUS_COLORS.received], ['غير المسلمة', t.not_submitted, STATUS_COLORS.not_submitted],
        ['قيد المراجعة', t.under_review, STATUS_COLORS.under_review], ['تحتاج تعديل', t.needs_revision, STATUS_COLORS.needs_revision],
        ['المعتمدة', t.approved, STATUS_COLORS.approved], ['نسبة الإنجاز', fmtPct(t.deliveryRate), 'var(--accent)']]
        .map(([l, val, c]) => `<div class="card kpi" style="--kpi-c:${c}"><div class="k-label">${l}</div><div class="k-value">${val}</div></div>`).join('')}
    </div>
    <div class="card"><div class="card-pad" style="padding-bottom:6px"><h3>معاينة التقرير</h3><p class="card-sub">${esc(X.filterDescription(state.filters.reports))} — ${rows.length} اختبار${rows.length > LIMIT ? ` (تعرض المعاينة أول ${LIMIT}، والتصدير يشمل الكل)` : ''}</p></div>
    ${rows.length ? `<div class="table-wrap"><table class="tbl responsive"><thead><tr><th>اسم الطالب</th><th>الصف والشعبة</th><th>المادة</th><th>المنصة</th><th>رابط الاختبار</th><th>الحالة</th><th>تاريخ التسليم</th><th>ملاحظات المراجعة</th></tr></thead><tbody>
      ${rows.slice(0, LIMIT).map(({ student, exam }) => `<tr>
        <td data-label="الطالب">${esc(student.name)}</td><td data-label="الصف" class="nowrap">${esc(L.classLabel(student))}</td>
        <td data-label="المادة">${esc(L.subjectLabel(exam.subject))}</td><td data-label="المنصة">${esc(L.platformLabel(exam)) || '—'}</td>
        <td data-label="الرابط" class="link-cell ltr">${exam.link ? `<a href="${esc(exam.link)}" target="_blank" rel="noopener noreferrer">${esc(exam.link)}</a>` : '—'}</td>
        <td data-label="الحالة">${badge(exam.status)}</td><td data-label="التسليم" class="nowrap">${esc(L.formatDateTime(exam.submittedAt)) || '—'}</td>
        <td data-label="الملاحظات">${esc(exam.reviewNotes)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">لا توجد بيانات ضمن التصفية الحالية.</div>'}</div>`;
  }

  /* ================= manage ================= */
  function renderManage(v) {
    v.innerHTML = pageHead('إدارة البيانات والصلاحيات', 'الإعدادات العامة، حسابات معلمي المواد، والنسخ الاحتياطي.') + `
      <div class="grid grid-2">
        <div class="card card-pad"><h3>الإعدادات العامة</h3><p class="card-sub">تظهر في رأس المنصة وفي التقارير.</p>
          <form id="f-settings" class="form-grid">
            <label class="fld full">اسم المدرسة<input class="input" name="schoolName" maxlength="120" value="${esc(state.settings.schoolName)}"></label>
            <label class="fld full">الفصل / العام الدراسي<input class="input" name="termName" maxlength="120" value="${esc(state.settings.termName)}" placeholder="مثال: الفصل الدراسي الأول 2026-2027"></label>
            <div class="full"><button class="btn btn-primary" type="submit">${icon('check')} حفظ الإعدادات</button></div></form></div>
        <div class="card card-pad"><h3>النسخ الاحتياطي والاستعادة</h3>
          <p class="card-sub">نزّل نسخة كاملة من البيانات (ملف JSON) واحتفظ بها في مكان آمن، ويمكنك استعادتها لاحقًا.</p>
          <div class="actions"><button class="btn btn-primary" id="bk-down">${icon('download')} تنزيل نسخة احتياطية</button>
            <label class="btn">${icon('upload')} استعادة من ملف<input type="file" id="bk-file" accept=".json,application/json" hidden></label></div>
          ${S.features.serverSnapshots ? `<hr style="border:0;border-top:1px solid var(--border);margin:16px 0">
            <h3 style="font-size:15px">نسخ تلقائية على الخادم</h3><p class="card-sub">تُنشأ نسخة تلقائيًا عند تشغيل الخادم وكل 24 ساعة وقبل أي استعادة.</p>
            <button class="btn btn-sm" id="bk-snap">${icon('database')} إنشاء نسخة الآن</button><div id="snap-list" class="small" style="margin-top:10px"></div>` : ''}
        </div>
      </div>
      ${S.features.teacherAccounts ? `<div class="card card-pad section-gap"><h3>دخول معلمي المواد</h3>
        <p class="card-sub">عند التفعيل يستطيع معلمو المواد الدخول بحساباتهم لتسليم الروابط فقط (دون تعديل الطلاب أو الحالات). لا يُربط الاختبار باسم المعلم.</p>
        <label class="switch"><input type="checkbox" id="tp-toggle"${state.settings.teacherPortalEnabled ? ' checked' : ''}> تفعيل دخول معلمي المواد</label>
        <div id="tp-users" style="margin-top:14px"></div></div>` : ''}
      ${S.features.auth ? `<div class="card card-pad section-gap"><h3>تغيير كلمة المرور</h3>
        <form id="f-pass" class="form-grid" style="max-width:620px">
          <label class="fld">كلمة المرور الحالية<input class="input ltr" type="password" name="currentPassword" required autocomplete="current-password"></label>
          <label class="fld">كلمة المرور الجديدة<input class="input ltr" type="password" name="newPassword" required minlength="8" autocomplete="new-password"></label>
          <div class="full"><button class="btn" type="submit">${icon('key')} تغيير كلمة المرور</button> <span class="err" id="pass-err"></span></div></form></div>`
        : ''}
      ${S.features.teacherDirectory ? `<div class="card card-pad section-gap"><h3>واجهة معلمي المواد</h3>
        <p class="card-sub">عند التفعيل يفتح معلم المادة رابط المنصة نفسه، فيختار اسمه وتظهر له واجهة تسليم الروابط فقط. لا يستطيع تعديل الطلاب أو تغيير الحالات أو رؤية الإحصائيات والتقارير، ولا يُسجَّل اسمه على الاختبار.</p>
        <label class="switch"><input type="checkbox" id="tp-toggle"${state.settings.teacherPortalEnabled ? ' checked' : ''}> تفعيل واجهة معلمي المواد</label>
        ${S.features.teacherCode ? `<form id="f-code" class="form-grid" style="margin-top:12px;grid-template-columns:minmax(0,320px) auto;align-items:end" autocomplete="off">
            <label class="fld">رمز الدخول الموحد لمعلمي المواد ${state.settings.teacherCodeSet ? '<span class="badge st-approved"><span class="dot"></span>محدد</span>' : '<span class="badge st-not_submitted"><span class="dot"></span>غير محدد</span>'}
              <input class="input ltr" name="code" minlength="4" required placeholder="${state.settings.teacherCodeSet ? 'اكتب رمزًا جديدًا لتغييره' : 'مثال: 2026'}" autocomplete="new-password"></label>
            <button class="btn" type="submit">${icon('key')} حفظ الرمز</button>
            <div class="small muted full">يدخل معلم المادة باختيار اسمه وكتابة هذا الرمز. تغيير الرمز يُخرج جميع معلمي المواد من المنصة.</div></form>`
        : `<div class="card-sub small" style="margin:10px 0 0;background:var(--primary-50);padding:10px 12px;border-radius:8px;color:var(--primary-700)">
          <b>طريقة منح الدخول:</b> من زر "مشاركة" في أعلى صفحة المنصة على Claude، أضف معلمي المواد بصلاحية <b>"مساهم" (Contributor)</b>.
          صلاحية "محرر" تمنح كل صلاحيات معلم التربية الخاصة، فلا تمنحها لمعلمي المواد.</div>`}
        <div id="td-list" style="margin-top:14px"></div></div>` : ''}`;

    $('#f-settings').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await withBusy($('button', e.target), async () => { state.settings = Object.assign(state.settings, await S.saveSettings(Object.fromEntries(new FormData(e.target)))); });
        toast('تم حفظ الإعدادات.', 'ok');
        const sub = $('.brand .sub');
        if (sub) sub.textContent = [state.settings.schoolName, state.settings.termName].filter(Boolean).join(' — ') || 'لطلاب التربية الخاصة';
      } catch (err) { toast(err.message, 'bad'); }
    });

    $('#bk-down').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
      try {
        const payload = await S.backup();
        const ok = await S.download(`نسخة-احتياطية-الاختبارات-${X.stamp()}.json`, X.backupBlob(payload));
        if (ok) toast('تم تنزيل النسخة الاحتياطية.', 'ok');
      } catch (err) { toast(err.message, 'bad'); }
    }));

    $('#bk-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      let payload;
      try {
        payload = JSON.parse(await file.text());
        L.validateBackup(payload);
      } catch (err) { toast(err instanceof SyntaxError ? 'الملف ليس نسخة احتياطية صالحة.' : err.message, 'bad'); return; }
      const ok = await confirmDialog('استعادة نسخة احتياطية',
        `ستُستبدل جميع البيانات الحالية (${state.students.length} طالب) ببيانات النسخة (${payload.students.length} طالب، بتاريخ ${esc(L.formatDateTime(payload.exportedAt) || 'غير معروف')}). ${S.features.serverSnapshots ? 'سيتم حفظ نسخة من البيانات الحالية على الخادم قبل الاستعادة.' : 'يُنصح بتنزيل نسخة من البيانات الحالية أولًا.'}`, 'استعادة', true);
      if (!ok) return;
      try {
        const r = await S.restore(payload);
        state.students = await S.loadStudents();
        if (isAdmin()) state.settings = await S.getSettings();
        updateNavCounts();
        toast(`تمت الاستعادة (${r.count} طالب).`, 'ok');
        renderView();
      } catch (err) { toast(err.message, 'bad'); }
    });

    if (S.features.serverSnapshots) {
      const loadSnaps = async () => {
        try {
          const list = await S.listSnapshots();
          $('#snap-list').innerHTML = list.length ? `<div class="muted">آخر النسخ المحفوظة على الخادم:</div><ul style="margin:4px 0;padding-inline-start:18px">${list.slice(0, 6).map((b) => `<li class="ltr" style="text-align:right">${esc(b.name)} (${Math.ceil(b.size / 1024)} KB)</li>`).join('')}</ul>` : '';
        } catch (e) { /* ignore */ }
      };
      loadSnaps();
      $('#bk-snap').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
        try { await S.createSnapshot(); toast('تم إنشاء نسخة على الخادم.', 'ok'); loadSnaps(); } catch (err) { toast(err.message, 'bad'); }
      }));
    }

    if (S.features.teacherDirectory) {
      $('#tp-toggle').addEventListener('change', async (e) => {
        try {
          state.settings = Object.assign(state.settings, await S.saveSettings({ teacherPortalEnabled: e.target.checked }));
          toast(e.target.checked ? 'تم تفعيل واجهة معلمي المواد.' : 'تم إيقاف واجهة معلمي المواد.', 'ok');
        } catch (err) { e.target.checked = !e.target.checked; toast(err.message, 'bad'); }
      });
      drawTeacherDirectory();
      const fc = $('#f-code');
      if (fc) fc.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await withBusy($('button', e.target), async () => { state.settings = Object.assign(state.settings, await S.saveSettings({ teacherAccessCode: e.target.code.value })); });
          toast('تم حفظ رمز الدخول.', 'ok');
          renderView();
        } catch (err) { toast(err.message, 'bad'); }
      });
    }
    if (S.features.auth) {
      $('#f-pass').addEventListener('submit', async (e) => {
        e.preventDefault();
        $('#pass-err').textContent = '';
        try {
          await withBusy($('button', e.target), () => S.changePassword(Object.fromEntries(new FormData(e.target))));
          e.target.reset();
          toast('تم تغيير كلمة المرور.', 'ok');
        } catch (err) { $('#pass-err').textContent = err.message; }
      });
    }

    if (S.features.teacherAccounts) {
      $('#tp-toggle').addEventListener('change', async (e) => {
        try {
          state.settings = Object.assign(state.settings, await S.saveSettings({ teacherPortalEnabled: e.target.checked }));
          toast(e.target.checked ? 'تم تفعيل دخول معلمي المواد.' : 'تم إيقاف دخول معلمي المواد وإنهاء جلساتهم.', 'ok');
        } catch (err) { e.target.checked = !e.target.checked; toast(err.message, 'bad'); }
      });
      drawTeacherUsers();
    }
  }

  async function drawTeacherDirectory() {
    const box = $('#td-list');
    if (!box) return;
    let list = [];
    try { list = await S.listTeachers(); } catch (e) { box.textContent = e.message; return; }
    box.innerHTML = `<div class="result-count" style="margin:0 0 8px">${list.length} معلم</div>
      ${list.length ? `<div class="table-wrap" style="max-height:420px;overflow:auto;border:1px solid var(--border);border-radius:8px"><table class="tbl"><thead><tr><th>اسم المعلم</th><th>المادة / التخصص</th><th>مواد التسليم في المنصة</th><th></th></tr></thead><tbody>
      ${list.map((t) => `<tr><td>${esc(t.name)}</td><td class="muted">${esc(t.subjectLabel || '')}</td>
        <td>${(t.subjects || []).length ? t.subjects.map((k) => `<span class="chip">${esc(L.subjectLabel(k))}</span>`).join('') : '<span class="muted small">كل المواد</span>'}</td>
        <td><button class="btn btn-sm btn-danger" data-del-t="${esc(t.id)}" aria-label="حذف">${icon('trash')}</button></td></tr>`).join('')}</tbody></table></div>`
        : '<p class="muted small">لا توجد أسماء معلمين.</p>'}
      <form id="f-teacher-add" class="form-grid" style="margin-top:12px;grid-template-columns:2fr 1fr auto;align-items:end" autocomplete="off">
        <label class="fld">اسم المعلم<input class="input" name="name" maxlength="120" required></label>
        <label class="fld">المادة<select class="input" name="subject">${options(L.SUBJECTS, '', 'كل المواد / أخرى')}</select></label>
        <button class="btn btn-primary" type="submit">${icon('plus')} إضافة معلم</button>
        <div class="err full" id="t-err"></div></form>`;
    $('#f-teacher-add').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      try {
        await withBusy($('button', e.target), () => S.saveTeacher({ name: fd.name, subjects: fd.subject ? [fd.subject] : [] }));
        toast('تمت إضافة المعلم.', 'ok');
        drawTeacherDirectory();
      } catch (err) { $('#t-err').textContent = err.message; }
    });
    $$('[data-del-t]', box).forEach((b) => b.addEventListener('click', async () => {
      const t = list.find((x) => x.id === b.dataset.delT);
      if (!(await confirmDialog('حذف المعلم', `سيتم حذف <b>${esc(t ? t.name : '')}</b> من قائمة معلمي المواد. الروابط التي سلّمها تبقى كما هي.`, 'حذف', true))) return;
      try { await S.deleteTeacher(b.dataset.delT); drawTeacherDirectory(); } catch (err) { toast(err.message, 'bad'); }
    }));
  }

  async function drawTeacherUsers() {
    const box = $('#tp-users');
    if (!box) return;
    let users = [];
    try { users = (await S.listUsers()).filter((u) => u.role === 'teacher'); } catch (e) { box.textContent = e.message; return; }
    box.innerHTML = `${users.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>الاسم</th><th>اسم المستخدم</th><th></th></tr></thead><tbody>
      ${users.map((u) => `<tr><td>${esc(u.displayName)}</td><td class="ltr" style="text-align:right">${esc(u.username)}</td>
        <td><button class="btn btn-sm btn-danger" data-del-user="${u.id}">${icon('trash')} حذف</button></td></tr>`).join('')}</tbody></table></div>`
      : '<p class="muted small">لا توجد حسابات لمعلمي المواد.</p>'}
      <form id="f-user" class="form-grid" style="margin-top:12px;grid-template-columns:repeat(3,minmax(0,1fr)) auto;align-items:end" autocomplete="off">
        <label class="fld">الاسم الظاهر<input class="input" name="displayName" maxlength="80" placeholder="مثال: معلم الرياضيات"></label>
        <label class="fld">اسم المستخدم<input class="input ltr" name="username" required autocomplete="off"></label>
        <label class="fld">كلمة المرور<input class="input ltr" type="password" name="password" required minlength="8" autocomplete="new-password"></label>
        <button class="btn btn-primary" type="submit">${icon('plus')} إضافة حساب</button>
        <div class="err full" id="user-err"></div></form>`;
    $('#f-user').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await withBusy($('button', e.target), () => S.createUser(Object.fromEntries(new FormData(e.target))));
        toast('تمت إضافة الحساب.', 'ok');
        drawTeacherUsers();
      } catch (err) { $('#user-err').textContent = err.message; }
    });
    $$('[data-del-user]', box).forEach((b) => b.addEventListener('click', async () => {
      if (!(await confirmDialog('حذف الحساب', 'سيتم حذف حساب معلم المادة ولن يتمكن من الدخول.', 'حذف', true))) return;
      try { await S.deleteUser(b.dataset.delUser); drawTeacherUsers(); } catch (err) { toast(err.message, 'bad'); }
    }));
  }

  boot();
})();
