// yt-space mockup 假資料
// 3 個真實頻道，各 5 筆 clip，時間錯開不同月份（測時間軸）。
// videoId / 標題 為真實抓取；縮圖用 img.youtube.com。clip 細節為造假展示用。

const CHANNELS = {
  meow: '喵遊記',
  yao: '十三要和拳頭',
  okge: 'OK哥環球探海記'
};

// 影片（部分影片含多個 clip，供詳細頁展示）
const VIDEOS = {
  // 喵遊記
  Pe226YsYVWk: { id: 'Pe226YsYVWk', channel: 'meow', title: '廣西柳州24小時7家店，108元第一螺螄鴨腳煲 VS 210元深夜大排檔', duration: 1024 },
  r4YnYow7L_4: { id: 'r4YnYow7L-4', channel: 'meow', title: '廣西街頭最火爆7種米粉，3.5元卷筒粉 VS 130元海鮮粉', duration: 936 },
  AovUL5FMYnc: { id: 'AovUL5FMYnc', channel: 'meow', title: '廣西南寧最火爆大排檔，15元海鮮粉 VS 108元第一燒鵝', duration: 878 },
  DUmtBh5jUjk: { id: 'DUmtBh5jUjk', channel: 'meow', title: '廣西南寧解暑美食之王，55一斤博白白切 VS 4元果醬燒烤', duration: 812 },
  // 十三要
  nNLvL1z_mjE: { id: 'nNLvL1z_mjE', channel: 'yao', title: '中國即將消失的縣城！發展卻越來越好！', duration: 1360 },
  '1NJZKzeWbg8': { id: '1NJZKzeWbg8', channel: 'yao', title: '中國最誇張的斷崖式交界帶！一座城裝下盆地和高原！', duration: 1288 },
  ee9JlJh5mVw: { id: 'ee9JlJh5mVw', channel: 'yao', title: '中國最擠的縣城，竟然是西遊記裡的「女兒國」？！', duration: 1104 },
  '8QwV1fcYtfs': { id: '8QwV1fcYtfs', channel: 'yao', title: '中國最有壓迫感的南北分界線！4小時橫穿秦嶺鰲太線！', duration: 1502 },
  mdOEkhlmKsM: { id: 'mdOEkhlmKsM', channel: 'yao', title: '最愛中文的歐洲國家！高考竟然考中文！', duration: 998 },
  // OK哥
  Ea8ICLXTDaU: { id: 'Ea8ICLXTDaU', channel: 'okge', title: '80後老登勇闖加勒比海無人島，夜裡的海底都是巨型犀牛蝦！', duration: 1476 },
  dnsK8HWD8us: { id: 'dnsK8HWD8us', channel: 'okge', title: '為了稀有的粉色螺珠，我在加勒比海與2米長大鯊魚搏鬥許久！', duration: 1320 },
  '7TIoqV_J8zg': { id: '7TIoqV_J8zg', channel: 'okge', title: '探索美國第4集：佛羅里達找到史前巨齒鯊的大牙齒！', duration: 1188 }
};

