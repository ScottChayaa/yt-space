# yt-space 設計規格書

> 個人 YouTube Vlog 語意化自然語言檢索系統
> 建立日期：2026-07-30
> 狀態：設計確認中（待使用者複審）

---

## 一、需求分析

### 1. 核心目標

建立一套能對個人 YouTube Vlog 影片進行**語意化自然語言查詢**的系統。使用者輸入如
「2020~2025 年我家的貓」或「貓咪嘔吐看醫生」時，系統能精確回傳對應影片，並**自動定位到事件發生的秒數區間**（例如 `01:20–01:45`）。

### 2. 功能需求

- **語意與實體理解**：能識別「我家的貓 = 特定暱稱」，理解複雜行為（睡覺、打針、玩玩具）。
- **數值與邏輯過濾**：支援時間區間（如 2020~2025）篩選。
- **秒數級定位**：精確回傳片段的起訖秒數。
- **自動化處理、低人工成本**：影像/語音分析由 AI 自動完成，僅需輕量人工校對。
- **隱私安全性**：支援對 Unlisted（不公開）影片檢索。

### 3. 產品定位（多租戶）

本系統是一個**多租戶（multi-tenant）工具**：每個使用者都像作者本人一樣，管理自己私人的
vlog、只分享給自己的親友。不是把單一使用者的影片散播給大量觀眾。

- v1：只服務單一租戶（作者本人），**不做帳號/登入系統**（YAGNI）。
- 架構層面從第一天就用 `owner_id` 做租戶隔離，未來開放多使用者時**無需資料遷移**。

### 4. 已確認的關鍵決策

| 主題 | 決策 |
|---|---|
| 隱私定位 | 個人 + 少數信任親友；影片用 **YouTube Unlisted**（連結即可看，可嵌入播放） |
| 影片規模 | backlog 約 150~500 支；未來每週最多 1 支；**每支上限 10 分鐘** |
| 視覺分析 | **必要**（許多重要片段為無旁白純畫面） |
| 開發硬體 | AMD RX480（AI 推論視同無 GPU，Whisper 走 CPU） |
| 雲端隱私 | **接受**將關鍵幀上傳 Gemini Flash 免費額度分析 |
| 查詢介面 | v1 先做**本機網頁（SvelteKit）** |
| 日期來源 | 檔名日期 ＞ 檔案建立時間 ＞ 校對手動填；**每個 segment 可各自覆寫** |
| 檔名規範 | 建議 `YYYY-MM-DD_描述.mp4`（選用、非強制） |
| 基礎設施 | **Cloudflare-native**（Workers + D1 + Pages） |
| 開發模式 | `wrangler dev --remote --env dev`（**連遠端 dev 資料庫、需連網**，不用本機模擬） |
| 環境命名 | `env.dev` / `env.prod` |
| 檢索策略 | v1 用 **D1 FTS5 全文檢索**；向量搜尋（Vectorize）列為 v2 |
| YouTube 上傳 | v1 **手動上傳**、校對頁貼 ID；v2 改網站自動化（YouTube Data API） |
| STT 模型 | whisper.cpp `medium` |
| 縮圖 | **v1 做 R2 逐段縮圖**（每個 segment 的代表關鍵幀存 R2）；短片預覽列 v2 |
| 查詢解析 | Gemini Flash 解析自然語言（+規則式 fallback） |

### 5. 系統限制

- YouTube 原生搜尋僅公開關鍵字比對，不支援私人影片全文語意檢索，也無日期區間邏輯運算。
- Cloudflare Workers 無法執行 ffmpeg / Whisper 等重運算（CPU/時間限制）→ 重運算 pipeline 必須在「真機器」執行（v1 = 作者 PC）。

---

## 二、整體架構

系統分三大塊：**處理管線（重、批次）→ 索引資料庫（Cloudflare）→ 查詢/播放（輕、即時）**。
三者透過資料庫解耦：pipeline 只寫入、查詢只讀取。

