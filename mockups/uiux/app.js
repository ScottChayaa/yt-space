// yt-space mockup — 共用互動 + SVG icon 系統
const M = window.MOCK;

/* ───────── SVG icon（Lucide 風格，無 emoji）───────── */
function svg(inner, cls = 'ic', filled = false) {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="${filled ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  play: '<path d="M6 3 20 12 6 21Z"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  record: '<circle cx="12" cy="12" r="6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  folderPlus: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="M12 10v6"/><path d="M9 13h6"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  imagePlus: '<path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>'
};
// 標籤分類 icon（保留分類意義，改用 SVG + 顏色編碼）
const KIND = {
  person: { icon: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', color: '#6366F1', label: '人物' },
  place:  { icon: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>', color: '#0EA5E9', label: '地點' },
  topic:  { icon: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>', color: '#8B5CF6', label: '主題' },
  pet:    { icon: '<circle cx="6" cy="13" r="1.6"/><circle cx="9.5" cy="8.5" r="1.6"/><circle cx="14.5" cy="8.5" r="1.6"/><circle cx="18" cy="13" r="1.6"/><path d="M12 13.5c-2.3 0-4 1.9-4 3.8A2.2 2.2 0 0 0 10.2 19c.8 0 1.1-.4 1.8-.4s1 .4 1.8.4A2.2 2.2 0 0 0 16 17.3c0-1.9-1.7-3.8-4-3.8z"/>', color: '#F59E0B', label: '寵物' },
  other:  { icon: '<path d="M12 3 21 12 12 21 3 12z"/>', color: '#64748B', label: '其他' }
};
function kindSvg(kind) {
  const k = KIND[kind] || KIND.other;
  return `<svg class="kico" style="color:${k.color}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${k.icon}</svg>`;
}

/* 標籤 chip HTML（統一產生器）；plainHash: 一律用中性 # icon（首頁縮圖標籤）*/
function tagChip(tag, opts = {}) {
  const cls = ['chip', 'mini', opts.selected ? 'sel' : '', tag.source === 'ai' ? 'ai' : ''].join(' ').trim();
  const count = opts.count != null ? `<span class="n">${opts.count}</span>` : '';
  const icon = opts.plainHash
    ? `<svg class="kico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${KIND.topic.icon}</svg>`
    : kindSvg(tag.kind);
  return `<span class="${cls}" data-name="${tag.name}">${icon}<span class="cn">${tag.name}</span>${count}</span>`;
}

/* ───────── 底部導覽（5 項，SVG icon）───────── */
function renderNav(active) {
  const items = [
    { id: 'home', href: 'home.html', ico: 'home', label: '首頁' },
    { id: 'tags', href: 'tags.html', ico: 'search', label: '查詢' },
    { id: 'capture', href: 'capture.html', ico: 'plus', label: '取圖', cls: 'capture' },
    { id: 'folders', href: 'folders.html', ico: 'folder', label: '分類' },
    { id: 'account', href: 'account.html', avatar: 'S', label: '帳號' }
  ];
  return `<nav class="bottom-nav">${items.map(it => {
    const inner = it.avatar ? `<span class="avatar">${it.avatar}</span>` : svg(ICONS[it.ico], 'navico');
    return `<a href="${it.href}" aria-label="${it.label}" class="${[it.cls || '', active === it.id ? 'active' : ''].join(' ').trim()}">
      <span class="nav-ic-wrap">${inner}</span>
    </a>`;
  }).join('')}</nav>`;
}

/* ───────── 長按偵測（點=tap，長按=hold）───────── */
function bindPress(el, { onTap, onHold, delay = 450 }) {
  let timer = null, held = false, sx = 0, sy = 0;
  el.addEventListener('pointerdown', (e) => {
    held = false; sx = e.clientX; sy = e.clientY;
    timer = setTimeout(() => { held = true; navigator.vibrate?.(15); onHold?.(); }, delay);
  });
  const cancel = () => clearTimeout(timer);
  el.addEventListener('pointermove', (e) => { if (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10) cancel(); });
  el.addEventListener('pointerup', () => { cancel(); if (!held) onTap?.(); });
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('pointerleave', cancel);
}

/* 首頁 tile 用：取 top 2 標籤（human 優先，place/person 優先）*/
function top2Tags(clip) {
  const order = { place: 0, person: 1, topic: 2, pet: 3, other: 4 };
  return [...clip.tags]
    .sort((a, b) => (a.source === 'ai') - (b.source === 'ai') || order[a.kind] - order[b.kind])
    .slice(0, 2);
}

/* ───────── 底部編輯 sheet ───────── */
function openSheet(clip) {
  const v = M.videoOf(clip);
  let bd = document.getElementById('sheet-backdrop');
  if (!bd) {
    bd = document.createElement('div'); bd.id = 'sheet-backdrop'; bd.className = 'sheet-backdrop';
    const sh = document.createElement('div'); sh.id = 'sheet'; sh.className = 'sheet';
    document.body.append(bd, sh);
    bd.addEventListener('click', closeSheet);
  }
  const sh = document.getElementById('sheet');
  const tagChips = clip.tags.length
    ? clip.tags.map(t => tagChip(t)).join('')
    : '<span style="color:var(--text-dim);font-size:.85rem">尚無標籤</span>';
  const dateWarn = clip.eventDate.slice(0, 7) !== (v.publishedAt || '').slice(0, 7);
  sh.innerHTML = `
    <div class="handle"></div>
    <div class="srow">
      <span class="trange">${M.fmtTime(clip.start)} – ${M.fmtTime(clip.end)}</span>
      <button class="close" onclick="closeSheet()">${svg(ICONS.close, 'ic')}</button>
    </div>
    <div class="adj"><span class="lab">起</span><div class="btns"><button>設為目前</button><button>−5s</button><button>+5s</button></div></div>
    <div class="adj"><span class="lab">迄</span><div class="btns"><button>設為目前</button><button>−5s</button><button>+5s</button></div></div>
    <div class="field"><label>備註</label><textarea rows="2">${clip.note || ''}</textarea></div>
    <button class="analyze">AI 分析這段　·　約 30 秒 · 區間分析</button>
    <div class="field"><label>摘要</label><textarea rows="2">${clip.summary || ''}</textarea></div>
    <div class="field"><label>標籤（虛線 = AI 待確認）</label><div class="chips">${tagChips}</div></div>
    <div class="field"><label>事件日期</label><input type="date" value="${clip.eventDate}">
      ${dateWarn ? '<div class="warn-line">⚠ 與上傳日不同（事件發生日）</div>' : ''}</div>
    <button class="confirm" onclick="closeSheet()">✓ 確認</button>
  `;
  requestAnimationFrame(() => { bd.classList.add('show'); sh.classList.add('show'); });
}
function closeSheet() {
  document.getElementById('sheet-backdrop')?.classList.remove('show');
  document.getElementById('sheet')?.classList.remove('show');
}
window.openSheet = openSheet; window.closeSheet = closeSheet;

/* ───────── 共用月份選擇器（單擊即選，年份/月份皆為 desc）─────────
   opts: { value:'YYYY-MM'|'', title, onPick(v), onClear() } */
const monthLabel = s => { const [y, m] = s.split('-'); return `${y}年${+m}月`; };

function ensureMonthPicker() {
  let bd = document.getElementById('mpBackdrop');
  if (bd) return;
  bd = document.createElement('div'); bd.id = 'mpBackdrop'; bd.className = 'dp-backdrop';
  const panel = document.createElement('div'); panel.id = 'mpPanel'; panel.className = 'dp-panel';
  panel.innerHTML = `<div class="handle"></div>
    <div class="dp-head" id="mpHead"><span id="mpTitle"></span><button class="dp-clear" id="mpClear">清除</button></div>
    <div class="dp-years" id="mpYears"></div>`;
  document.body.append(bd, panel);
  bd.addEventListener('click', closeMonthPicker);
}
function closeMonthPicker() {
  document.getElementById('mpBackdrop')?.classList.remove('show');
  document.getElementById('mpPanel')?.classList.remove('show');
}
function openMonthPicker(opts = {}) {
  ensureMonthPicker();
  const { value = '', title = '', onPick, onClear } = opts;   // title / onClear 都沒給 → 整條標題列隱藏
  // 資料涵蓋年份（以 reviewed clip 為準）
  const months = M.CLIPS.map(c => c.eventDate.slice(0, 7));
  // 年份範圍取資料涵蓋區間，並確保目前選定的月份一定在清單內
  const vY = value ? +value.slice(0, 4) : null;
  const minY = Math.min(+months.reduce((a, b) => a < b ? a : b).slice(0, 4), vY ?? Infinity);
  const maxY = Math.max(+months.reduce((a, b) => a > b ? a : b).slice(0, 4), vY ?? -Infinity);
  // 有資料的月份（無資料者淡化但仍可點）
  const has = new Set(months);

  document.getElementById('mpHead').style.display = (title || onClear) ? '' : 'none';
  document.getElementById('mpTitle').textContent = title;
  document.getElementById('mpClear').style.display = onClear ? '' : 'none';
  const yearsEl = document.getElementById('mpYears');
  yearsEl.innerHTML = '';
  for (let y = maxY; y >= minY; y--) {           // 年份 desc
    const sec = document.createElement('div'); sec.className = 'dp-year';
    sec.innerHTML = `<h4>${y}年</h4><div class="dp-grid"></div>`;
    const grid = sec.querySelector('.dp-grid');
    for (let mo = 12; mo >= 1; mo--) {           // 月份 desc
      const key = `${y}-${String(mo).padStart(2, '0')}`;
      const b = document.createElement('button');
      b.className = 'dp-month' + (key === value ? ' sel' : '') + (has.has(key) ? '' : ' dim');
      b.textContent = mo + '月';
      b.onclick = () => { closeMonthPicker(); onPick?.(key); };   // 單擊即完成
      grid.appendChild(b);
    }
    yearsEl.appendChild(sec);
  }
  document.getElementById('mpClear').onclick = () => { closeMonthPicker(); onClear?.(); };
  document.getElementById('mpBackdrop').classList.add('show');
  document.getElementById('mpPanel').classList.add('show');
  yearsEl.querySelector('.dp-month.sel')?.scrollIntoView({ block: 'center' });
}

window.APP = { svg, ICONS, KIND, kindSvg, tagChip, renderNav, bindPress, top2Tags, openSheet, closeSheet, openMonthPicker, closeMonthPicker, monthLabel };

/* ═══════════ Shot 版共用元件（2026-08-28）═══════════ */

/* 簡易 toast */
function toast(text, ms = 2200) {
  let el = document.getElementById('app-toast');
  if (!el) { el = document.createElement('div'); el.id = 'app-toast'; el.className = 'wz-toast'; document.body.appendChild(el); }
  el.innerHTML = `<span>${text}</span>`;
  el.style.display = 'flex';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.style.display = 'none'; }, ms);
}

/* 泛用底部 sheet（沿用 .sheet 樣式） */
function openPanel(html) {
  let bd = document.getElementById('sheet-backdrop');
  if (!bd) {
    bd = document.createElement('div'); bd.id = 'sheet-backdrop'; bd.className = 'sheet-backdrop';
    const sh = document.createElement('div'); sh.id = 'sheet'; sh.className = 'sheet';
    document.body.append(bd, sh);
    bd.addEventListener('click', closeSheet);
  }
  const sh = document.getElementById('sheet');
  sh.innerHTML = `<div class="handle"></div>` + html;
  requestAnimationFrame(() => { bd.classList.add('show'); sh.classList.add('show'); });
  return sh;
}

/* ── shot 就地編輯（描述／地點／標籤／時間）── */
function openShotSheet(shot, onSave) {
  const v = M.videoOf(shot);
  const sh = openPanel(`
    <div class="srow">
      <span class="trange">${M.fmtTime(shot.start)} ・ 《${v.title.slice(0, 16)}…》</span>
      <button class="close" onclick="closeSheet()">${svg(ICONS.close, 'ic')}</button>
    </div>
    <div class="field"><label>描述（可留空，之後 AI 補）</label><textarea id="es-desc" rows="2">${shot.summary || ''}</textarea></div>
    <div class="field"><label>地點</label><input id="es-place" type="text" value="${shot.place || ''}" placeholder="例：宜蘭"></div>
    <div class="field"><label>標籤（逗號分隔）</label><input id="es-tags" type="text" value="${shot.tags.map(t => t.name).join('、')}"></div>
    <div class="field"><label>時間（事件發生日）</label><input id="es-date" type="date" value="${shot.eventDate}">
      <div class="warn-line">⚠ 預設帶入 YT 日期，可能不是實際拍攝日</div></div>
    <button class="confirm" id="es-save">✓ 儲存</button>
  `);
  sh.querySelector('#es-save').onclick = () => {
    shot.summary = sh.querySelector('#es-desc').value.trim();
    shot.place = sh.querySelector('#es-place').value.trim();
    shot.eventDate = sh.querySelector('#es-date').value || shot.eventDate;
    const names = sh.querySelector('#es-tags').value.split(/[、,，]/).map(x => x.trim()).filter(Boolean);
    shot.tags = names.map(n => shot.tags.find(t => t.name === n) || { name: n, kind: 'topic', source: 'human' });
    closeSheet(); toast('已儲存'); onSave?.();
  };
}

/* ── 加入分類（資料夾樹勾選）── */
function openFolderPicker(shot, onChange) {
  function render() {
    const rows = [];
    (function walk(parent, depth) {
      for (const f of M.folderChildren(parent)) {
        const on = (M.FOLDER_SHOTS[f.id] || new Set()).has(shot.id);
        rows.push(`<div class="fp-row ${depth ? 'child' + (depth > 1 ? '2' : '') : ''} ${on ? 'on' : ''}" data-id="${f.id}">
          ${svg(ICONS.folder, 'ic')}<span class="name">${f.name}</span><span class="box">${on ? '✓' : ''}</span></div>`);
        walk(f.id, depth + 1);
      }
    })(null, 0);
    const sh = openPanel(`
      <div class="srow"><span class="trange">加入分類</span>
        <button class="close" onclick="closeSheet()">${svg(ICONS.close, 'ic')}</button></div>
      ${rows.join('') || '<div class="empty">還沒有任何資料夾</div>'}
      <button class="fd-add" id="fp-add" style="margin-top:12px">${svg(ICONS.folderPlus, 'ic')} 新增資料夾</button>
    `);
    sh.querySelectorAll('.fp-row').forEach(row => row.onclick = () => {
      const set = M.FOLDER_SHOTS[row.dataset.id];
      set.has(shot.id) ? set.delete(shot.id) : set.add(shot.id);
      render(); onChange?.();
    });
    sh.querySelector('#fp-add').onclick = () => {
      const name = prompt('資料夾名稱？');
      if (name) { M.addFolder(name.trim(), null); render(); }
    };
  }
  render();
}

/* ── Lightbox 全屏檢視器 ──
   list: shot 陣列（左右滑動範圍）；idx: 起點；opts.onChange: 內容變動時通知頁面重繪 */
function openLightbox(list, idx, opts = {}) {
  let lb = document.getElementById('lb');
  if (!lb) { lb = document.createElement('div'); lb.id = 'lb'; lb.className = 'lb'; document.body.appendChild(lb); }
  let i = idx;

  function close() { lb.classList.remove('show'); opts.onChange?.(); }

  function render() {
    if (!list.length) return close();
    i = Math.max(0, Math.min(i, list.length - 1));
    const s = list[i], v = M.videoOf(s);
    const placeChip = s.place
      ? `<span class="chip mini">${kindSvg('place')}<span class="cn">${s.place}</span></span>` : '';
    lb.innerHTML = `
      <div class="lb-top">
        <button id="lb-close">${svg(ICONS.close, 'ic')}</button>
        <span style="font-size:.8rem;color:rgba(255,255,255,.75)">${M.fmtDateLabel(s.eventDate)}</span>
        <span style="width:32px"></span>
      </div>
      <div class="lb-stage" id="lb-stage">
        <div class="lb-img" style="${M.thumbStyle(s.videoId, s.start)}"></div>
        ${list.length > 1 ? `<button class="lb-nav prev" id="lb-prev">${svg(ICONS.back, 'ic')}</button>
        <button class="lb-nav next" id="lb-next">${svg(ICONS.chevronRight, 'ic')}</button>` : ''}
      </div>
      <div class="lb-info">
        <div class="d ${s.summary ? '' : 'dim'}">${s.summary || '（沒有描述，之後可由 AI 補）'}</div>
        <div class="chips">${placeChip}${s.tags.map(t => tagChip(t)).join('')}</div>
        <div class="meta"><span class="vt">《${v.title.slice(0, 22)}…》</span><span class="at">${M.fmtTime(s.start)}</span></div>
      </div>
      <div class="lb-actions">
        <button class="primary" id="lb-play">${svg(ICONS.play, 'ic')} 影片播放</button>
        <button id="lb-folder">${svg(ICONS.folderPlus, 'ic')} 加入分類</button>
        <button id="lb-share">${svg(ICONS.share, 'ic')} 分享</button>
        <button id="lb-edit">${svg(ICONS.edit, 'ic')} 編輯</button>
        <button class="danger" id="lb-del">${svg(ICONS.trash, 'ic')} 刪除</button>
      </div>`;
    lb.querySelector('#lb-close').onclick = close;
    lb.querySelector('#lb-prev') && (lb.querySelector('#lb-prev').onclick = () => { i--; render(); });
    lb.querySelector('#lb-next') && (lb.querySelector('#lb-next').onclick = () => { i++; render(); });
    lb.querySelector('#lb-play').onclick = () => location.href = `detail.html?v=${s.videoId}&c=${s.id}`;
    lb.querySelector('#lb-folder').onclick = () => openFolderPicker(s);
    lb.querySelector('#lb-edit').onclick = () => openShotSheet(s, render);
    lb.querySelector('#lb-share').onclick = async () => {
      const url = `https://youtu.be/${M.realId ? M.realId(s.videoId) : s.videoId}?t=${s.start}`;
      if (navigator.share) { try { await navigator.share({ url }); } catch {} }
      else { try { await navigator.clipboard.writeText(url); } catch {} toast('已複製連結：' + url); }
    };
    lb.querySelector('#lb-del').onclick = () => {
      if (!confirm('刪除這張收藏？（YouTube 原片不受影響）')) return;
      M.removeClip(s.id); list.splice(i, 1); toast('已刪除');
      list.length ? render() : close();
    };
    // 左右滑動
    let sx = null;
    const stage = lb.querySelector('#lb-stage');
    stage.onpointerdown = e => { sx = e.clientX; };
    stage.onpointerup = e => {
      if (sx == null) return;
      const dx = e.clientX - sx; sx = null;
      if (dx > 48 && i > 0) { i--; render(); }
      else if (dx < -48 && i < list.length - 1) { i++; render(); }
    };
  }
  render();
  lb.classList.add('show');
}

Object.assign(window.APP, { toast, openPanel, openShotSheet, openFolderPicker, openLightbox });