// 15 個 clip；status: reviewed 進首頁/檢索，inbox/analyzing 進代辦清單
// countdownSec 僅代辦項目使用（剩餘秒數）
const CLIPS = [
  // ── OK哥 Ea8ICLXTDaU：一支影片 3 個 clip（詳細頁主角）──
  { id: 'c01', videoId: 'Ea8ICLXTDaU', start: 132, end: 168, eventDate: '2026-08-03', status: 'reviewed',
    summary: '夜潛第一次見到巨型犀牛蝦，藏在礁石縫裡', note: '犀牛蝦好大',
    tags: [{ name: '加勒比海', kind: 'place', source: 'human' }, { name: '夜潛', kind: 'topic', source: 'human' }, { name: '龍蝦', kind: 'other', source: 'ai' }] },
  { id: 'c02', videoId: 'Ea8ICLXTDaU', start: 612, end: 650, eventDate: '2026-08-03', status: 'reviewed',
    summary: '在無人島沙灘生火煮海鮮，畫面超療癒', note: '',
    tags: [{ name: '無人島', kind: 'place', source: 'ai' }, { name: '露營', kind: 'topic', source: 'ai' }] },
  { id: 'c03', videoId: 'Ea8ICLXTDaU', start: 1140, end: 1176, eventDate: '2026-08-03', status: 'reviewed',
    summary: '海底遇到一群魚群，能見度極佳', note: '這段風景最美',
    tags: [{ name: '潛水', kind: 'topic', source: 'human' }, { name: '魚群', kind: 'other', source: 'ai' }] },

  // ── 其餘首頁 clip（reviewed，跨不同月份）──
  { id: 'c04', videoId: 'dnsK8HWD8us', start: 480, end: 520, eventDate: '2026-06-18', status: 'reviewed',
    summary: '與2米長大鯊魚近距離對峙，超緊張', note: '差點掉線',
    tags: [{ name: '加勒比海', kind: 'place', source: 'human' }, { name: '鯊魚', kind: 'other', source: 'human' }, { name: '粉色螺珠', kind: 'topic', source: 'ai' }] },
  { id: 'c05', videoId: '7TIoqV_J8zg', start: 300, end: 342, eventDate: '2026-05-09', status: 'reviewed',
    summary: '在河床挖到史前巨齒鯊的大牙齒', note: '',
    tags: [{ name: '佛羅里達', kind: 'place', source: 'ai' }, { name: '化石', kind: 'topic', source: 'human' }, { name: '巨齒鯊', kind: 'other', source: 'ai' }] },

  { id: 'c06', videoId: 'Pe226YsYVWk', start: 210, end: 250, eventDate: '2026-07-21', status: 'reviewed',
    summary: '108元的第一螺螄鴨腳煲，湯頭濃郁', note: '鴨腳很入味',
    tags: [{ name: '柳州', kind: 'place', source: 'human' }, { name: '螺螄粉', kind: 'topic', source: 'human' }, { name: '宵夜', kind: 'topic', source: 'ai' }] },
  { id: 'c07', videoId: 'r4YnYow7L_4', start: 156, end: 192, eventDate: '2026-04-14', status: 'reviewed',
    summary: '3.5元的卷筒粉，CP值爆表', note: '',
    tags: [{ name: '廣西', kind: 'place', source: 'human' }, { name: '米粉', kind: 'topic', source: 'human' }] },
  { id: 'c08', videoId: 'AovUL5FMYnc', start: 420, end: 456, eventDate: '2026-02-27', status: 'reviewed',
    summary: '南寧大排檔的15元海鮮粉，料多實在', note: '老闆超豪邁',
    tags: [{ name: '南寧', kind: 'place', source: 'ai' }, { name: '大排檔', kind: 'topic', source: 'human' }, { name: '海鮮', kind: 'topic', source: 'ai' }] },
  { id: 'c09', videoId: 'DUmtBh5jUjk', start: 260, end: 300, eventDate: '2025-12-30', status: 'reviewed',
    summary: '博白白切，55元一斤肉質鮮嫩', note: '',
    tags: [{ name: '博白', kind: 'place', source: 'human' }, { name: '白切', kind: 'topic', source: 'ai' }] },

  { id: 'c10', videoId: 'nNLvL1z_mjE', start: 540, end: 580, eventDate: '2026-03-11', status: 'reviewed',
    summary: '即將消失的縣城，老街依然熱鬧', note: '很有時代感',
    tags: [{ name: '縣城', kind: 'place', source: 'human' }, { name: '老街', kind: 'topic', source: 'ai' }] },
  { id: 'c11', videoId: '1NJZKzeWbg8', start: 720, end: 764, eventDate: '2026-01-08', status: 'reviewed',
    summary: '斷崖式交界帶，一邊盆地一邊高原', note: '地形超震撼',
    tags: [{ name: '高原', kind: 'place', source: 'human' }, { name: '地理', kind: 'topic', source: 'human' }] },
  { id: 'c12', videoId: 'ee9JlJh5mVw', start: 330, end: 366, eventDate: '2025-11-19', status: 'reviewed',
    summary: '西遊記「女兒國」原型縣城，人口密度驚人', note: '',
    tags: [{ name: '縣城', kind: 'place', source: 'ai' }, { name: '西遊記', kind: 'topic', source: 'human' }] },
  { id: 'c13', videoId: '8QwV1fcYtfs', start: 900, end: 948, eventDate: '2025-09-05', status: 'reviewed',
    summary: '橫穿秦嶺鰲太線，雲海壯闊', note: '走了4小時',
    tags: [{ name: '秦嶺', kind: 'place', source: 'human' }, { name: '登山', kind: 'topic', source: 'human' }, { name: '雲海', kind: 'other', source: 'ai' }] },

  // ── 代辦清單（尚未處理，倒數中）──
  { id: 'c14', videoId: 'mdOEkhlmKsM', start: 180, end: 216, eventDate: '2025-10-02', status: 'inbox',
    summary: '', note: '歐洲高考考中文這段', countdownSec: 168,
    tags: [] },
  { id: 'c15', videoId: 'OVmxey333G0', start: 240, end: 280, eventDate: '2025-08-16', status: 'analyzing',
    summary: '', note: '海豹組團跟蹤搶海貨', countdownSec: 0,
    tags: [] }
];
// c15 影片補進 VIDEOS（OK哥 洛杉磯打魚）
VIDEOS['OVmxey333G0'] = { id: 'OVmxey333G0', channel: 'okge', title: '探索美國第3集：在洛杉磯打魚太崩潰，海豹組團跟蹤搶海貨！', duration: 1140 };

