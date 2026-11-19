/*
 * منطق العمل المشترك بين الخادم والمتصفح.
 * Shared business logic: constants, validation, status transitions, statistics.
 * Loaded with require() on the server and as a plain <script> in the browser (window.EPLogic).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EPLogic = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SUBJECTS = [
    { key: 'arabic', label: 'اللغة العربية' },
    { key: 'english', label: 'اللغة الإنجليزية' },
    { key: 'math', label: 'الرياضيات' },
    { key: 'islamic', label: 'التربية الإسلامية' },
    { key: 'social', label: 'الدراسات الاجتماعية' },
    { key: 'science', label: 'العلوم' },
    { key: 'biology', label: 'الأحياء' },
    { key: 'chemistry', label: 'الكيمياء' },
    { key: 'physics', label: 'الفيزياء' },
  ];

  // Order matters: it is the workflow order and the order used in charts and reports.
  const STATUSES = [
    { key: 'not_submitted', label: 'لم يُسلم', icon: '⏳' },
    { key: 'received', label: 'تم استلام الرابط', icon: '📥' },
    { key: 'under_review', label: 'قيد المراجعة', icon: '🔍' },
    { key: 'needs_revision', label: 'يحتاج إلى تعديل', icon: '✏️' },
    { key: 'approved', label: 'معتمد وجاهز للاستخدام', icon: '✅' },
  ];

  const PLATFORMS = [
    { key: 'forms', label: 'فورمز (Forms)' },
    { key: 'claude', label: 'كلاود (Claude)' },
    { key: 'chatgpt', label: 'شات جي بي تي (ChatGPT)' },
    { key: 'portal', label: 'البوابة (بوابة التعلم الذكي)' },
    { key: 'other', label: 'أخرى' },
  ];

  const GRADES = [
    { key: 'KG1', label: 'رياض الأطفال 1' },
    { key: 'KG2', label: 'رياض الأطفال 2' },
  ];
  for (let i = 1; i <= 12; i++) GRADES.push({ key: String(i), label: 'الصف ' + i });

  // النوع: لفصل متابعة البنين عن البنات في الإحصائيات والتقارير
  const GENDERS = [
    { key: 'm', label: 'بنين' },
    { key: 'f', label: 'بنات' },
  ];

  const mapOf = (list) => Object.fromEntries(list.map((x) => [x.key, x]));
  const SUBJECT_MAP = mapOf(SUBJECTS);
  const STATUS_MAP = mapOf(STATUSES);
  const PLATFORM_MAP = mapOf(PLATFORMS);
  const GRADE_MAP = mapOf(GRADES);
  const GENDER_MAP = mapOf(GENDERS);
  const genderLabel = (k) => (GENDER_MAP[k] ? GENDER_MAP[k].label : '');

  const subjectLabel = (k) => (SUBJECT_MAP[k] ? SUBJECT_MAP[k].label : k);
  const statusLabel = (k) => (STATUS_MAP[k] ? STATUS_MAP[k].label : k);
  const gradeLabel = (k) => (GRADE_MAP[k] ? GRADE_MAP[k].label : k);
  function platformLabel(exam) {
    if (!exam || !exam.platform) return '';
    if (exam.platform === 'other') return exam.platformName ? exam.platformName : 'أخرى';
    return PLATFORM_MAP[exam.platform] ? PLATFORM_MAP[exam.platform].label : exam.platform;
  }
  const classLabel = (s) => gradeLabel(s.grade) + (s.section ? ' / ' + s.section : '');

  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
      this.status = 400;
    }
  }

  function isValidUrl(value) {
    if (typeof value !== 'string') return false;
    const v = value.trim();
    if (!v || /\s/.test(v)) return false;
    try {
      const u = new URL(v);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      return u.hostname === 'localhost' || /^[^.]+(\.[^.]+)+$/.test(u.hostname);
    } catch (e) {
      return false;
    }
  }

  /** Normalise a URL typed without a scheme ("forms.office.com/...") */
  function normalizeUrl(value) {
    let v = String(value || '').trim();
    if (v && !/^[a-z][a-z0-9+.-]*:/i.test(v)) v = 'https://' + v;
    return v;
  }

  /** Guess the platform from a link so the teacher usually doesn't have to pick it. */
  function detectPlatform(url) {
    let host = '';
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch (e) {
      return '';
    }
    const has = (s) => host === s || host.endsWith('.' + s);
    if (has('forms.office.com') || has('forms.microsoft.com') || has('forms.gle') ||
        (has('docs.google.com') && /\/forms\//.test(url))) return 'forms';
    if (has('claude.ai') || has('claude.site') || has('anthropic.com')) return 'claude';
    if (has('chatgpt.com') || has('chat.openai.com') || has('openai.com')) return 'chatgpt';
    if (has('alefed.com') || has('moe.gov.ae') || has('ese.gov.ae') || has('lms.moe.gov.ae')) return 'portal';
    return '';
  }

  const clean = (v, max) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);

  function newExam(subject) {
    return {
      subject,
      link: '',
      platform: '',
      platformName: '',
      status: 'not_submitted',
      reviewNotes: '',
      submittedAt: null,
      linkUpdatedAt: null,
      statusUpdatedAt: null,
    };
  }

  /** Validate and normalise the editable student fields. */
  function validateStudentInput(input) {
    const name = clean(input.name, 120);
    const grade = clean(input.grade, 10);
    const section = clean(input.section, 20);
    const gender = clean(input.gender, 2);
    if (name.length < 2) throw new ValidationError('يرجى إدخال اسم الطالب (حرفان على الأقل).');
    if (gender && !GENDER_MAP[gender]) throw new ValidationError('النوع غير صحيح.');
    if (!GRADE_MAP[grade]) throw new ValidationError('يرجى اختيار الصف.');
    if (!section) throw new ValidationError('يرجى إدخال الشعبة.');
    const subjects = Array.isArray(input.subjects) ? input.subjects : [];
    const uniq = [];
    for (const s of subjects) {
      if (!SUBJECT_MAP[s]) throw new ValidationError('مادة غير معروفة: ' + s);
      if (!uniq.includes(s)) uniq.push(s);
    }
    return { name, grade, section, gender, subjects: uniq };
  }

  /**
   * Apply a change to one exam and return the new exam object (input is not mutated).
   * role: 'admin' (معلم التربية الخاصة) may change everything;
   *       'teacher' (معلم مادة) may only deliver the link and its platform.
   * Rules:
   *  - First link  -> status "received", submittedAt recorded.
   *  - Link changed while "needs_revision" or later -> back to "received" so it is reviewed again.
   *  - Link removed -> "not_submitted" and delivery data cleared.
   *  - A link always needs a platform; "other" needs the platform name.
   *  - "needs_revision" needs review notes.
   */
  function applyExamPatch(exam, patch, opts) {
    const role = (opts && opts.role) || 'admin';
    const now = (opts && opts.now) || new Date().toISOString();
    const e = Object.assign({}, exam);
    patch = patch || {};

    if (role !== 'admin' && ('status' in patch || 'reviewNotes' in patch)) {
      throw new ValidationError('تغيير حالة الاختبار متاح لمعلم التربية الخاصة فقط.');
    }

    if ('platform' in patch) {
      const p = clean(patch.platform, 20);
      if (p && !PLATFORM_MAP[p]) throw new ValidationError('منصة غير معروفة.');
      e.platform = p;
    }
    if ('platformName' in patch) e.platformName = clean(patch.platformName, 80);
    if (e.platform !== 'other') e.platformName = '';

    if ('link' in patch) {
      const link = patch.link ? normalizeUrl(patch.link) : '';
      if (link && !isValidUrl(link)) throw new ValidationError('الرابط غير صحيح. يجب أن يبدأ بـ https://');
      if (link.length > 2000) throw new ValidationError('الرابط طويل جدًا.');
      if (!link) {
        if (e.link) {
          e.link = '';
          e.platform = '';
          e.platformName = '';
          e.status = 'not_submitted';
          e.submittedAt = null;
          e.linkUpdatedAt = null;
          e.statusUpdatedAt = now;
        }
      } else if (link !== e.link) {
        if (!e.platform) e.platform = detectPlatform(link);
        const first = !e.link;
        e.link = link;
        if (first) {
          e.submittedAt = now;
          e.linkUpdatedAt = now;
        } else {
          e.linkUpdatedAt = now;
        }
        if (first || e.status === 'not_submitted' || e.status === 'needs_revision' || e.status === 'approved' || e.status === 'under_review') {
          if (e.status !== 'received') e.statusUpdatedAt = now;
          e.status = 'received';
        }
      }
    }

    if (e.link) {
      if (!e.platform) throw new ValidationError('يرجى اختيار المنصة الموجود عليها الاختبار.');
      if (e.platform === 'other' && !e.platformName) throw new ValidationError('يرجى كتابة اسم المنصة.');
    }

    if ('reviewNotes' in patch) e.reviewNotes = String(patch.reviewNotes || '').trim().slice(0, 2000);

    if ('status' in patch && patch.status !== e.status) {
      const st = patch.status;
      if (!STATUS_MAP[st]) throw new ValidationError('حالة غير معروفة.');
      if (!e.link && st !== 'not_submitted') throw new ValidationError('لا يمكن تغيير الحالة قبل إضافة رابط الاختبار.');
      if (e.link && st === 'not_submitted') throw new ValidationError('لتعيين الحالة "لم يُسلم" احذف الرابط أولًا.');
      e.status = st;
      e.statusUpdatedAt = now;
    }
    if (e.status === 'needs_revision' && !e.reviewNotes) {
      throw new ValidationError('يرجى كتابة ملاحظات التعديل المطلوبة.');
    }
    return e;
  }

  /** Flatten students into one row per required exam. */
  function examRows(students) {
    const rows = [];
    for (const s of students) {
      for (const e of s.exams || []) rows.push({ student: s, exam: e });
    }
    return rows;
  }

  const normalizeArabic = (t) => String(t || '')
    .toLowerCase()
    .replace(/[أإآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ً-ْـ]/g, '')
    .trim();

  /** filters: { q, gender, grade, section, subject, status, onlyMissing } */
  function filterRows(rows, f) {
    f = f || {};
    const q = normalizeArabic(f.q);
    return rows.filter(({ student, exam }) => {
      if (q && !normalizeArabic(student.name).includes(q)) return false;
      if (f.gender && student.gender !== f.gender) return false;
      if (f.grade && student.grade !== f.grade) return false;
      if (f.section && student.section !== f.section) return false;
      if (f.subject && exam.subject !== f.subject) return false;
      if (f.status && exam.status !== f.status) return false;
      if (f.onlyMissing && exam.status !== 'not_submitted') return false;
      return true;
    });
  }

  const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

  function emptyCounts() {
    const c = { total: 0, delivered: 0 };
    for (const s of STATUSES) c[s.key] = 0;
    return c;
  }
  function addTo(c, exam) {
    c.total++;
    c[exam.status] = (c[exam.status] || 0) + 1;
    if (exam.status !== 'not_submitted') c.delivered++;
  }
  function finish(c) {
    c.missing = c.not_submitted;
    c.deliveryRate = pct(c.delivered, c.total);
    c.approvalRate = pct(c.approved, c.total);
    return c;
  }

  /** Statistics over a list of {student, exam} rows. */
  function computeStats(rows) {
    const totals = emptyCounts();
    const byGrade = {};
    const bySubject = {};
    const byStudent = {};
    for (const { student, exam } of rows) {
      addTo(totals, exam);
      (byGrade[student.grade] = byGrade[student.grade] || emptyCounts());
      addTo(byGrade[student.grade], exam);
      (bySubject[exam.subject] = bySubject[exam.subject] || emptyCounts());
      addTo(bySubject[exam.subject], exam);
      if (!byStudent[student.id]) byStudent[student.id] = Object.assign(emptyCounts(), { student });
      addTo(byStudent[student.id], exam);
    }
    const gradeOrder = GRADES.map((g) => g.key);
    return {
      totals: finish(totals),
      byGrade: Object.keys(byGrade)
        .sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b))
        .map((k) => Object.assign(finish(byGrade[k]), { key: k, label: gradeLabel(k) })),
      bySubject: SUBJECTS.filter((s) => bySubject[s.key])
        .map((s) => Object.assign(finish(bySubject[s.key]), { key: s.key, label: s.label })),
      byStudent: Object.values(byStudent)
        .map(finish)
        .sort((a, b) => a.student.name.localeCompare(b.student.name, 'ar')),
      byStatus: STATUSES.map((s) => ({ key: s.key, label: s.label, count: totals[s.key] || 0 })),
    };
  }

  function sortStudents(list) {
    const gradeOrder = GRADES.map((g) => g.key);
    return list.slice().sort((a, b) =>
      gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade) ||
      String(a.section).localeCompare(String(b.section), 'ar') ||
      a.name.localeCompare(b.name, 'ar'));
  }

  /**
   * Parse pasted lines such as "سعيد جمعة النعيمي 5/2" (name then grade/section).
   * Accepts "/", "\\" or "-" between grade and section; KG1/KG2 for kindergarten.
   */
  function parseStudentLines(text) {
    const ok = [];
    const errors = [];
    const toLatin = (t) => t.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    String(text || '').split(/\r?\n/).forEach((raw, i) => {
      const line = toLatin(raw).replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
      if (!line) return;
      const m = line.match(/^(.*?)[\s,،\t-]*(KG\s?[12]|\d{1,2})\s*[/\\-]\s*([^\s/\\]+)\s*$/i);
      if (!m) { errors.push({ line: i + 1, text: raw.trim(), reason: 'لم يتم التعرف على الصف والشعبة (مثال: 5/2)' }); return; }
      const name = clean(m[1], 120);
      const grade = m[2].toUpperCase().replace(/\s/g, '');
      if (name.length < 2) { errors.push({ line: i + 1, text: raw.trim(), reason: 'الاسم غير مكتمل' }); return; }
      if (!GRADE_MAP[grade]) { errors.push({ line: i + 1, text: raw.trim(), reason: 'الصف غير صحيح' }); return; }
      ok.push({ name, grade, section: clean(m[3], 20) });
    });
    return { ok, errors };
  }

  const sameStudent = (a, b) => normalizeArabic(a.name) === normalizeArabic(b.name) && a.grade === b.grade && String(a.section) === String(b.section);

  /** Validate a backup file before it replaces the data. Returns normalised students. */
  function validateBackup(obj) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(obj.students)) {
      throw new ValidationError('ملف النسخة الاحتياطية غير صالح.');
    }
    const ids = new Set();
    return obj.students.map((s, i) => {
      const base = validateStudentInput({
        name: s.name, grade: s.grade, section: s.section, gender: s.gender,
        subjects: (s.exams || []).map((e) => e.subject),
      });
      const id = clean(s.id, 64) || ('s' + i + '_' + Date.now().toString(36));
      if (ids.has(id)) throw new ValidationError('معرّف طالب مكرر في النسخة الاحتياطية.');
      ids.add(id);
      const exams = base.subjects.map((subj) => {
        const src = (s.exams || []).find((e) => e.subject === subj) || {};
        const e = newExam(subj);
        e.link = src.link && isValidUrl(src.link) ? String(src.link).slice(0, 2000) : '';
        e.platform = PLATFORM_MAP[src.platform] ? src.platform : (e.link ? 'other' : '');
        e.platformName = e.platform === 'other' ? clean(src.platformName || (e.link ? 'غير محددة' : ''), 80) : '';
        e.status = STATUS_MAP[src.status] ? src.status : 'not_submitted';
        if (!e.link) e.status = 'not_submitted';
        if (e.link && e.status === 'not_submitted') e.status = 'received';
        e.reviewNotes = String(src.reviewNotes || '').slice(0, 2000);
        e.submittedAt = src.submittedAt || null;
        e.linkUpdatedAt = src.linkUpdatedAt || null;
        e.statusUpdatedAt = src.statusUpdatedAt || null;
        return e;
      });
      return {
        id, name: base.name, grade: base.grade, section: base.section, gender: base.gender,
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: s.updatedAt || new Date().toISOString(),
        exams,
      };
    });
  }

  function formatDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    try {
      return new Intl.DateTimeFormat('ar-AE', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
        numberingSystem: 'latn',
      }).format(d);
    } catch (e) {
      return d.toISOString().replace('T', ' ').slice(0, 16);
    }
  }

  return {
    SUBJECTS, STATUSES, PLATFORMS, GRADES, GENDERS,
    SUBJECT_MAP, STATUS_MAP, PLATFORM_MAP, GRADE_MAP, GENDER_MAP,
    subjectLabel, statusLabel, gradeLabel, genderLabel, platformLabel, classLabel,
    ValidationError, isValidUrl, normalizeUrl, detectPlatform,
    newExam, validateStudentInput, applyExamPatch,
    parseStudentLines, sameStudent,
    examRows, filterRows, computeStats, sortStudents, validateBackup,
    formatDateTime, normalizeArabic, pct,
  };
});