```
                    ┌───────────── 作者 PC（本機執行）─────────────┐
[原始 vlog .mp4] ──▶ │  apps/pipeline（處理管線 CLI）                │
                    │   ① 抽音軌 ② Whisper STT ③ 場景抽幀           │
                    │   ④ Gemini 視覺分析 ⑤ 章節草稿 ⑥ 人工校對    │
                    └───────────────────┬──────────────────────────┘
                                        │ POST /ingest（帶 secret）
                                        ▼
                    ┌──────── Cloudflare（env.dev / env.prod）─────┐
                    │  apps/api（Hono Worker）                      │
                    │  D1：videos / segments / entities + FTS5      │
                    │  R2：逐段縮圖（未來：短片預覽 webm）           │
                    │  （未來：Vectorize 向量索引）                 │
                    └───────────────────┬──────────────────────────┘
                                        │ GET /search
      ┌──────────────────────────────────┼───────────────────────────┐
      ▼                                   ▼                           ▼
apps/web（SvelteKit）              未來：手機 App              YouTube（Unlisted）
搜尋框 + 結果卡片                  同一個 API                  iframe 嵌入播放器
點擊 → iframe 跳秒播放                                        ?start= 跳秒
```

### 核心設計原則

1. **處理與查詢徹底解耦**：pipeline（離線批次）與 api（即時查詢）只透過 D1 溝通。
   未來把 pipeline 搬到雲端 worker 時，查詢與資料層完全不動。
2. **查詢從第一天就是 API**：web（現在）與手機 App（未來）都是同一個 API 的不同前端，
   核心邏輯只寫一次。
3. **AI provider 可抽換**：STT 與 vision 都藏在 provider 介面後，未來 PC 升級顯卡即可
   把 vision 從 `gemini` 換成本機 `ollama`，其餘不動。
4. **多租戶就緒**：所有資料表帶 `owner_id`，查詢一律以 `owner_id` 隔離。

### Monorepo 結構（Turborepo + pnpm）

```
yt-space/
├── apps/
│   ├── pipeline/      # 本機處理管線 CLI（Node）：STT、抽幀、Gemini、建索引、校對後端
│   ├── api/           # Hono 查詢服務（本機 Node / Cloudflare Workers 通用）
│   └── web/           # SvelteKit 前端（搜尋 UI + YouTube 播放器 + 校對頁）→ Cloudflare Pages
├── packages/
│   ├── core/          # 共用型別 + 查詢解析/檢索/排序邏輯
│   ├── db/            # Drizzle schema + D1/SQLite 存取 + migrations
│   └── providers/     # 可抽換 AI provider：stt(whisper.cpp)、vision(gemini|ollama)
├── docs/superpowers/specs/
├── inbox/             # 放待處理的原始 .mp4（本機、git 忽略）
├── drafts/            # pipeline 產出的章節草稿 JSON（本機、git 忽略）
├── wrangler.toml      # Cloudflare 設定（env.dev / env.prod）
├── turbo.json
└── package.json       # pnpm workspace
```

---

## 三、資料模型（D1 Schema）

核心觀念：**一支 `video` 包含多個 `segment`（片段/事件）；日期與事件掛在 segment 層級**
（合成片可橫跨多個年份，每段各自的日期都能精準篩選）。

```
video（影片）
  ├─ id             YouTube Video ID（主鍵，例如 "dQw4w9WgXcQ"）
  ├─ owner_id       租戶隔離（v1 固定為作者）
  ├─ title          影片標題
  ├─ youtube_status 'unlisted' | 'private' | 'public'
  ├─ duration_sec   總長度（秒）
  ├─ source_filename 原始檔名（校對追溯）
  ├─ default_date   影片預設日期（檔名/建立時間推導）
  ├─ processed_at   處理完成時間
  └─ review_status  'pending' | 'reviewed'

segment（片段/事件） ── video 一對多 ──
  ├─ id             自動編號
  ├─ video_id       外鍵 → video.id
  ├─ owner_id       租戶隔離（冗餘存放，加速查詢過濾）
  ├─ start_sec      起始秒數（跳轉用）
  ├─ end_sec        結束秒數
  ├─ event_date     ★這一段的日期（可覆寫 video.default_date）
  ├─ transcript     這段的語音字幕（Whisper）
  ├─ visual_desc    這段的畫面描述（Gemini）
  ├─ summary        綜合事件描述（顯示用，如「貓咪在沙發嘔吐」）
  ├─ thumb_key      R2 縮圖物件 key（該段代表關鍵幀）
  └─ source         'stt' | 'vision' | 'merged'（debug 用）

entity（實體/暱稱） ── 使用者定義詞彙表 ──
  ├─ id
  ├─ owner_id
  ├─ name           正式名稱，如 "小橘"
  ├─ type           'pet' | 'person' | 'place' | 'object'
  └─ aliases        別名 JSON，如 ["我家的貓","橘貓","貓咪"]

segment_entity（片段↔實體 多對多）
  ├─ segment_id
  └─ entity_id

segment_fts（FTS5 虛擬表，D1 內建、零額外成本）
  └─ 索引 transcript + visual_desc + summary
```

