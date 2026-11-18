/* التصدير: Excel و PDF والطباعة */
(function () {
  'use strict';
  const L = window.EPLogic;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stamp = () => new Date().toISOString().slice(0, 10);

  function filterDescription(f) {
    const parts = [];
    if (f.q) parts.push('بحث: ' + f.q);
    if (f.grade) parts.push(L.gradeLabel(f.grade));
    if (f.subject) parts.push(L.subjectLabel(f.subject));
    if (f.status) parts.push(L.statusLabel(f.status));
    if (f.onlyMissing) parts.push('غير المسلمة فقط');
    return parts.length ? parts.join(' — ') : 'جميع الاختبارات';
  }

  function detailRows(rows) {
    return rows.map(({ student, exam }, i) => ({
      n: i + 1,
      name: student.name,
      cls: L.classLabel(student),
      subject: L.subjectLabel(exam.subject),
      platform: L.platformLabel(exam),
      link: exam.link || '',
      status: L.statusLabel(exam.status),
      submitted: L.formatDateTime(exam.submittedAt),
      notes: exam.reviewNotes || '',
    }));
  }

  /* ---------------- Excel ---------------- */
  function buildExcel(rows, ctx) {
    if (!window.XLSX) throw new Error('مكتبة Excel غير محملة.');
    const X = window.XLSX;
    const stats = L.computeStats(rows);
    const wb = X.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };
    wb.Props = { Title: 'تقرير الاختبارات الإلكترونية الاحتياطية', CreatedDate: new Date() };

    // Sheet 1 — details
    const head = ['م', 'اسم الطالب', 'الصف والشعبة', 'المادة', 'المنصة', 'رابط الاختبار', 'حالة الاختبار', 'تاريخ التسليم', 'ملاحظات المراجعة'];
    const det = detailRows(rows);
    const aoa = [
      ['تقرير متابعة الاختبارات الإلكترونية الاحتياطية لطلاب التربية الخاصة'],
      [[ctx.schoolName, ctx.termName].filter(Boolean).join(' — ') || ''],
      ['نطاق التقرير: ' + filterDescription(ctx.filters) + '   |   تاريخ الإصدار: ' + L.formatDateTime(new Date().toISOString())],
      [],
      head,
      ...det.map((r) => [r.n, r.name, r.cls, r.subject, r.platform, r.link, r.status, r.submitted, r.notes]),
    ];
    const ws = X.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 18 }, { wch: 20 }, { wch: 24 }, { wch: 50 }, { wch: 22 }, { wch: 20 }, { wch: 40 }];
    ws['!merges'] = [0, 1, 2].map((r) => ({ s: { r, c: 0 }, e: { r, c: 8 } }));
    ws['!autofilter'] = { ref: X.utils.encode_range({ s: { r: 4, c: 0 }, e: { r: 4 + det.length, c: 8 } }) };
    det.forEach((r, i) => {
      if (!r.link) return;
      const ref = X.utils.encode_cell({ r: 5 + i, c: 5 });
      if (ws[ref]) ws[ref].l = { Target: r.link, Tooltip: 'فتح الاختبار' };
    });
    X.utils.book_append_sheet(wb, ws, 'تفاصيل الاختبارات');

    // Sheet 2 — statistics
    const t = stats.totals;
    const s2 = [
      ['التقرير الإحصائي الإجمالي'],
      ['نطاق التقرير: ' + filterDescription(ctx.filters)],
      [],
      ['المؤشر', 'العدد'],
      ['إجمالي الاختبارات المطلوبة', t.total],
      ['الاختبارات المسلمة', t.delivered],
      ['الاختبارات غير المسلمة', t.not_submitted],
      ['تم استلام الرابط (بانتظار المراجعة)', t.received],
      ['قيد المراجعة', t.under_review],
      ['يحتاج إلى تعديل', t.needs_revision],
      ['معتمد وجاهز للاستخدام', t.approved],
      ['نسبة الإنجاز (التسليم) %', t.deliveryRate],
      ['نسبة الاعتماد %', t.approvalRate],
      [],
    ];
    const groupHead = (title) => [title, 'المطلوبة', 'المسلمة', 'غير المسلمة', 'قيد المراجعة', 'تحتاج تعديل', 'المعتمدة', 'نسبة الإنجاز %'];
    const groupRow = (label, c) => [label, c.total, c.delivered, c.not_submitted, c.under_review, c.needs_revision, c.approved, c.deliveryRate];
    s2.push(['حسب الصف'], groupHead('الصف'), ...stats.byGrade.map((g) => groupRow(g.label, g)), []);
    s2.push(['حسب المادة'], groupHead('المادة'), ...stats.bySubject.map((g) => groupRow(g.label, g)), []);
    s2.push(['حسب الطالب'], groupHead('الطالب'), ...stats.byStudent.map((g) => groupRow(g.student.name + ' (' + L.classLabel(g.student) + ')', g)));
    const ws2 = X.utils.aoa_to_sheet(s2);
    ws2['!cols'] = [{ wch: 38 }, { wch: 11 }, { wch: 11 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 11 }, { wch: 15 }];
    X.utils.book_append_sheet(wb, ws2, 'الإحصائيات');

    const out = X.write(wb, { bookType: 'xlsx', type: 'array', compression: true });
    return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /* ---------------- HTML report (PDF + print) ---------------- */
  const REPORT_CSS = `
    .rpt { direction: rtl; font-family: "IBM Plex Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif; color: #1b2430; background: #fff; width: 1060px; padding: 4px 6px; font-size: 12.5px; line-height: 1.55; }
    .rpt h1 { font-size: 19px; margin: 0; color: #173b5c; }
    .rpt .hdr { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #a8823f; padding-bottom: 8px; margin-bottom: 12px; }
    .rpt .hdr .meta { color: #4f5b6a; font-size: 12px; text-align: left; }
    .rpt h2 { font-size: 14.5px; margin: 16px 0 6px; color: #173b5c; }
    .rpt table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    .rpt th { background: #1f4e79; color: #fff; font-weight: 700; padding: 6px 7px; border: 1px solid #1f4e79; text-align: right; font-size: 12px; }
    .rpt td { padding: 5px 7px; border: 1px solid #d5dae0; vertical-align: top; }
    .rpt tr:nth-child(even) td { background: #f6f8fa; }
    .rpt tr { page-break-inside: avoid; break-inside: avoid; }
    .rpt .num { text-align: center; font-variant-numeric: tabular-nums; }
    .rpt .link { direction: ltr; text-align: left; word-break: break-all; font-size: 10.5px; color: #1d5fae; max-width: 210px; }
    .rpt .kpis { display: flex; gap: 8px; flex-wrap: wrap; }
    .rpt .kpi { flex: 1 1 110px; border: 1px solid #d5dae0; border-radius: 8px; padding: 7px 10px; }
    .rpt .kpi b { display: block; font-size: 19px; color: #173b5c; }
    .rpt .kpi span { color: #4f5b6a; font-size: 11.5px; }
    .rpt .bar { height: 8px; background: #e9edf1; border-radius: 9px; overflow: hidden; min-width: 70px; }
    .rpt .bar i { display: block; height: 100%; background: #0ca30c; }
    .rpt .st { font-weight: 700; white-space: nowrap; }
    .rpt .st-not_submitted { color: #a82a2a; } .rpt .st-received { color: #1d5fae; } .rpt .st-under_review { color: #855c00; }
    .rpt .st-needs_revision { color: #a24a22; } .rpt .st-approved { color: #0b6b0b; }
    .rpt .foot { margin-top: 14px; color: #7a8696; font-size: 11px; border-top: 1px solid #e2e5ea; padding-top: 6px; }
    .rpt .pb { page-break-before: always; break-before: page; }
  `;

  function groupTable(title, list, labelFn) {
    return `<h2>${esc(title)}</h2><table><thead><tr><th>${esc(title.replace('حسب ', ''))}</th><th class="num">المطلوبة</th><th class="num">المسلمة</th><th class="num">غير المسلمة</th><th class="num">قيد المراجعة</th><th class="num">تحتاج تعديل</th><th class="num">المعتمدة</th><th>نسبة الإنجاز</th></tr></thead><tbody>${
      list.map((g) => `<tr><td>${esc(labelFn(g))}</td><td class="num">${g.total}</td><td class="num">${g.delivered}</td><td class="num">${g.not_submitted}</td><td class="num">${g.under_review}</td><td class="num">${g.needs_revision}</td><td class="num">${g.approved}</td><td><div style="display:flex;align-items:center;gap:6px"><div class="bar" style="flex:1"><i style="width:${g.deliveryRate}%"></i></div><span class="num">${g.deliveryRate}%</span></div></td></tr>`).join('')
    }</tbody></table>`;
  }

  function buildReportHTML(rows, ctx, kind) {
    const stats = L.computeStats(rows);
    const t = stats.totals;
    const kpi = (v, l) => `<div class="kpi"><b>${v}</b><span>${esc(l)}</span></div>`;
    let html = `<div class="rpt">
      <div class="hdr"><div><h1>تقرير متابعة الاختبارات الإلكترونية الاحتياطية لطلاب التربية الخاصة</h1>
      <div>${esc([ctx.schoolName, ctx.termName].filter(Boolean).join(' — '))}</div></div>
      <div class="meta">تاريخ الإصدار: ${esc(L.formatDateTime(new Date().toISOString()))}<br>نطاق التقرير: ${esc(filterDescription(ctx.filters))}</div></div>
      <h2>الملخص الإحصائي</h2>
      <div class="kpis">${kpi(t.total, 'إجمالي المطلوبة')}${kpi(t.delivered, 'المسلمة')}${kpi(t.not_submitted, 'غير المسلمة')}${kpi(t.under_review, 'قيد المراجعة')}${kpi(t.needs_revision, 'تحتاج إلى تعديل')}${kpi(t.approved, 'المعتمدة')}${kpi(t.deliveryRate + '%', 'نسبة الإنجاز (التسليم)')}${kpi(t.approvalRate + '%', 'نسبة الاعتماد')}</div>
      ${groupTable('حسب الصف', stats.byGrade, (g) => g.label)}
      ${groupTable('حسب المادة', stats.bySubject, (g) => g.label)}
      ${kind === 'stats' ? groupTable('حسب الطالب', stats.byStudent, (g) => g.student.name + ' — ' + L.classLabel(g.student)) : ''}`;
    if (kind !== 'stats') {
      html += `<h2 class="pb">تفاصيل الاختبارات (${rows.length})</h2><table><thead><tr><th class="num">م</th><th>اسم الطالب</th><th>الصف والشعبة</th><th>المادة</th><th>المنصة</th><th>رابط الاختبار</th><th>الحالة</th><th>تاريخ التسليم</th><th>ملاحظات المراجعة</th></tr></thead><tbody>${
        rows.map(({ student, exam }, i) => `<tr><td class="num">${i + 1}</td><td>${esc(student.name)}</td><td class="nowrap">${esc(L.classLabel(student))}</td><td>${esc(L.subjectLabel(exam.subject))}</td><td>${esc(L.platformLabel(exam))}</td><td class="link">${esc(exam.link || '—')}</td><td class="st st-${exam.status}">${esc(L.statusLabel(exam.status))}</td><td class="num">${esc(L.formatDateTime(exam.submittedAt) || '—')}</td><td>${esc(exam.reviewNotes)}</td></tr>`).join('')
      }</tbody></table>`;
    }
    html += `<div class="foot">صادر من منصة متابعة الاختبارات الإلكترونية الاحتياطية لطلاب التربية الخاصة.</div></div>`;
    return html;
  }

  /*
   * PDF: each A4 page is drawn on a <canvas> with the browser's own text engine
   * (correct Arabic letter joining and RTL/LTR mixing), then placed in a PDF with jsPDF.
   */
  const PW = 1123, PH = 794, M = 34, SCALE = 2; // A4 landscape at 96 dpi
  const COL = { navy: '#173b5c', head: '#1f4e79', gold: '#a8823f', text: '#1b2430', muted: '#5f6b7a', line: '#d5dae0', zebra: '#f6f8fa', bar: '#e9edf1' };
  const ST_TEXT = { not_submitted: '#a82a2a', received: '#1d5fae', under_review: '#855c00', needs_revision: '#a24a22', approved: '#0b6b0b' };

  async function pdfFont() {
    const fam = getComputedStyle(document.body).fontFamily || 'Tahoma, Arial, sans-serif';
    try {
      if (document.fonts) {
        await Promise.all([document.fonts.load('400 14px ' + fam, 'أبج'), document.fonts.load('700 14px ' + fam, 'أبج')]);
      }
    } catch (e) { /* fall back to system fonts */ }
    return fam;
  }

  function Painter(fam) {
    const pages = [];
    let c, g, y;
    const font = (size, bold) => { g.font = `${bold ? 700 : 400} ${size}px ${fam}`; };
    function newPage() {
      c = document.createElement('canvas');
      c.width = PW * SCALE;
      c.height = PH * SCALE;
      g = c.getContext('2d');
      g.scale(SCALE, SCALE);
      g.fillStyle = '#fff';
      g.fillRect(0, 0, PW, PH);
      g.textBaseline = 'top';
      pages.push(c);
      y = M;
    }
    // Text with explicit direction. x is the right edge for rtl, left edge for ltr; align 'center' uses x as centre.
    function text(str, x, yy, opt) {
      opt = opt || {};
      font(opt.size || 12, opt.bold);
      g.fillStyle = opt.color || COL.text;
      g.direction = opt.dir || 'rtl';
      g.textAlign = opt.align || (opt.dir === 'ltr' ? 'left' : 'right');
      g.fillText(String(str), x, yy);
    }
    // Wrap text into lines that fit width (by words; very long words such as links are split by characters).
    function wrap(str, width, size, bold) {
      font(size, bold);
      const out = [];
      for (const para of String(str == null ? '' : str).split('\n')) {
        let line = '';
        for (const word of para.split(/\s+/).filter(Boolean)) {
          const cand = line ? line + ' ' + word : word;
          if (g.measureText(cand).width <= width) { line = cand; continue; }
          if (line) out.push(line);
          if (g.measureText(word).width <= width) { line = word; continue; }
          let part = '';
          for (const ch of word) {
            if (g.measureText(part + ch).width > width && part) { out.push(part); part = ''; }
            part += ch;
          }
          line = part;
        }
        out.push(line);
      }
      return out.length ? out : [''];
    }
    const space = (h) => { if (y + h > PH - M - 18) { newPage(); return true; } return false; };
    newPage();
    return {
      pages, text, wrap, space, g: () => g,
      get y() { return y; }, set y(v) { y = v; },
      rect(x, yy, w, h, fill, stroke) {
        if (fill) { g.fillStyle = fill; g.fillRect(x, yy, w, h); }
        if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.strokeRect(x + 0.5, yy + 0.5, w - 1, h - 1); }
      },
      rounded(x, yy, w, h, r, fill, stroke) {
        g.beginPath();
        g.roundRect ? g.roundRect(x, yy, w, h, r) : g.rect(x, yy, w, h);
        if (fill) { g.fillStyle = fill; g.fill(); }
        if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); }
      },
    };
  }

  /* columns: [{ title, w (fraction), align: 'right'|'center'|'ltr', key, type: 'bar'|'status' }] — laid out right-to-left */
  function drawTable(P, columns, data) {
    const width = PW - 2 * M;
    const pad = 6;
    const size = 11.5;
    const lineH = 16;
    const xs = [];
    let right = PW - M;
    for (const col of columns) {
      const w = col.w * width;
      xs.push({ right, left: right - w, w });
      right -= w;
    }
    const header = () => {
      const lines = columns.map((col, i) => P.wrap(col.title, xs[i].w - 2 * pad, size, true));
      const h = Math.max(...lines.map((l) => l.length)) * lineH + 2 * pad;
      P.space(h + lineH + 2 * pad);
      columns.forEach((col, i) => {
        P.rect(xs[i].left, P.y, xs[i].w, h, COL.head, COL.head);
        lines[i].forEach((ln, k) => {
          if (col.align === 'center' || col.type === 'bar') P.text(ln, xs[i].left + xs[i].w / 2, P.y + pad + k * lineH, { size, bold: true, color: '#fff', align: 'center' });
          else P.text(ln, xs[i].right - pad, P.y + pad + k * lineH, { size, bold: true, color: '#fff' });
        });
      });
      P.y += h;
    };
    header();
    data.forEach((row, r) => {
      const cells = columns.map((col, i) => (col.type === 'bar' ? [''] : P.wrap(row[col.key], xs[i].w - 2 * pad, col.align === 'ltr' ? 10.5 : size, col.type === 'status')));
      const h = Math.max(...cells.map((l) => l.length)) * lineH + 2 * pad - 2;
      if (P.space(h)) header();
      columns.forEach((col, i) => {
        const x = xs[i];
        P.rect(x.left, P.y, x.w, h, r % 2 ? COL.zebra : '#fff', COL.line);
        if (col.type === 'bar') {
          const v = Number(row[col.key]) || 0;
          const label = v + '%';
          const bw = x.w - 2 * pad - 46;
          P.rounded(x.left + pad + 46, P.y + h / 2 - 4, bw, 8, 4, COL.bar);
          if (v > 0) P.rounded(x.left + pad + 46 + bw * (1 - v / 100), P.y + h / 2 - 4, bw * v / 100, 8, 4, '#0ca30c');
          P.text(label, x.left + pad, P.y + h / 2 - 7, { size: 11, dir: 'ltr' });
          return;
        }
        cells[i].forEach((ln, k) => {
          const ty = P.y + pad + k * lineH;
          const color = col.type === 'status' ? ST_TEXT[row.statusKey] : (col.align === 'ltr' ? '#1d5fae' : COL.text);
          if (col.align === 'center') P.text(ln, x.left + x.w / 2, ty, { size, color, align: 'center' });
          else if (col.align === 'ltr') P.text(ln, x.left + pad, ty + 1, { size: 10.5, color, dir: 'ltr' });
          else P.text(ln, x.right - pad, ty, { size, color, bold: col.type === 'status' });
        });
      });
      P.y += h;
    });
    P.y += 10;
  }

  function sectionTitle(P, title) {
    P.space(60);
    P.text(title, PW - M, P.y, { size: 15, bold: true, color: COL.navy });
    P.y += 26;
  }

  async function buildPdf(rows, ctx, kind) {
    const JS = window.jspdf && window.jspdf.jsPDF;
    if (!JS) throw new Error('مكتبة PDF غير محملة.');
    const fam = await pdfFont();
    const P = Painter(fam);
    const stats = L.computeStats(rows);
    const t = stats.totals;
    const issued = L.formatDateTime(new Date().toISOString());

    // Header
    P.text('تقرير متابعة الاختبارات الإلكترونية الاحتياطية لطلاب التربية الخاصة', PW - M, P.y, { size: 20, bold: true, color: COL.navy });
    const sub = [ctx.schoolName, ctx.termName].filter(Boolean).join(' — ');
    if (sub) P.text(sub, PW - M, P.y + 32, { size: 13, color: COL.muted });
    P.text('تاريخ الإصدار: ' + issued, M, P.y + 4, { size: 11.5, color: COL.muted, align: 'left' });
    P.text('نطاق التقرير: ' + filterDescription(ctx.filters), M, P.y + 24, { size: 11.5, color: COL.muted, align: 'left' });
    P.y += sub ? 58 : 50;
    P.rect(M, P.y, PW - 2 * M, 3, COL.gold);
    P.y += 16;

    // KPI boxes
    sectionTitle(P, kind === 'stats' ? 'التقرير الإحصائي الإجمالي' : 'الملخص الإحصائي');
    const kp = [[t.total, 'إجمالي المطلوبة'], [t.delivered, 'المسلمة'], [t.not_submitted, 'غير المسلمة'], [t.under_review, 'قيد المراجعة'],
      [t.needs_revision, 'تحتاج إلى تعديل'], [t.approved, 'المعتمدة'], [t.deliveryRate + '%', 'نسبة الإنجاز (التسليم)'], [t.approvalRate + '%', 'نسبة الاعتماد']];
    const gap = 8;
    const bw = (PW - 2 * M - gap * (kp.length - 1)) / kp.length;
    kp.forEach(([v, l], i) => {
      const x = PW - M - (i + 1) * bw - i * gap;
      P.rounded(x, P.y, bw, 58, 8, '#fff', COL.line);
      P.text(String(v), x + bw - 10, P.y + 7, { size: 21, bold: true, color: COL.navy, dir: 'rtl' });
      P.text(l, x + bw - 10, P.y + 36, { size: 11, color: COL.muted });
    });
    P.y += 74;

    const groupCols = (title) => [
      { title, w: 0.22, key: 'label' }, { title: 'المطلوبة', w: 0.09, key: 'total', align: 'center' },
      { title: 'المسلمة', w: 0.09, key: 'delivered', align: 'center' }, { title: 'غير المسلمة', w: 0.1, key: 'not_submitted', align: 'center' },
      { title: 'قيد المراجعة', w: 0.1, key: 'under_review', align: 'center' }, { title: 'تحتاج تعديل', w: 0.1, key: 'needs_revision', align: 'center' },
      { title: 'المعتمدة', w: 0.09, key: 'approved', align: 'center' }, { title: 'نسبة الإنجاز', w: 0.21, key: 'deliveryRate', type: 'bar' },
    ];
    sectionTitle(P, 'حسب الصف');
    drawTable(P, groupCols('الصف'), stats.byGrade);
    sectionTitle(P, 'حسب المادة');
    drawTable(P, groupCols('المادة'), stats.bySubject);
    if (kind === 'stats') {
      sectionTitle(P, 'حسب الطالب');
      drawTable(P, groupCols('الطالب'), stats.byStudent.map((g) => Object.assign({}, g, { label: g.student.name + ' — ' + L.classLabel(g.student) })));
      sectionTitle(P, 'حسب حالة الاختبار');
      drawTable(P, [{ title: 'الحالة', w: 0.5, key: 'label' }, { title: 'العدد', w: 0.25, key: 'count', align: 'center' }, { title: 'النسبة من المطلوب', w: 0.25, key: 'pct', align: 'center' }],
        stats.byStatus.map((s) => ({ label: s.label, count: s.count, pct: L.pct(s.count, t.total) + '%' })));
    } else {
      P.space(PH); // details start on a new page
      sectionTitle(P, `تفاصيل الاختبارات (${rows.length})`);
      drawTable(P, [
        { title: 'م', w: 0.035, key: 'n', align: 'center' }, { title: 'اسم الطالب', w: 0.13, key: 'name' },
        { title: 'الصف والشعبة', w: 0.09, key: 'cls' }, { title: 'المادة', w: 0.095, key: 'subject' },
        { title: 'المنصة', w: 0.105, key: 'platform' }, { title: 'رابط الاختبار', w: 0.19, key: 'link', align: 'ltr' },
        { title: 'الحالة', w: 0.11, key: 'status', type: 'status' }, { title: 'تاريخ التسليم', w: 0.095, key: 'submitted', align: 'center' },
        { title: 'ملاحظات المراجعة', w: 0.15, key: 'notes' },
      ], detailRows(rows).map((r, i) => Object.assign(r, { statusKey: rows[i].exam.status, link: r.link || '—', submitted: r.submitted || '—', platform: r.platform || '—' })));
    }

    // Footers
    const n = P.pages.length;
    P.pages.forEach((cv, i) => {
      const g = cv.getContext('2d');
      g.save();
      g.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      g.fillStyle = COL.line;
      g.fillRect(M, PH - M + 2, PW - 2 * M, 1);
      g.font = `400 10.5px ${fam}`;
      g.fillStyle = COL.muted;
      g.textBaseline = 'top';
      g.direction = 'rtl';
      g.textAlign = 'right';
      g.fillText('منصة متابعة الاختبارات الإلكترونية الاحتياطية لطلاب التربية الخاصة', PW - M, PH - M + 9);
      g.textAlign = 'left';
      g.fillText(`صفحة ${i + 1} من ${n}`, M, PH - M + 9);
      g.restore();
    });

    const pdf = new JS({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    P.pages.forEach((cv, i) => {
      if (i) pdf.addPage('a4', 'landscape');
      pdf.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
    });
    pdf.setProperties({ title: 'تقرير الاختبارات الإلكترونية الاحتياطية' });
    return pdf.output('blob');
  }

  function printReport(rows, ctx, kind) {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;left:0;bottom:0;';
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    doc.open();
    doc.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير الاختبارات</title>
      <style>@page { size: A4 landscape; margin: 10mm; } body { margin: 0; } ${REPORT_CSS} .rpt { width: auto; }</style></head>
      <body>${buildReportHTML(rows, ctx, kind)}</body></html>`);
    doc.close();
    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => frame.remove(), 2000);
    }, 300);
  }

  function backupBlob(payload) {
    return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  }

  window.EPExports = { buildExcel, buildPdf, printReport, buildReportHTML, backupBlob, stamp, filterDescription };
})();
