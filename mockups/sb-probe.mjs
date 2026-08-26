// storyboard 探測工具（獨立測試頁）
//   node mockups/sb-probe.mjs      → http://localhost:8232/sb-probe.html
//
// 純前端無法抓 watch page（跨來源被擋），所以這支小伺服器負責兩件事：
//   1. 靜態檔案（sb-probe.html / storyboard.js）
//   2. GET /api/spec?v=<videoId> —— 代抓 watch page 並回傳 playerStoryboardSpecRenderer.spec
//   3. GET /api/sheet?u=<sheetUrl> —— 代理 i.ytimg.com 圖檔（補 CORS，讓前端量得到大小）
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

  // 代理 i.ytimg.com 的 sheet 圖檔。兩個目的：
  //   1. i.ytimg.com 不送 CORS 標頭，前端 fetch 不到位元組 → 量不出檔案大小
  //   2. 同來源之後 canvas 不會被污染 → 可以逐格 toBlob 重新編碼，量單張存檔大小
  if (url.pathname === '/api/sheet') {
    const u = url.searchParams.get('u');
    if (!u) return res.writeHead(400).end('bad_request');
    let target;
    try {
      target = new URL(u);
    } catch {
      return res.writeHead(400).end('bad_url');
    }
    if (target.hostname !== 'i.ytimg.com') return res.writeHead(403).end('host_not_allowed');
    try {
      const up = await fetch(target, { headers: { 'user-agent': UA } });
      // 上游失敗一律回 502，不要原樣轉發它的狀態碼。
      // 否則上游的 404 會跟「這台伺服器沒有 /api/sheet 這條路由」的 404 撞在一起，
      // 前端就分不出是圖不存在還是伺服器版本太舊。
      if (!up.ok) {
        return res
          .writeHead(502, { 'content-type': 'application/json; charset=utf-8' })
          .end(JSON.stringify({ error: 'upstream', status: up.status, url: target.href }));
      }
      const buf = Buffer.from(await up.arrayBuffer());
      res.writeHead(200, {
        'content-type': up.headers.get('content-type') || 'application/octet-stream',
        'content-length': buf.length,
        'cache-control': 'no-store'
      }).end(buf);
    } catch (e) {
      res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' })
         .end(JSON.stringify({ error: 'fetch_failed', message: String(e) }));
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