### 索引

- `segment(owner_id, event_date)`：日期區間篩選
- `segment(video_id)`：取單片所有段落
- `segment_entity(entity_id)` / `segment_entity(segment_id)`：多對多 join
- `entity(owner_id)`：詞彙表查詢

### D1 容量評估

- D1 為 SQLite，只要有索引，百萬筆條件查詢仍是毫秒級；瓶頸在「總儲存量」與「高並發寫入」，非筆數。
- 作者實際量級：500 支 × 每支 10~30 段 ≈ 5,000~15,000 筆 segment ≈ 15~30 MB → 遠低於免費上限。
- 即使成長到 1,000 租戶 × 500 支 ≈ 1,500 萬筆 ≈ 1~2 GB，仍在單一 D1（上限 10GB）內、查詢仍快。
- **D1 是長期的資料主體，不是過渡方案**；Vectorize（v2）只加強搜尋品質，不取代 D1。

---

## 四、處理管線（Pipeline）與人工校對

Pipeline 是**本機 CLI**，對每支影片依序跑 6 階段，產出「待校對」草稿；校對核准後才寫入 D1。

```
對每支 影片.mp4：
 ① 抽音軌        ffmpeg 取出音訊
 ② STT 轉字幕    whisper.cpp（medium，本機 CPU）→ [{start,end,text},...]
 ③ 場景抽幀      ffmpeg 場景偵測取關鍵幀（非每秒硬抽，控制 Gemini 用量）
 ④ 視覺分析      關鍵幀「一支片一次批次請求」送 Gemini Flash
                 → 每幀畫面描述 + 實體建議
 ⑤ 合併 segment  以場景邊界切段，套上字幕+畫面描述；Gemini 產生每段 summary
                 → 選出每段代表關鍵幀、產生縮圖（上傳 R2）
                 → 產出章節草稿 JSON（存到 drafts/）
 ⑥ 人工校對      本機網頁：確認日期/summary/實體對應 → 核准 → POST /ingest
```

### 使用者實際操作流程（v1）

```bash
# 1. 把待處理影片放進 inbox/
#    inbox/2021-03-15_貓咪打針.mp4 ...

# 2. 批次處理（電腦自動跑 ①~⑤，可放著跑）
pnpm pipeline process ./inbox
#    → 進度輸出，產出 drafts/*.json，狀態「待校對」

# 3. 開校對頁（人工部分）
pnpm dev
#    → 網頁列出待校對；點一支：
#      (a) 手動上傳該 .mp4 到 YouTube（unlisted）→ 複製 watch?v= 的 ID
#      (b) 貼進「YouTube 網址/ID」欄位（核准前必填）
#      (c) 確認/修改日期、summary、實體對應
#      (d) 按「核准」→ 寫入 D1

# 4. 之後即可在搜尋頁查詢
```

### 關鍵設計

- **STT = whisper.cpp（medium）**：C++、CPU 最佳化，經 Node `child_process` 呼叫，適合無 GPU 環境。
- **抽幀 = 場景偵測**：一支 10 分鐘片約 15~40 張關鍵幀（而非 120 張），是控制 Gemini 用量、維持免費的關鍵。
- **Gemini 一支片一請求**：多圖批次輸入，最小化請求數。
- **YouTube v1 手動上傳**：pipeline 只處理本機 .mp4，`video_id` 由使用者上傳後貼入。
- **斷點續跑**：每階段結果落地存檔，重跑跳過已完成階段——處理大量 backlog 與 Gemini 限額時至關重要。

