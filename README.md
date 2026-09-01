# yt-space

從任何 YouTube 影片挑出畫面，成為可依時間瀏覽、依標籤與語意檢索的個人圖庫（手機優先 PWA）。

一趟流程收完一整支影片：貼網址 → 從整支影片的縮圖裡批次挑 → 統一給標籤與地點 → 完成。

## 目前進度

**尚未開始實作 v1。**

`src/` 是 2026-08-07 clip 版的第一階段實作（四個畫面、記憶體 mock），
產品操作模型已於 2026-08-27 改版（`clip` 區間 → `shot` 單一時間點、精靈式批次取圖），
因此 v1 的十六個階段全部在前方，既有程式碼是起點而非可跳過的進度。

`mockups/uiux-v2/` 是已驗收的 UI 原型（假資料），也是 v1 的 UI 目標狀態。

## 文件

動工前的閱讀順序見 [`CLAUDE.md`](CLAUDE.md)，其中也列出**規格中已被 2026-09-01 決定取代的條款**。

| 文件 | 角色 |
|---|---|
| [實作計畫](docs/superpowers/plans/2026-09-01-yt-space-shot-v1-實作計畫.md) | 16 階段 73 任務、依賴關係、驗收條件、風險判定時機 |
| [設計規格](docs/superpowers/specs/2026-08-27-yt-space-shot-design.md) | 技術事實、資料模型、架構決策與其理由 |
| [驗收操作手冊](mockups/uiux-v2/驗收操作手冊.md) | 驗收標準；計畫的驗收條件都引用它的原文 |
| [畫面契約與決策紀錄](docs/superpowers/2026-09-01-uiux-v2-畫面契約與待決事項.md) | 逐畫面資料契約、27 條 delta、11 個決定的來龍去脈 |

歷史規格保留在 [`docs/superpowers/specs/`](docs/superpowers/specs/)，較舊的兩份已被取代。

## 開發

```bash
pnpm install
pnpm dev          # SvelteKit dev server
pnpm mock         # UI 原型 http://localhost:8231/uiux-v2/login.html
```

`pnpm mock` 會把 `src/lib/storyboard.ts` 即時轉譯成原型用的 `/shared/storyboard.js`，
所以原型與正式版共用同一份 storyboard 解碼邏輯，不留手抄副本。

## 測試

```bash
pnpm test:unit    # Vitest：純函式
pnpm test:e2e     # Playwright：Pixel 7 viewport
pnpm check        # svelte-check 型別檢查
```

E2E 以 `PUBLIC_PLAYER_MODE=fake` 執行，播放器走可控的假實作，因此測試離線且穩定。

## 架構

SvelteKit on Cloudflare Workers，`+server.ts` 即 API（同源、無 CORS）。
D1 存資料與 FTS5 全文檢索、R2 存縮圖、Cloudflare Access 負責登入。
影像處理（裁切、縮圖、相似度比對）一律在瀏覽器 canvas，Worker 只轉送位元組。

所有資料存取經過 `Repo` 介面，以 `DATA_SOURCE=mock|d1` 切換 —— 這條界線也是日後脫離
Cloudflare 自架時只需新增一個實作檔的原因（見規格第十八節）。
