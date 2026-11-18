/* مخزن البيانات عبر خادم المنصة (REST API) */
(function () {
  'use strict';

  // When the page is hosted apart from its server (e.g. GitHub Pages + Supabase), window.EP_API holds the
  // server address and the session travels in the x-ep-token header instead of a cookie.
  const BASE = (window.EP_API || '').replace(/\/$/, '');
  const TOKEN_KEY = 'ep.token';
  const token = {
    get() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } },
    set(v) { try { if (v) localStorage.setItem(TOKEN_KEY, v); else localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ } },
  };

  async function call(method, url, body) {
    url = BASE + url;
    const opts = { method, headers: { 'X-Requested-With': 'EP' }, credentials: 'same-origin' };
    if (BASE && token.get()) opts.headers['x-ep-token'] = token.get();
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    let res;
    try {
      res = await fetch(url, opts);
    } catch (e) {
      throw new Error('تعذر الاتصال بالخادم. تحقق من الاتصال وحاول مرة أخرى.');
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* empty */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || 'حدث خطأ (' + res.status + ')');
      err.status = res.status;
      if (res.status === 401 && window.EPApp) window.EPApp.onUnauthorized();
      throw err;
    }
    if (BASE && data && data.token) token.set(data.token);
    return data;
  }

  const ApiStore = {
    mode: 'server',
    features: { auth: true, teacherAccounts: false, teacherDirectory: true, teacherCode: true, serverSnapshots: true, print: true },
    version: 0,

    session: () => call('GET', '/api/session'),
    setup: (body) => call('POST', '/api/setup', body),
    login: (body) => call('POST', '/api/login', body),
    logout: () => call('POST', '/api/logout').finally(() => { if (BASE) token.set(null); }),
    teacherLogin: (body) => call('POST', '/api/teacher-login', body),
    listTeachers: () => call('GET', '/api/teachers').then((r) => r.teachers),
    saveTeacher: (t) => call('POST', '/api/teachers', t),
    deleteTeacher: (id) => call('DELETE', '/api/teachers/' + encodeURIComponent(id)),

    async loadStudents() {
      const r = await call('GET', '/api/students');
      this.version = r.version;
      return r.students;
    },
    createStudent: (input) => call('POST', '/api/students', input).then((r) => r.student),
    updateStudent: (id, input) => call('PUT', '/api/students/' + encodeURIComponent(id), input).then((r) => r.student),
    deleteStudent: (id) => call('DELETE', '/api/students/' + encodeURIComponent(id)),
    patchExam: (id, subject, patch) =>
      call('PATCH', '/api/students/' + encodeURIComponent(id) + '/exams/' + encodeURIComponent(subject), patch).then((r) => r.student),

    getSettings: () => call('GET', '/api/settings').then((r) => r.settings),
    saveSettings: (patch) => call('PUT', '/api/settings', patch).then((r) => r.settings),

    listUsers: () => call('GET', '/api/users').then((r) => r.users),
    createUser: (body) => call('POST', '/api/users', body),
    deleteUser: (id) => call('DELETE', '/api/users/' + id),
    changePassword: (body) => call('POST', '/api/account/password', body),

    backup: () => call('GET', '/api/backup'),
    restore: (payload) => call('POST', '/api/restore', payload),
    listSnapshots: () => call('GET', '/api/backups').then((r) => r.backups),
    createSnapshot: () => call('POST', '/api/backups'),

    /** Poll for changes made by other users / devices. */
    watch(onChange) {
      const tick = async () => {
        if (document.hidden) return;
        try {
          const r = await call('GET', '/api/version');
          if (r.version !== this.version) onChange();
        } catch (e) { /* ignore transient errors */ }
      };
      setInterval(tick, 15000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    },

    async download(filename, blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return true;
    },
  };

  window.EPStore = ApiStore;
})();