### Gemini 免費額度處理策略

- **一支一請求**：150~500 支 = 150~500 次請求，通常一天內即可完成（免費 RPD 多為上千次）。
- provider 內建三層保護：
  1. **主動限速**（throttle，壓在 RPM 上限下）
  2. **429 退避重試**（exponential backoff，尊重 `Retry-After`）
  3. **每日額度用完 → 優雅停止**，標記剩餘為待處理，隔天重跑自動接續（不失敗、不重做）
- 實作時讀取 API 回應的實際限制，不寫死數字。

---

## 五、查詢 API 與前端播放

### API（Hono Worker）端點

| 端點 | 用途 |
|---|---|
| `POST /ingest` | pipeline 校對後寫入影片+片段（secret 保護，未來手機上傳重用） |
| `GET /search` | 自然語言查詢 → 符合片段（含 video_id + 秒數） |
| `GET /entities` | 列出/管理實體詞彙表（校對頁用） |
| `GET /videos/:id` | 取單支影片詳情（可選） |

### `/search` 流程（例：「2020~2025 我家的貓在沙發睡覺」）

```
1. 查詢解析（Gemini Flash，一次輕量文字請求；離線/失敗時退回規則式）
   → { date_from:"2020-01-01", date_to:"2025-12-31",
       entities:["我家的貓"], keywords:["沙發","睡覺"] }

2. entity 對應：D1 用 aliases 把「我家的貓」→ entity_id（小橘）（DB 查詢，非 LLM）

3. SQL 檢索（全在 D1，毫秒級）：
   SELECT ... FROM segment s
   JOIN segment_entity se ON se.segment_id = s.id
   WHERE s.owner_id = ?
     AND s.event_date BETWEEN ? AND ?
     AND se.entity_id = ?
     AND s.id IN (SELECT rowid FROM segment_fts WHERE segment_fts MATCH '沙發 睡覺')
   ORDER BY <相關度>

4. 回傳 [{ video_id, start_sec, end_sec, summary, event_date, score }, ...]
```

### 前端（SvelteKit → Cloudflare Pages）

- 搜尋框 → 結果卡片列表（YouTube 縮圖、標題、日期、`mm:ss–mm:ss`、summary）。
- 點擊 → 內嵌 `https://www.youtube.com/embed/{id}?start={start}&end={end}` 自動跳秒播放。
- 一支影片的多個符合片段各自獨立成卡片。
- 縮圖用 **R2 逐段縮圖**（每張卡片顯示該 segment 的真實畫面，便於分辨同片不同片段）；R2 無 egress 費，播放頻寬免費。
- 同一 app 內含「待校對」頁面（pipeline 校對用）。

---

## 六、成本估算

### v1 總計：$0 / 月

| 項目 | 用途 | 免費額度 | 作者用量 | 費用 |
|---|---|---|---|---|
| 本機 whisper.cpp | STT | 本機無限 | 500 支 | $0（電費可忽略） |
| Gemini Flash | 視覺分析 + 查詢解析 | 每日上千請求 | 一支一請求 | $0 |
| Cloudflare Workers | api | 10 萬請求/天 | 每天數百 | $0 |
| Cloudflare D1 | 資料庫 | 5GB、500萬列讀/天 | 15~30 MB | $0 |
| Cloudflare Pages | web 託管 | 幾乎無限 | 一個小站 | $0 |
| Cloudflare R2 | 逐段縮圖 | 10GB 儲存、無 egress 費 | 縮圖約 300MB | $0 |
| YouTube | 影片託管+播放 | 免費無限 | unlisted | $0 |
| 網域（選用） | 網址 | `*.pages.dev` 免費 | 免費子網域 | $0（自訂約 $10/年） |

### 隱藏成本檢查

- 本機開發連遠端 dev D1：吃讀寫額度但量極小，遠低於上限 → $0。
- Gemini 免費層資料**可能被用於改善模型**（已接受）——隱私成本，非金錢成本。
- 電費：500 支 CPU 跑 Whisper 累計數十小時，可忽略。