// 供代辦清單另外再放 2 筆，湊出「批次待處理」感
CLIPS.push(
  { id: 'c16', videoId: 'Pe226YsYVWk', start: 640, end: 680, eventDate: '2026-07-21', status: 'inbox',
    summary: '', note: '210元深夜大排檔那攤', countdownSec: 92, tags: [] },
  { id: 'c17', videoId: '7TIoqV_J8zg', start: 720, end: 760, eventDate: '2026-05-09', status: 'inbox',
    summary: '', note: '抓入侵物種哥斯拉蜥蜴', countdownSec: 143, tags: [] }
);

// ── 輔助函式 ──
function thumbUrl(videoId) {
  // 真實影片縮圖（16:9）；videoId 可能是 JS-safe key，需還原成真實 id
  const realId = (VIDEOS[videoId] && VIDEOS[videoId].id) || videoId;
  return `https://i.ytimg.com/vi/${realId}/mqdefault.jpg`;
}
function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtDateLabel(iso) {
  const [y, m, d] = iso.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}
function fmtMonthLabel(iso) {
  const [y, m] = iso.split('-');
  return `${y}年${parseInt(m)}月`;
}
function videoOf(clip) { return VIDEOS[clip.videoId]; }
function channelOf(clip) { return CHANNELS[VIDEOS[clip.videoId].channel]; }

// 所有出現過的標籤（去重）→ 標籤頁使用
function allTags() {
  const map = new Map();
  for (const c of CLIPS) for (const t of c.tags) {
    if (!map.has(t.name)) map.set(t.name, { name: t.name, kind: t.kind, count: 0 });
    map.get(t.name).count++;
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

const KIND_ICON = { person: '👤', pet: '🐾', place: '📍', topic: '#', other: '◆' };

window.MOCK = { CHANNELS, VIDEOS, CLIPS, thumbUrl, fmtTime, fmtDateLabel, fmtMonthLabel, videoOf, channelOf, allTags, KIND_ICON };
