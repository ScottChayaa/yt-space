// YouTube storyboard sprite 解碼（mockup 版，對應 src/lib/storyboard.ts）
// spec 字串來自 watch page 的 playerStoryboardSpecRenderer，mockup 直接寫死在 mock-data.js。
// 正式版由後端抓取並把 sprite 轉存 R2；此處為驗證 UI 呈現，直接連 i.ytimg.com。

function parseStoryboardSpec(spec) {
  if (!spec) return null;
  const parts = spec.split('|');
  if (parts.length < 2) return null;

  const urlPart = parts[0];
  if (!urlPart.startsWith('http')) return null;

  const sqpMatch = urlPart.match(/[?&]sqp=([^&]*)/);
  const baseUrl = urlPart.split('?')[0];

  const levels = [];
  parts.slice(1).forEach((p, i) => {
    const f = p.split('#');
    if (f.length < 8) return;
    const [width, height, frameCount, cols, rows, intervalMs] = f.slice(0, 6).map(Number);
    if ([width, height, frameCount, cols, rows, intervalMs].some(Number.isNaN)) return;
    levels.push({ level: i, width, height, frameCount, cols, rows, intervalMs, sigh: f[7] });
  });

  if (levels.length === 0) return null;
  return { baseUrl, sqp: sqpMatch ? sqpMatch[1] : '', levels };
}

function pickLevel(spec, preferred = 3) {
  const usable = spec.levels.filter(
    (l) => l.intervalMs > 0 && l.cols > 0 && l.rows > 0 && l.frameCount > 0
  );
  if (usable.length === 0) return null;
  return usable.find((l) => l.level === preferred) || usable[usable.length - 1];
}

function frameAt(level, t) {
  const perSheet = level.cols * level.rows;
  const raw = Math.floor(Math.max(0, t) / (level.intervalMs / 1000));
  const frameIndex = Math.max(0, Math.min(raw, level.frameCount - 1));
  const sheetIndex = Math.floor(frameIndex / perSheet);
  const posInSheet = frameIndex % perSheet;
  return { sheetIndex, col: posInSheet % level.cols, row: Math.floor(posInSheet / level.cols) };
}

function sheetUrl(spec, level, sheetIndex) {
  const path = spec.baseUrl.replace('$L', String(level.level)).replace('$N', `M${sheetIndex}`);
  return `${path}?sqp=${spec.sqp}&sigh=${level.sigh}`;
}

// 回傳可直接塞進 style 屬性的字串。用百分比定位，因此與元素實際尺寸無關，
// 任何 16:9 容器都能直接套用（效果等同 object-fit: cover）。
function frameStyle(spec, t) {
  const parsed = typeof spec === 'string' ? parseStoryboardSpec(spec) : spec;
  if (!parsed) return null;
  const level = pickLevel(parsed);
  if (!level) return null;
  const pos = frameAt(level, t);
  const px = level.cols > 1 ? (pos.col / (level.cols - 1)) * 100 : 0;
  const py = level.rows > 1 ? (pos.row / (level.rows - 1)) * 100 : 0;
  return [
    `background-image:url('${sheetUrl(parsed, level, pos.sheetIndex)}')`,
    `background-size:${level.cols * 100}% ${level.rows * 100}%`,
    `background-position:${px.toFixed(4)}% ${py.toFixed(4)}%`
  ].join(';');
}

window.SB = { parseStoryboardSpec, pickLevel, frameAt, sheetUrl, frameStyle };