### 未來擴展才會產生的成本（v1 不涉及）

| 情境 | 為何可能花錢 | 節省策略 |
|---|---|---|
| 短片預覽（webm，v2） | 約 2.3GB 仍在 R2 免費 10GB 內 → $0；用 webm 而非 GIF（小 10 倍） | 超量儲存才 $0.015/GB/月，且 R2 無 egress 費 |
| 加向量搜尋（Vectorize） | 有免費額度，作者量級內仍 $0 | 超量才付費，時機很後面 |
| 開放給大量租戶 | ①統一付 Gemini 隨人數成長 ②處理後端需真機器跑 ffmpeg/Whisper（Workers 跑不動），雲端容器產生費用 | ①每租戶帶自己的免費 Gemini 金鑰 ②讓租戶用自己 PC 當處理 worker |

> 只要維持「每租戶帶自己的免費資源（YouTube 帳號 + Gemini 金鑰 + 自己 PC 處理）」的設計，
> 即使開放給很多人，中央成本仍可壓在接近 $0。

---

## 七、技術選型總表

| 模組 | 技術 | 說明 |
|---|---|---|
| Monorepo | Turborepo + pnpm workspace | TypeScript 全棧 |
| STT | whisper.cpp（medium） | 本機 CPU，Node child_process 呼叫 |
| 抽幀 | ffmpeg（場景偵測） | 控制關鍵幀數量 |
| 視覺/查詢解析 | Google Gemini Flash（免費額度） | provider 可抽換為本機 ollama |
| API | Hono | 本機 Node / Cloudflare Workers 通用 |
| ORM | Drizzle（D1 dialect） | 統一 schema 與 migrations |
| 資料庫 | Cloudflare D1 + FTS5 | v1 檢索；資料長期主體；**開發亦連遠端 dev D1**（不用本機 SQLite） |
| 物件儲存 | Cloudflare R2 | 逐段縮圖（v1）；短片預覽（v2）；無 egress 費 |
| 向量（v2） | Cloudflare Vectorize | 加強語意搜尋品質 |
| 前端 | SvelteKit | 靜態輸出 → Cloudflare Pages |
| 影片託管 | YouTube（Unlisted） | 免費高畫質串流 + iframe 播放 |
| 部署/開發 | Wrangler（`--remote --env dev`） | 連遠端 dev 資料庫開發 |

---

## 八、範圍界定

### v1（本規格範圍）

- 單租戶（作者本人），無帳號/登入。
- 本機 pipeline CLI（STT + 抽幀 + Gemini + 章節草稿 + 斷點續跑）。
- 本機校對網頁（貼 YouTube ID + 確認日期/summary/實體）。
- Cloudflare 上的 api（Hono + D1 FTS5 + R2 縮圖）+ web（SvelteKit）。
- 逐段縮圖（R2）：每張結果卡片顯示該片段的真實畫面。
- 自然語言查詢 + 秒數跳轉播放。
- 全程 $0。

### 明確排除（未來版本）

- 帳號系統 / 多使用者登入。
- YouTube 自動上傳（YouTube Data API + OAuth）。
- 向量搜尋（Vectorize）。
- 手機 App。
- 雲端處理後端（讓 pipeline 上雲）。
- 短片預覽（hover 播放的無聲 webm 循環，取代靜態縮圖）——存 R2。
- 本機 GPU 視覺（ollama）——待硬體升級。

---

## 九、待實作時確認的開放項目

- whisper.cpp 的 Node 綁定選型（`nodejs-whisper` 包裝 vs 直接呼叫編譯好的 binary）。
- ffmpeg 場景偵測門檻值（scene threshold）與每片關鍵幀上限的預設值。
- Gemini 視覺 prompt 的具體格式（畫面描述 + 實體建議的輸出 schema）。
- FTS5 中文斷詞策略（unicode61 tokenizer vs 自訂）——影響中文全文檢索品質。
- `/search` 相關度排序公式（FTS rank + entity 命中 + 日期權重）。
