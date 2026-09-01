# yt-space

從任何 YouTube 影片挑出畫面，成為可依時間瀏覽、依標籤與語意檢索的個人圖庫（手機優先 PWA）。

**目前進度：尚未開始實作。** `src/` 是 2026-08-07 clip 版的舊實作，v1 的十六個階段全部在前方。

---

## 動工前必讀（依這個順序）

| # | 文件 | 角色 | 什麼時候看 |
|---|---|---|---|
| 1 | [`docs/superpowers/plans/2026-09-01-yt-space-shot-v1-實作計畫.md`](docs/superpowers/plans/2026-09-01-yt-space-shot-v1-實作計畫.md) | **主文件**。16 階段 73 任務、依賴關係、驗收條件、風險判定時機 | 每次動工 |
| 2 | [`docs/superpowers/specs/2026-08-27-yt-space-shot-design.md`](docs/superpowers/specs/2026-08-27-yt-space-shot-design.md) | **規格**。技術事實（CORS 實測矩陣、sheet 尺寸、去重規則）、資料模型、v3 邊界 | 動手寫某個模組前，讀對應章節 |
| 3 | [`mockups/uiux-v2/驗收操作手冊.md`](mockups/uiux-v2/驗收操作手冊.md) | **驗收標準**。計畫裡每條驗收條件都是引用它的原文 | 做完一個任務要驗收時 |
| 4 | [`docs/superpowers/2026-09-01-uiux-v2-畫面契約與待決事項.md`](docs/superpowers/2026-09-01-uiux-v2-畫面契約與待決事項.md) | **附錄**。逐畫面的資料契約與量級假設、27 條 delta、11 個決定的來龍去脈 | 需要知道某個欄位從哪來、或某個決定為什麼這樣定 |

`mockups/uiux-v2/` 的 HTML 是 **UI 的實作參考**，但它落後於驗收手冊（手冊是目標狀態）。
兩者不一致時**以手冊為準**，計畫第五節已逐條標出差異。

---

## 開始實作時怎麼說

**不要說**「照計畫做」——73 個任務不會一次做完。

**要說**做哪一段，例如：

```
執行實作計畫的階段 1
```
```
執行 T1.1 到 T1.3
```

計畫的階段 1 是 Turborepo 骨架與資料模型改名，其餘階段的順序與平行關係見計畫第二節。

---

## 文件的維護規則

**規格永遠是現況，git 是歷史，計畫是排程。** 三者不重疊。

- 規格有異動就**改本文**，不在頂部累積變更紀錄 —— 讀者不該先讀到過期的內容、
  再回頭套用一張修訂表。
- 舊的規格與計畫直接刪除，內容留在 git 歷史；其中仍然有效的結論要**先併入現行規格再刪**
  （2026-09-01 就是這樣處理的，成果見規格的附錄 A）。
- **尚未定案的地方就地標 ⏳**，寫在該條款旁邊，不集中在別處。

目前有兩處待確認：

| 位置 | 待確認 | 暫定 |
|---|---|---|
| 規格第五節 第三步的時間欄位 | 中性說明 vs 標題旁橘色 ⚠ 警告 | 中性說明（⏳ 已標在規格裡） |
| 驗收手冊 §二 首頁月份標籤 | 換行排列 vs 橫向捲動 | 橫向捲動（沿用原型現況） |

---

## 不能刪的東西

**`src/` 不是垃圾，是階段 1 的輸入。** 特別是：

- **`src/lib/storyboard.ts`** —— `mockups/server.mjs:42` **在執行期讀取它**並轉譯成
  `/shared/storyboard.js`。刪掉它 `pnpm mock` 就開不起來，UI 原型每一頁都會壞
  （原型是驗收基準）。這個檔案是 T1.1 要搬去 `packages/storyboard` 的那份東西。
- **`src/lib/server/repo/`** —— T1.3 是「介面重整」不是重寫，mock repo 的形態要保留。
- **`static/`** —— manifest ＋ icon。PWA 在 v1 範圍內，R-4 的退路就是改 manifest 的 `display`。

`tests/e2e/` 裡 `inbox` / `mark` / `review` / `studio` 四個 spec 測的是 v1 已移除的功能，
**會在 T1.6 一併刪除** —— 跟程式碼改動同一個 commit，不要提前刪。
其餘六個 ＋ `_setup.ts` 要留，T1.5 的驗收條件是「既有 E2E 通過」。

`test-results/`、`tmp/`、`.svelte-kit/`、`.wrangler/` 都在 `.gitignore` 裡，隨時可刪。

---

## 詞彙

規格與計畫一律用左欄；mockup 的程式碼還是右欄，讀原型時要換算。

| 正式 | mockup | 說明 |
|---|---|---|
| `shot` | `clip` | 同一個東西 |
| `at_sec` | `start` | 單一時間點。`end` 已移除，不存結束時間 |
| `description` | `summary` ＋ `note` | 已合併為一欄 |
| `place` | `tag.kind='place'` | 已獨立成欄位，`tag.kind` 不再有 `place` |
| 帳號 `/account` | 「設定」 | 導覽列第五格定名為「帳號」 |

---

## 指令

```bash
pnpm dev          # SvelteKit dev server
pnpm mock         # UI 原型（需要 src/lib/storyboard.ts 存在）
pnpm check        # svelte-check
pnpm test:unit    # Vitest
pnpm test:e2e     # Playwright（Pixel 7 viewport）
```

E2E 以 `PUBLIC_PLAYER_MODE=fake` 執行，播放器走可控的假實作，因此測試離線且穩定。

---

## 慣例

- **commit message 用繁體中文**，格式 `類型(範圍): 描述`，不加 AI 生成標記（見 `.claude/skills/git-commit`）。
- **所有 D1 存取只走 `repo` 介面**，不得在 repo 之外直接碰 D1（規格第十八節邊界 1）。
- **R2 讀寫收斂在 `/api/thumbs` 與單一 storage 模組**（邊界 2）。
- **認證邏輯只在 `auth.ts` 一個檔案**（邊界 3）。
- **影像處理一律在瀏覽器 canvas**，Worker 只轉送位元組，不引入影像相依。
