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
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
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
    { id: 'tags', href: 'tags.html', ico: 'tag', label: '標籤' },
    { id: 'todo', href: 'todo.html', ico: 'inbox', label: '代辦' },
    { id: 'settings', href: 'settings.html', ico: 'settings', label: '設定' },
    { id: 'account', href: 'settings.html#account', avatar: 'S', label: '帳號' }
  ];
  const pending = M.CLIPS.filter(c => c.status === 'inbox' || c.status === 'analyzing').length;
  return `<nav class="bottom-nav">${items.map(it => {
    const badge = it.id === 'todo' && pending > 0
      ? `<span class="nav-badge">${pending > 99 ? '99+' : pending}</span>` : '';
    const inner = it.avatar ? `<span class="avatar">${it.avatar}</span>` : svg(ICONS[it.ico], 'navico');
    return `<a href="${it.href}" aria-label="${it.label}" class="${active === it.id ? 'active' : ''}">
      <span class="nav-ic-wrap">${inner}${badge}</span>
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

/* ───────── immich 時間軸（含刻度）───────── */
function setupScrubber(groups) {
  const bar = document.getElementById('scrubber');
  const bubble = document.getElementById('scrubber-bubble');
  if (!bar || !bubble) return;

  bar.innerHTML = groups.map((g, i) => {
    const isYearStart = i === 0 || groups[i - 1].label.slice(0, 4) !== g.label.slice(0, 4);
    return `<div class="tick ${isYearStart ? 'year' : ''}" data-key="${g.key}">
      ${isYearStart ? `<span class="lab">${g.label.slice(0, 4)}</span>` : ''}
      <span class="line"></span>
    </div>`;
  }).join('');

  bar.querySelectorAll('.tick').forEach(t => t.addEventListener('click', () => {
    groups.find(x => x.key === t.dataset.key)?.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  let hideTimer = null, barHideTimer = null;
  // 時間軸平時隱藏，拖曳/滑動時才顯現
  function flashBar() {
    bar.classList.add('show');
    clearTimeout(barHideTimer);
    barHideTimer = setTimeout(() => { if (!dragging) bar.classList.remove('show'); }, 1100);
  }
  function showBubble(clientY) {
    let current = groups[0];
    for (const g of groups) if (g.el.getBoundingClientRect().top - 120 <= 0) current = g;
    bubble.textContent = current.label;
    bubble.style.top = clientY + 'px';
    bubble.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bubble.classList.remove('show'), 700);
  }
  window.addEventListener('scroll', () => { flashBar(); showBubble(window.innerHeight * 0.4); }, { passive: true });

  let dragging = false;
  function fromPointer(clientY) {
    const ticks = [...bar.querySelectorAll('.tick')];
    let nearest = ticks[0], best = Infinity;
    for (const t of ticks) {
      const r = t.getBoundingClientRect();
      const d = Math.abs((r.top + r.bottom) / 2 - clientY);
      if (d < best) { best = d; nearest = t; }
    }
    const g = groups.find(x => x.key === nearest.dataset.key);
    if (g) { g.el.scrollIntoView({ block: 'start' }); showBubble(clientY); }
  }
  bar.addEventListener('pointerdown', (e) => { dragging = true; flashBar(); fromPointer(e.clientY); });
  window.addEventListener('pointermove', (e) => { if (dragging) fromPointer(e.clientY); });
  window.addEventListener('pointerup', () => { dragging = false; flashBar(); });
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
    <button class="analyze">AI 分析這段　·　約 30 秒 · L2</button>
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
window.APP = { svg, ICONS, KIND, kindSvg, tagChip, renderNav, bindPress, setupScrubber, top2Tags, openSheet, closeSheet };
