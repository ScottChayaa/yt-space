// storyboard 探測工具（獨立測試頁）
//   node mockups/sb-probe.mjs      → http://localhost:8232/sb-probe.html
//
// 純前端無法抓 watch page（跨來源被擋），所以這支小伺服器負責兩件事：
//   1. 靜態檔案（sb-probe.html / storyboard.js）
//   2. GET /api/spec?v=<videoId> —— 代抓 watch page 並回傳 playerStoryboardSpecRenderer.spec
// 這正是正式版後端 src/lib/server/youtube.ts 要做的事，此處是最小驗證版。
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 8232;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

// 抓 watch page，撈出 spec 與幾個基本欄位。
// 失敗要分類（見設計規格第七節）：no_storyboard 是影片本身沒有，parse_failed 才是解析器壞了。
async function fetchSpec(videoId) {
  const res = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, {
    headers: { 'user-agent': UA, 'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8' }
  });
  if (!res.ok) return { result: 'fetch_failed', status: res.status };
  const html = await res.text();

  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1] : null;
  };
  const spec = pick(/"playerStoryboardSpecRenderer":\{"spec":"([^"]*)"/);
  const title = pick(/"videoDetails":\{[^{]*?"title":"([^"]*)"/) || pick(/<title>([^<]*)<\/title>/);
  const lengthSeconds = pick(/"lengthSeconds":"(\d+)"/);

  if (spec) {
    return {
      result: 'ok',
      videoId,
      spec,
      title: title ? JSON.parse(`"${title.replace(/"/g, '\\"')}"`) : null,
      duration: lengthSeconds ? Number(lengthSeconds) : null
    };
  }
  // 沒抓到 spec 時要分類，因為三種情況的處置完全不同（見設計規格第七節）。
  // 判定順序很重要：先確認影片本身能不能播，再談有沒有 storyboard。
  const playability = pick(/"playabilityStatus":\{"status":"(\w+)"/);
  const reason = pick(/"playabilityStatus":\{[^{]*?"reason":"([^"]*)"/);
  const hasVideoDetails = /"videoDetails":\{/.test(html);

  // 影片不存在／私人／已刪除／地區限制：playabilityStatus 在但不是 OK，且沒有 videoDetails。
  // 這是「輸入的影片有問題」，不是解析器壞了 —— 正式版不可據此發告警。
  if (playability && playability !== 'OK' && !hasVideoDetails) {
    return { result: 'video_unavailable', videoId, playability, reason, htmlBytes: html.length };
  }
  // 影片正常（videoDetails 在），只是沒有 storyboard：過短、直播中、或剛上傳尚未產生。
  if (hasVideoDetails) {
    return {
      result: 'no_storyboard',
      videoId,
      title,
      duration: lengthSeconds ? Number(lengthSeconds) : null,
      htmlBytes: html.length
    };
  }
  // 連 videoDetails 和 playabilityStatus 都撈不到 → 頁面結構變了，解析器失效。
  return { result: 'parse_failed', videoId, playability, htmlBytes: html.length };
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/spec') {
    const v = url.searchParams.get('v');
    res.setHeader('content-type', 'application/json; charset=utf-8');
    if (!v) return res.writeHead(400).end(JSON.stringify({ result: 'bad_request' }));
    try {
      const out = await fetchSpec(v);
      res.writeHead(out.result === 'ok' ? 200 : 502).end(JSON.stringify(out));
    } catch (e) {
      res.writeHead(502).end(JSON.stringify({ result: 'fetch_failed', error: String(e) }));
    }
    return;
  }

  const name = url.pathname === '/' ? '/sb-probe.html' : url.pathname;
  try {
    const body = await readFile(join(DIR, name.replace(/^\/+/, '')));
    res.writeHead(200, { 'content-type': MIME[extname(name)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(PORT, () => console.log(`sb-probe → http://localhost:${PORT}/sb-probe.html`));
