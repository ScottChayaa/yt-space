# yt-space Clip — 第一階段：UI/UX 原型 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一個手機優先、完全可操作的 SvelteKit PWA 原型 —— 四個畫面、全部互動、標記與校對流程可跑通，資料層為記憶體 mock，Playwright E2E 全綠。

**Architecture:** 單一 SvelteKit 專案，`+server.ts` 即 API。資料存取一律經過 `Repo` 介面，第一階段掛 `mock` 實作（記憶體 + 種子資料），第二階段換上 `d1` 實作時 UI 不需修改任何一行。YouTube 播放器封裝成單一元件，測試環境走 fake 分支以確保 E2E 離線且穩定。

**Tech Stack:** SvelteKit 2 + Svelte 5（runes）、TypeScript、Vite、Vitest（單元）、Playwright（E2E）、`@sveltejs/adapter-cloudflare`、pnpm。無 CSS 框架，使用原生 CSS 變數。

**規格來源：** [`docs/superpowers/specs/2026-08-07-yt-space-clip-design.md`](../specs/2026-08-07-yt-space-clip-design.md)

## Global Constraints

- **Svelte 5 runes 語法**：`$state()` / `$derived()` / `$props()` / `$effect()` / `$bindable()`。事件用屬性式 `onclick={...}`，**不可用** `on:click`。不可用 `export let`、`$:`、`<slot>`、`createEventDispatcher`。
- **手機優先**：所有版面以 393×852（Pixel 7）為基準設計。**第一階段不做桌機版面。**
- **繁體中文 UI**：所有使用者可見文字一律繁體中文。
- **`owner_id` 貫穿全部資料存取**：每個 Repo 方法第一個參數都是 `ownerId`。第一階段固定為常數 `DEV_OWNER_ID = 'dev@local'`（第二階段改由 Cloudflare Access JWT 提供）。
- **預設標記區間**：起 = `max(0, t - markBeforeSec)`，迄 = `min(duration, t + markAfterSec)`。預設 `markBeforeSec = 20`、`markAfterSec = 10`，可在設定頁調整。
- **日期格式**：`event_date`、`published_at` 一律 `YYYY-MM-DD` 字串。`createdAt` 為 ISO 8601 字串。
- **不得引入付費 Cloudflare 服務**：不使用 Queues、Durable Objects、Browser Rendering。
- **每個任務結束必須 commit**，commit message 用繁體中文，格式 `<type>: <描述>`。**不加 Co-Authored-By trailer。**

---

## 檔案結構

第一階段結束時的專案樣貌。每個檔案的職責已預先劃定，任務即依此拆分。

```
yt-space/
├── package.json                       依賴與 scripts
├── svelte.config.js                   adapter-cloudflare
├── vite.config.ts                     SvelteKit plugin + vitest 設定
├── tsconfig.json
├── playwright.config.ts               預設 viewport = Pixel 7
├── static/
│   ├── manifest.webmanifest           PWA manifest（含 share_target 宣告）
│   └── icons/icon-192.png, icon-512.png
├── src/
│   ├── app.html
│   ├── app.css                        CSS 變數、reset、手機基準版面
│   ├── lib/
│   │   ├── constants.ts               DEV_OWNER_ID、預設設定值
│   │   ├── types.ts                   全部共用型別（單一真實來源）
│   │   ├── time.ts                    秒數 ↔ mm:ss、區間計算（純函式）
│   │   ├── storyboard.ts              storyboard spec 解析與取格座標（純函式）
│   │   ├── server/repo/
│   │   │   ├── types.ts               Repo 介面與輸入型別
│   │   │   ├── mock.ts                記憶體實作 + 種子資料
│   │   │   └── index.ts               依 DATA_SOURCE 選擇實作
│   │   └── components/
│   │       ├── BottomNav.svelte       底部導覽列
│   │       ├── Player.svelte          YouTube iframe 封裝（含 fake 測試分支）
│   │       ├── Thumb.svelte           storyboard 切格 / 封面 fallback
│   │       ├── Timeline.svelte        時間軸 + 已標記區塊
│   │       ├── ClipRow.svelte         工作台的 clip 列表項
│   │       ├── ClipSheet.svelte       bottom sheet 編輯面板
│   │       ├── TagChip.svelte         tag chip（ai 虛線 / human 實線）
│   │       └── ResultCard.svelte      檢索結果卡片（含就地播放）
│   └── routes/
│       ├── +layout.svelte             BottomNav + 全域告警橫幅
│       ├── +page.svelte               檢索
│       ├── +page.server.ts
│       ├── inbox/+page.svelte
│       ├── inbox/+page.server.ts
│       ├── v/[videoId]/+page.svelte    工作台（核心畫面）
│       ├── v/[videoId]/+page.server.ts
│       ├── settings/+page.svelte
│       ├── settings/+page.server.ts
│       └── api/
│           ├── clips/+server.ts        POST 建立、GET 列表
│           ├── clips/[id]/+server.ts   PATCH 更新、DELETE 刪除
│           ├── search/+server.ts       GET 檢索
│           └── settings/+server.ts     PATCH 更新設定
└── tests/e2e/
    ├── smoke.spec.ts
    ├── nav.spec.ts
    ├── mark.spec.ts
    ├── review.spec.ts
    └── search.spec.ts
```

---

## Task 1: 專案骨架與工具鏈

**Files:**
- Create: `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `playwright.config.ts`
- Create: `src/app.html`, `src/app.css`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`
- Modify: `.gitignore`
- Test: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: 無（第一個任務）
- Produces: 可執行的 `pnpm dev` / `pnpm build` / `pnpm test:e2e` / `pnpm test:unit`；`$lib` alias 指向 `src/lib`

- [ ] **Step 1: 建立 package.json 並安裝依賴**

```bash
cd D:/MyDocument/Git/GitHub/yt-space
pnpm init
pnpm add -D @sveltejs/kit @sveltejs/vite-plugin-svelte @sveltejs/adapter-cloudflare svelte svelte-check typescript@^5 vite vitest @playwright/test
pnpm exec playwright install chromium
pnpm approve-builds --all
```

> `typescript@^5` 必須鎖版：不鎖會裝到 TypeScript 7（原生編譯器版），
> 與 `svelte-check` 4.x 不相容。
> `pnpm approve-builds` 是 pnpm 10 必要步驟，否則 esbuild 與 workerd 的
> postinstall 不會執行。

- [ ] **Step 2: 寫入 package.json 的 scripts 與 type**

把 `package.json` 的內容改成（保留 `pnpm add` 產生的 `devDependencies` 版本號，只覆寫下列欄位）：

```json
{
  "name": "yt-space",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: 建立 svelte.config.js**

```js
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};
```

- [ ] **Step 4: 建立 vite.config.ts**

> `defineConfig` 必須從 `vitest/config` 匯入而非 `vite` —— Vite 自己的 `defineConfig`
> 型別不含 `test` 欄位，用它會讓 `pnpm check` 報型別錯誤。

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
```

- [ ] **Step 5: 建立 tsconfig.json**

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
}
```

- [ ] **Step 6: 建立 src/app.html**

```html
<!doctype html>
<html lang="zh-Hant">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
		<meta name="theme-color" content="#111318" />
		<link rel="manifest" href="%sveltekit.assets%/manifest.webmanifest" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

- [ ] **Step 7: 建立 src/app.css**

```css
:root {
	--bg: #111318;
	--surface: #1b1e25;
	--surface-2: #242832;
	--border: #333846;
	--text: #e6e8ee;
	--text-dim: #9aa1b1;
	--accent: #4c8dff;
	--danger: #ff5f57;
	--warn: #ffb020;
	--ok: #3ddc84;
	--nav-h: 56px;
	--radius: 12px;
}

* {
	box-sizing: border-box;
}

html,
body {
	margin: 0;
	padding: 0;
	background: var(--bg);
	color: var(--text);
	font-family: system-ui, -apple-system, 'Noto Sans TC', sans-serif;
	-webkit-tap-highlight-color: transparent;
}

button {
	font: inherit;
	color: inherit;
	background: var(--surface-2);
	border: 1px solid var(--border);
	border-radius: var(--radius);
	padding: 0.5rem 0.75rem;
	cursor: pointer;
}

input,
textarea {
	font: inherit;
	color: inherit;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: 8px;
	padding: 0.5rem;
	width: 100%;
}

.app-main {
	padding-bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
	min-height: 100dvh;
}
```

- [ ] **Step 8: 建立最小 +layout.svelte 與 +page.svelte**

`src/routes/+layout.svelte`：

```svelte
<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<main class="app-main">
	{@render children()}
</main>
```

`src/routes/+page.svelte`：

```svelte
<h1 data-testid="home-title">yt-space</h1>
```

- [ ] **Step 9: 建立 playwright.config.ts**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	use: {
		...devices['Pixel 7'],
		baseURL: 'http://localhost:4173'
	},
	webServer: {
		command: 'pnpm build && pnpm preview --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});
```

- [ ] **Step 10: 寫失敗的 smoke 測試**

`tests/e2e/smoke.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('首頁可以載入', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByTestId('home-title')).toHaveText('yt-space');
});
```

- [ ] **Step 11: 執行測試確認通過**

Run: `pnpm test:e2e`
Expected: PASS（1 passed）

若失敗且訊息為 `.svelte-kit/tsconfig.json` 不存在，先執行 `pnpm exec svelte-kit sync` 再重跑。

- [ ] **Step 12: 更新 .gitignore**

在既有 `.gitignore` 末尾追加：

```
# Playwright
test-results/
playwright-report/
.playwright/
```

- [ ] **Step 13: Commit**

```bash
git add -A && git commit -m "chore: 建立 SvelteKit 專案骨架與測試工具鏈"
```

---

## Task 2: 共用型別與時間工具

**Files:**
- Create: `src/lib/types.ts`, `src/lib/constants.ts`, `src/lib/time.ts`
- Test: `src/lib/time.test.ts`

**Interfaces:**
- Consumes: 無
- Produces:
  - 型別 `Video`、`Clip`、`Tag`、`ClipTag`、`AiRaw`、`Settings`、`ClipStatus`、`AnalysisLevel`、`ClipOrigin`、`TagKind`、`Privacy`、`StoryboardSpec`、`StoryboardLevel`、`FramePos`、`ParsedQuery`、`PlayerApi`
  - `DEV_OWNER_ID: string`、`DEFAULT_SETTINGS: Omit<Settings, 'ownerId'>`
  - `secToMMSS(sec: number): string`
  - `mmssToSec(text: string): number | null`
  - `defaultRange(t: number, duration: number, before: number, after: number): { startSec: number; endSec: number }`
  - `shiftBoundary(value: number, delta: number, min: number, max: number): number`

- [ ] **Step 1: 建立 src/lib/types.ts**

```ts
export type ClipStatus = 'inbox' | 'analyzing' | 'analyzed' | 'reviewed' | 'failed';
export type AnalysisLevel = 'L0' | 'L2';
export type ClipOrigin = 'web' | 'share' | 'extension' | 'pipeline';
export type TagKind = 'person' | 'pet' | 'place' | 'topic' | 'other';
export type Privacy = 'public' | 'unlisted' | 'unknown';

export interface StoryboardLevel {
	level: number;
	width: number;
	height: number;
	frameCount: number;
	cols: number;
	rows: number;
	intervalMs: number;
	sigh: string;
}

export interface StoryboardSpec {
	baseUrl: string;
	sqp: string;
	levels: StoryboardLevel[];
}

export interface FramePos {
	sheetIndex: number;
	col: number;
	row: number;
	offsetX: number;
	offsetY: number;
	width: number;
	height: number;
	sheetWidth: number;
	sheetHeight: number;
}

export interface Video {
	id: string;
	ownerId: string;
	title: string;
	channelTitle: string;
	publishedAt: string;
	durationSec: number;
	privacy: Privacy;
	sbKey: string | null;
	sbSpec: StoryboardSpec | null;
}

export interface Tag {
	id: string;
	ownerId: string;
	name: string;
	kind: TagKind;
	aliases: string[];
}

export interface ClipTag {
	tag: Tag;
	source: 'ai' | 'human';
}

export interface AiRaw {
	summary: string;
	transcript: string;
	visualDesc: string;
	tags: { name: string; kind: TagKind }[];
	dateHints: string[];
}

export interface Clip {
	id: string;
	videoId: string;
	ownerId: string;
	startSec: number;
	endSec: number;
	eventDate: string;
	note: string;
	summary: string;
	transcript: string;
	visualDesc: string;
	thumbKey: string | null;
	aiRaw: AiRaw | null;
	analysisLevel: AnalysisLevel;
	status: ClipStatus;
	origin: ClipOrigin;
	createdAt: string;
	tags: ClipTag[];
}

export interface Settings {
	ownerId: string;
	markBeforeSec: number;
	markAfterSec: number;
	pauseOnMark: boolean;
}

export interface ParsedQuery {
	dateFrom: string | null;
	dateTo: string | null;
	tagNames: string[];
	keywords: string[];
}

/** Player 元件透過 onready callback 交出來的控制介面（見 Task 7）。 */
export interface PlayerApi {
	seekTo(sec: number): void;
	playRange(start: number, end: number): void;
	pause(): void;
}
```

- [ ] **Step 2: 建立 src/lib/constants.ts**

```ts
import type { Settings } from './types';

export const DEV_OWNER_ID = 'dev@local';

export const DEFAULT_SETTINGS: Omit<Settings, 'ownerId'> = {
	markBeforeSec: 20,
	markAfterSec: 10,
	pauseOnMark: false
};
```

- [ ] **Step 3: 寫失敗的 time 測試**

`src/lib/time.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { defaultRange, mmssToSec, secToMMSS, shiftBoundary } from './time';

describe('secToMMSS', () => {
	it('補零成 mm:ss', () => {
		expect(secToMMSS(0)).toBe('00:00');
		expect(secToMMSS(75)).toBe('01:15');
		expect(secToMMSS(750)).toBe('12:30');
	});

	it('超過一小時改用 h:mm:ss', () => {
		expect(secToMMSS(3661)).toBe('1:01:01');
	});

	it('負數與小數一律夾到合法值', () => {
		expect(secToMMSS(-5)).toBe('00:00');
		expect(secToMMSS(75.9)).toBe('01:15');
	});
});

describe('mmssToSec', () => {
	it('解析 mm:ss 與 h:mm:ss', () => {
		expect(mmssToSec('01:15')).toBe(75);
		expect(mmssToSec('12:30')).toBe(750);
		expect(mmssToSec('1:01:01')).toBe(3661);
	});

	it('格式錯誤回傳 null', () => {
		expect(mmssToSec('abc')).toBeNull();
		expect(mmssToSec('')).toBeNull();
		expect(mmssToSec('1:2:3:4')).toBeNull();
	});
});

describe('defaultRange', () => {
	it('以 t 為基準向前 20 秒、向後 10 秒', () => {
		expect(defaultRange(750, 1471, 20, 10)).toEqual({ startSec: 730, endSec: 760 });
	});

	it('起點不會小於 0', () => {
		expect(defaultRange(5, 1471, 20, 10)).toEqual({ startSec: 0, endSec: 15 });
	});

	it('終點不會超過影片長度', () => {
		expect(defaultRange(1468, 1471, 20, 10)).toEqual({ startSec: 1448, endSec: 1471 });
	});
});

describe('shiftBoundary', () => {
	it('位移後夾在 min 與 max 之間', () => {
		expect(shiftBoundary(100, 5, 0, 200)).toBe(105);
		expect(shiftBoundary(3, -5, 0, 200)).toBe(0);
		expect(shiftBoundary(198, 5, 0, 200)).toBe(200);
	});
});
```

- [ ] **Step 4: 執行測試確認失敗**

Run: `pnpm test:unit`
Expected: FAIL，訊息為 `Failed to resolve import "./time"`

- [ ] **Step 5: 實作 src/lib/time.ts**

```ts
export function secToMMSS(sec: number): string {
	const total = Math.max(0, Math.floor(sec));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, '0');
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function mmssToSec(text: string): number | null {
	const parts = text.trim().split(':');
	if (parts.length < 2 || parts.length > 3) return null;
	if (parts.some((p) => p === '' || !/^\d+$/.test(p))) return null;
	const nums = parts.map(Number);
	return nums.length === 3
		? nums[0] * 3600 + nums[1] * 60 + nums[2]
		: nums[0] * 60 + nums[1];
}

export function defaultRange(
	t: number,
	duration: number,
	before: number,
	after: number
): { startSec: number; endSec: number } {
	const startSec = Math.max(0, Math.round(t - before));
	const endSec = Math.min(Math.round(duration), Math.round(t + after));
	return { startSec, endSec };
}

export function shiftBoundary(value: number, delta: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value + delta));
}
```

- [ ] **Step 6: 執行測試確認通過**

Run: `pnpm test:unit`
Expected: PASS（9 passed）

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: 新增共用型別、常數與時間換算工具"
```

---

## Task 3: Storyboard 座標計算

**Files:**
- Create: `src/lib/storyboard.ts`
- Test: `src/lib/storyboard.test.ts`

**Interfaces:**
- Consumes: `StoryboardSpec`、`StoryboardLevel`、`FramePos`（Task 2）
- Produces:
  - `parseStoryboardSpec(spec: string): StoryboardSpec | null`
  - `pickLevel(spec: StoryboardSpec, preferred?: number): StoryboardLevel | null`
  - `frameAt(level: StoryboardLevel, t: number): FramePos`
  - `sheetUrl(spec: StoryboardSpec, level: StoryboardLevel, sheetIndex: number): string`

> 測試使用的 spec 字串是 2026-08-07 從真實 YouTube watch page 擷取的，見規格書第二節第 4 點。

- [ ] **Step 1: 寫失敗的測試**

`src/lib/storyboard.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { frameAt, parseStoryboardSpec, pickLevel, sheetUrl } from './storyboard';

// 實測擷取自 YouTube watch page（24 秒的 unlisted 影片）
const REAL_SPEC =
	'https://i.ytimg.com/sb/KUdmrPVssFA/storyboard3_L$L/$N.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgjTpKzTBg==' +
	'|48#27#100#10#10#0#default#rs$AOn4CLDCQG-jwLOoOGPBLaFWxpqItJgENA' +
	'|80#45#25#10#10#1000#M$M#rs$AOn4CLAdQajGjXcFllukj8IozdMskyx6Zw' +
	'|160#90#25#5#5#1000#M$M#rs$AOn4CLDDTrcJY1ywfKuJLuu2E4bctSN8og' +
	'|320#180#25#3#3#1000#M$M#rs$AOn4CLAF8rkqvc6h6mM0WUjOJy55DJC1vA';

describe('parseStoryboardSpec', () => {
	it('解析出 base URL 與四個 level', () => {
		const spec = parseStoryboardSpec(REAL_SPEC);
		expect(spec).not.toBeNull();
		expect(spec!.levels).toHaveLength(4);
		expect(spec!.sqp).toBe('-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgjTpKzTBg==');
	});

	it('L3 的參數正確', () => {
		const spec = parseStoryboardSpec(REAL_SPEC)!;
		const l3 = spec.levels[3];
		expect(l3).toEqual({
			level: 3,
			width: 320,
			height: 180,
			frameCount: 25,
			cols: 3,
			rows: 3,
			intervalMs: 1000,
			sigh: 'rs$AOn4CLAF8rkqvc6h6mM0WUjOJy55DJC1vA'
		});
	});

	it('格式不符回傳 null', () => {
		expect(parseStoryboardSpec('')).toBeNull();
		expect(parseStoryboardSpec('https://example.com/no-levels')).toBeNull();
		expect(parseStoryboardSpec('not-a-url|1#2')).toBeNull();
	});
});

describe('pickLevel', () => {
	it('預設取 level 3', () => {
		const spec = parseStoryboardSpec(REAL_SPEC)!;
		expect(pickLevel(spec)!.level).toBe(3);
	});

	it('指定的 level 不存在時退回最高可用的', () => {
		const spec = parseStoryboardSpec(REAL_SPEC)!;
		expect(pickLevel(spec, 9)!.level).toBe(3);
	});

	it('沒有任何 interval > 0 的 level 時回傳 null', () => {
		const spec = { baseUrl: 'x', sqp: '', levels: [] };
		expect(pickLevel(spec)).toBeNull();
	});
});

describe('frameAt', () => {
	const spec = parseStoryboardSpec(REAL_SPEC)!;
	const l3 = spec.levels[3]; // 320x180, 3x3, 每格 1 秒

	it('t=0 是第 0 張的左上角', () => {
		expect(frameAt(l3, 0)).toMatchObject({ sheetIndex: 0, col: 0, row: 0, offsetX: 0, offsetY: 0 });
	});

	it('t=4 是第 0 張的第 1 列第 1 欄', () => {
		expect(frameAt(l3, 4)).toMatchObject({
			sheetIndex: 0,
			col: 1,
			row: 1,
			offsetX: -320,
			offsetY: -180
		});
	});

	it('t=9 跨到第 1 張的左上角', () => {
		expect(frameAt(l3, 9)).toMatchObject({ sheetIndex: 1, col: 0, row: 0 });
	});

	it('超過 frameCount 時夾到最後一格', () => {
		expect(frameAt(l3, 9999).sheetIndex).toBe(2);
		expect(frameAt(l3, 9999).col).toBe(0);
		expect(frameAt(l3, 9999).row).toBe(2);
	});

	it('帶出整張 sheet 的尺寸供 CSS background-size 使用', () => {
		expect(frameAt(l3, 0)).toMatchObject({ sheetWidth: 960, sheetHeight: 540 });
	});
});

describe('sheetUrl', () => {
	it('把 $L 換成 level、$N 換成 M{index} 並補上 sigh', () => {
		const spec = parseStoryboardSpec(REAL_SPEC)!;
		const url = sheetUrl(spec, spec.levels[3], 1);
		expect(url).toContain('/storyboard3_L3/M1.jpg');
		expect(url).toContain('sigh=rs$AOn4CLAF8rkqvc6h6mM0WUjOJy55DJC1vA');
		expect(url).toContain('sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgjTpKzTBg==');
	});
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:unit`
Expected: FAIL，訊息為 `Failed to resolve import "./storyboard"`

- [ ] **Step 3: 實作 src/lib/storyboard.ts**

```ts
import type { FramePos, StoryboardLevel, StoryboardSpec } from './types';

export function parseStoryboardSpec(spec: string): StoryboardSpec | null {
	if (!spec) return null;
	const parts = spec.split('|');
	if (parts.length < 2) return null;

	const [urlPart, ...levelParts] = parts;
	if (!urlPart.startsWith('http')) return null;

	const sqpMatch = urlPart.match(/[?&]sqp=([^&]*)/);
	const baseUrl = urlPart.split('?')[0];

	const levels: StoryboardLevel[] = [];
	for (let i = 0; i < levelParts.length; i++) {
		const f = levelParts[i].split('#');
		if (f.length < 8) continue;
		const [width, height, frameCount, cols, rows, intervalMs] = f.slice(0, 6).map(Number);
		if ([width, height, frameCount, cols, rows, intervalMs].some(Number.isNaN)) continue;
		levels.push({
			level: i,
			width,
			height,
			frameCount,
			cols,
			rows,
			intervalMs,
			sigh: f[7]
		});
	}

	if (levels.length === 0) return null;
	return { baseUrl, sqp: sqpMatch ? sqpMatch[1] : '', levels };
}

export function pickLevel(spec: StoryboardSpec, preferred = 3): StoryboardLevel | null {
	const usable = spec.levels.filter((l) => l.intervalMs > 0 && l.cols > 0 && l.rows > 0);
	if (usable.length === 0) return null;
	return usable.find((l) => l.level === preferred) ?? usable[usable.length - 1];
}

export function frameAt(level: StoryboardLevel, t: number): FramePos {
	const perSheet = level.cols * level.rows;
	const raw = Math.floor(Math.max(0, t) / (level.intervalMs / 1000));
	const frameIndex = Math.min(raw, level.frameCount - 1);
	const sheetIndex = Math.floor(frameIndex / perSheet);
	const posInSheet = frameIndex % perSheet;
	const col = posInSheet % level.cols;
	const row = Math.floor(posInSheet / level.cols);

	return {
		sheetIndex,
		col,
		row,
		offsetX: -col * level.width,
		offsetY: -row * level.height,
		width: level.width,
		height: level.height,
		sheetWidth: level.cols * level.width,
		sheetHeight: level.rows * level.height
	};
}

export function sheetUrl(
	spec: StoryboardSpec,
	level: StoryboardLevel,
	sheetIndex: number
): string {
	const path = spec.baseUrl.replace('$L', String(level.level)).replace('$N', `M${sheetIndex}`);
	return `${path}?sqp=${spec.sqp}&sigh=${level.sigh}`;
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `pnpm test:unit`
Expected: PASS（全部 unit 測試通過）

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: 新增 storyboard spec 解析與取格座標計算"
```

---

## Task 4: Repo 介面與 mock 實作

**Files:**
- Create: `src/lib/server/repo/types.ts`, `src/lib/server/repo/mock.ts`, `src/lib/server/repo/index.ts`
- Test: `src/lib/server/repo/mock.test.ts`

**Interfaces:**
- Consumes: 全部型別（Task 2）、`DEV_OWNER_ID`、`DEFAULT_SETTINGS`（Task 2）
- Produces:
  - `interface Repo`（見下方 Step 1 的完整簽章）
  - `CreateClipInput`、`UpdateClipPatch`、`SearchQuery`、`SearchResult`
  - `getRepo(): Repo` —— 依 `DATA_SOURCE` 選擇實作，第一階段永遠回傳 mock

- [ ] **Step 1: 建立 src/lib/server/repo/types.ts**

```ts
import type { Clip, ClipOrigin, ParsedQuery, Settings, Tag, Video } from '$lib/types';

export interface CreateClipInput {
	ownerId: string;
	videoId: string;
	startSec: number;
	endSec: number;
	note?: string;
	origin: ClipOrigin;
}

export interface UpdateClipPatch {
	startSec?: number;
	endSec?: number;
	eventDate?: string;
	note?: string;
	summary?: string;
	transcript?: string;
	visualDesc?: string;
	status?: Clip['status'];
	tagIds?: string[];
}

export interface SearchQuery {
	text?: string;
	dateFrom?: string;
	dateTo?: string;
	tagIds?: string[];
}

export interface SearchResult {
	clips: Clip[];
	parsed: ParsedQuery;
}

export interface Repo {
	getVideo(ownerId: string, videoId: string): Promise<Video | null>;
	listClipsByVideo(ownerId: string, videoId: string): Promise<Clip[]>;
	listInbox(ownerId: string): Promise<Clip[]>;
	getClip(ownerId: string, clipId: string): Promise<Clip | null>;
	createClip(input: CreateClipInput): Promise<Clip>;
	updateClip(ownerId: string, clipId: string, patch: UpdateClipPatch): Promise<Clip>;
	deleteClip(ownerId: string, clipId: string): Promise<void>;
	searchClips(ownerId: string, query: SearchQuery): Promise<SearchResult>;
	listTags(ownerId: string): Promise<Tag[]>;
	getSettings(ownerId: string): Promise<Settings>;
	updateSettings(ownerId: string, patch: Partial<Settings>): Promise<Settings>;
}
```

- [ ] **Step 2: 寫失敗的 mock repo 測試**

`src/lib/server/repo/mock.test.ts`：

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { DEV_OWNER_ID } from '$lib/constants';
import { MockRepo } from './mock';

let repo: MockRepo;

beforeEach(() => {
	repo = new MockRepo();
});

describe('種子資料', () => {
	it('至少有一支影片與數個 clip', async () => {
		const video = await repo.getVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		expect(video).not.toBeNull();
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		expect(clips.length).toBeGreaterThanOrEqual(2);
	});

	it('影片帶有可解析的 storyboard spec', async () => {
		const video = await repo.getVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		expect(video!.sbSpec).not.toBeNull();
		expect(video!.sbSpec!.levels.length).toBeGreaterThan(0);
	});
});

describe('owner 隔離', () => {
	it('別的 owner 讀不到資料', async () => {
		expect(await repo.getVideo('other@x', 'KUdmrPVssFA')).toBeNull();
		expect(await repo.listClipsByVideo('other@x', 'KUdmrPVssFA')).toEqual([]);
		expect(await repo.listInbox('other@x')).toEqual([]);
	});
});

describe('createClip', () => {
	it('建立後可從該影片的列表讀到，狀態為 inbox', async () => {
		const clip = await repo.createClip({
			ownerId: DEV_OWNER_ID,
			videoId: 'KUdmrPVssFA',
			startSec: 3,
			endSec: 13,
			note: '測試',
			origin: 'web'
		});
		expect(clip.status).toBe('inbox');
		expect(clip.analysisLevel).toBe('L0');
		expect(clip.tags).toEqual([]);
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		expect(clips.map((c) => c.id)).toContain(clip.id);
	});

	it('event_date 預設等於影片上傳日', async () => {
		const video = await repo.getVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		const clip = await repo.createClip({
			ownerId: DEV_OWNER_ID,
			videoId: 'KUdmrPVssFA',
			startSec: 0,
			endSec: 10,
			origin: 'web'
		});
		expect(clip.eventDate).toBe(video!.publishedAt);
	});

	it('列表依 startSec 排序', async () => {
		await repo.createClip({
			ownerId: DEV_OWNER_ID,
			videoId: 'KUdmrPVssFA',
			startSec: 1,
			endSec: 5,
			origin: 'web'
		});
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		const starts = clips.map((c) => c.startSec);
		expect([...starts].sort((a, b) => a - b)).toEqual(starts);
	});
});

describe('updateClip', () => {
	it('可修改 summary 與 status', async () => {
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		const updated = await repo.updateClip(DEV_OWNER_ID, clips[0].id, {
			summary: '改過的摘要',
			status: 'reviewed'
		});
		expect(updated.summary).toBe('改過的摘要');
		expect(updated.status).toBe('reviewed');
	});

	it('用 tagIds 改標籤時，來源標記為 human', async () => {
		const tags = await repo.listTags(DEV_OWNER_ID);
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		const updated = await repo.updateClip(DEV_OWNER_ID, clips[0].id, {
			tagIds: [tags[0].id]
		});
		expect(updated.tags).toHaveLength(1);
		expect(updated.tags[0].source).toBe('human');
		expect(updated.tags[0].tag.id).toBe(tags[0].id);
	});

	it('別的 owner 更新會拋錯', async () => {
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		await expect(repo.updateClip('other@x', clips[0].id, { note: 'x' })).rejects.toThrow();
	});
});

describe('listInbox', () => {
	it('只回傳尚未 reviewed 的 clip', async () => {
		const before = await repo.listInbox(DEV_OWNER_ID);
		await repo.updateClip(DEV_OWNER_ID, before[0].id, { status: 'reviewed' });
		const after = await repo.listInbox(DEV_OWNER_ID);
		expect(after.length).toBe(before.length - 1);
		expect(after.every((c) => c.status !== 'reviewed')).toBe(true);
	});
});

describe('searchClips', () => {
	it('只回傳 reviewed 的 clip', async () => {
		const result = await repo.searchClips(DEV_OWNER_ID, {});
		expect(result.clips.every((c) => c.status === 'reviewed')).toBe(true);
	});

	it('文字比對涵蓋 note、summary、transcript、visualDesc', async () => {
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		await repo.updateClip(DEV_OWNER_ID, clips[0].id, {
			summary: '獨特關鍵字ABC',
			status: 'reviewed'
		});
		const result = await repo.searchClips(DEV_OWNER_ID, { text: '獨特關鍵字ABC' });
		expect(result.clips).toHaveLength(1);
	});

	it('日期區間可過濾', async () => {
		const result = await repo.searchClips(DEV_OWNER_ID, {
			dateFrom: '1900-01-01',
			dateTo: '1900-12-31'
		});
		expect(result.clips).toHaveLength(0);
	});

	it('回傳 parsed 讓 UI 顯示「聽懂了」', async () => {
		const result = await repo.searchClips(DEV_OWNER_ID, { text: '露營' });
		expect(result.parsed).toHaveProperty('keywords');
		expect(result.parsed.keywords).toContain('露營');
	});
});

describe('settings', () => {
	it('預設值為 20 / 10 / 不暫停', async () => {
		const s = await repo.getSettings(DEV_OWNER_ID);
		expect(s.markBeforeSec).toBe(20);
		expect(s.markAfterSec).toBe(10);
		expect(s.pauseOnMark).toBe(false);
	});

	it('可更新且會保留未指定的欄位', async () => {
		const s = await repo.updateSettings(DEV_OWNER_ID, { markBeforeSec: 30 });
		expect(s.markBeforeSec).toBe(30);
		expect(s.markAfterSec).toBe(10);
	});
});
```

- [ ] **Step 3: 執行測試確認失敗**

Run: `pnpm test:unit`
Expected: FAIL，訊息為 `Failed to resolve import "./mock"`

- [ ] **Step 4: 實作 src/lib/server/repo/mock.ts**

```ts
import { DEFAULT_SETTINGS, DEV_OWNER_ID } from '$lib/constants';
import { parseStoryboardSpec } from '$lib/storyboard';
import type { Clip, Settings, Tag, Video } from '$lib/types';
import type {
	CreateClipInput,
	Repo,
	SearchQuery,
	SearchResult,
	UpdateClipPatch
} from './types';

const SEED_SB_SPEC =
	'https://i.ytimg.com/sb/KUdmrPVssFA/storyboard3_L$L/$N.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgjTpKzTBg==' +
	'|48#27#100#10#10#0#default#rs$AOn4CLDCQG-jwLOoOGPBLaFWxpqItJgENA' +
	'|80#45#25#10#10#1000#M$M#rs$AOn4CLAdQajGjXcFllukj8IozdMskyx6Zw' +
	'|160#90#25#5#5#1000#M$M#rs$AOn4CLDDTrcJY1ywfKuJLuu2E4bctSN8og' +
	'|320#180#25#3#3#1000#M$M#rs$AOn4CLAF8rkqvc6h6mM0WUjOJy55DJC1vA';

let counter = 0;
const nextId = (prefix: string) => `${prefix}_${++counter}`;

function seedVideos(): Video[] {
	return [
		{
			id: 'KUdmrPVssFA',
			ownerId: DEV_OWNER_ID,
			title: '20260726 家庭聚會',
			channelTitle: 'Scott Lin',
			publishedAt: '2026-07-26',
			durationSec: 24,
			privacy: 'unlisted',
			sbKey: 'sb/KUdmrPVssFA',
			sbSpec: parseStoryboardSpec(SEED_SB_SPEC)
		},
		{
			id: 'dQw4w9WgXcQ',
			ownerId: DEV_OWNER_ID,
			title: '宜蘭兩天一夜',
			channelTitle: '阿明的頻道',
			publishedAt: '2025-07-15',
			durationSec: 1471,
			privacy: 'public',
			sbKey: null,
			sbSpec: null
		}
	];
}

function seedTags(): Tag[] {
	return [
		{ id: 'tag_a', ownerId: DEV_OWNER_ID, name: '阿明', kind: 'person', aliases: ['明哥'] },
		{ id: 'tag_b', ownerId: DEV_OWNER_ID, name: '宜蘭', kind: 'place', aliases: [] },
		{ id: 'tag_c', ownerId: DEV_OWNER_ID, name: '露營', kind: 'topic', aliases: [] },
		{ id: 'tag_d', ownerId: DEV_OWNER_ID, name: '家庭聚會', kind: 'topic', aliases: [] }
	];
}

function seedClips(tags: Tag[]): Clip[] {
	const base = {
		ownerId: DEV_OWNER_ID,
		thumbKey: null,
		aiRaw: null,
		origin: 'web' as const,
		createdAt: '2026-08-01T10:00:00.000Z'
	};
	return [
		{
			...base,
			id: 'clip_seed_1',
			videoId: 'dQw4w9WgXcQ',
			startSec: 312,
			endSec: 342,
			eventDate: '2025-07-12',
			note: '搭帳篷',
			summary: '一群人在營地手忙腳亂地搭帳篷',
			transcript: '這個角要先拉起來啦',
			visualDesc: '草地上三個人合力撐起一頂綠色帳篷',
			analysisLevel: 'L2',
			status: 'reviewed',
			tags: [
				{ tag: tags[0], source: 'ai' },
				{ tag: tags[1], source: 'human' },
				{ tag: tags[2], source: 'human' }
			]
		},
		{
			...base,
			id: 'clip_seed_2',
			videoId: 'dQw4w9WgXcQ',
			startSec: 750,
			endSec: 780,
			eventDate: '2025-07-12',
			note: '阿明跌倒',
			summary: '阿明在溪邊踩滑跌進水裡',
			transcript: '啊啊啊小心',
			visualDesc: '溪流旁的石頭上有人失去平衡',
			analysisLevel: 'L2',
			status: 'analyzed',
			tags: [
				{ tag: tags[0], source: 'ai' },
				{ tag: tags[1], source: 'ai' }
			]
		},
		{
			...base,
			id: 'clip_seed_3',
			videoId: 'KUdmrPVssFA',
			startSec: 2,
			endSec: 12,
			eventDate: '2026-07-26',
			note: '',
			summary: '',
			transcript: '',
			visualDesc: '',
			analysisLevel: 'L0',
			status: 'inbox',
			tags: []
		},
		{
			...base,
			id: 'clip_seed_4',
			videoId: 'KUdmrPVssFA',
			startSec: 14,
			endSec: 24,
			eventDate: '2026-07-26',
			note: '大合照那段',
			summary: '',
			transcript: '',
			visualDesc: '',
			analysisLevel: 'L0',
			status: 'inbox',
			tags: []
		}
	];
}

export class MockRepo implements Repo {
	private videos: Video[];
	private tags: Tag[];
	private clips: Clip[];
	private settings: Map<string, Settings>;

	constructor() {
		this.videos = seedVideos();
		this.tags = seedTags();
		this.clips = seedClips(this.tags);
		this.settings = new Map();
	}

	async getVideo(ownerId: string, videoId: string): Promise<Video | null> {
		return this.videos.find((v) => v.ownerId === ownerId && v.id === videoId) ?? null;
	}

	async listClipsByVideo(ownerId: string, videoId: string): Promise<Clip[]> {
		return this.clips
			.filter((c) => c.ownerId === ownerId && c.videoId === videoId)
			.sort((a, b) => a.startSec - b.startSec);
	}

	async listInbox(ownerId: string): Promise<Clip[]> {
		return this.clips
			.filter((c) => c.ownerId === ownerId && c.status !== 'reviewed')
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}

	async getClip(ownerId: string, clipId: string): Promise<Clip | null> {
		return this.clips.find((c) => c.ownerId === ownerId && c.id === clipId) ?? null;
	}

	async createClip(input: CreateClipInput): Promise<Clip> {
		const video = await this.getVideo(input.ownerId, input.videoId);
		if (!video) throw new Error(`找不到影片 ${input.videoId}`);

		const clip: Clip = {
			id: nextId('clip'),
			videoId: input.videoId,
			ownerId: input.ownerId,
			startSec: input.startSec,
			endSec: input.endSec,
			eventDate: video.publishedAt,
			note: input.note ?? '',
			summary: '',
			transcript: '',
			visualDesc: '',
			thumbKey: null,
			aiRaw: null,
			analysisLevel: 'L0',
			status: 'inbox',
			origin: input.origin,
			createdAt: new Date().toISOString(),
			tags: []
		};
		this.clips.push(clip);
		return clip;
	}

	async updateClip(ownerId: string, clipId: string, patch: UpdateClipPatch): Promise<Clip> {
		const clip = this.clips.find((c) => c.ownerId === ownerId && c.id === clipId);
		if (!clip) throw new Error(`找不到 clip ${clipId}`);

		const { tagIds, ...fields } = patch;
		Object.assign(clip, fields);

		if (tagIds) {
			clip.tags = tagIds
				.map((id) => this.tags.find((t) => t.ownerId === ownerId && t.id === id))
				.filter((t): t is Tag => Boolean(t))
				.map((tag) => ({ tag, source: 'human' as const }));
		}
		return clip;
	}

	async deleteClip(ownerId: string, clipId: string): Promise<void> {
		this.clips = this.clips.filter((c) => !(c.ownerId === ownerId && c.id === clipId));
	}

	async searchClips(ownerId: string, query: SearchQuery): Promise<SearchResult> {
		const text = query.text?.trim() ?? '';
		const clips = this.clips.filter((c) => {
			if (c.ownerId !== ownerId || c.status !== 'reviewed') return false;
			if (query.dateFrom && c.eventDate < query.dateFrom) return false;
			if (query.dateTo && c.eventDate > query.dateTo) return false;
			if (query.tagIds?.length) {
				const ids = c.tags.map((t) => t.tag.id);
				if (!query.tagIds.every((id) => ids.includes(id))) return false;
			}
			if (text) {
				const haystack = [c.note, c.summary, c.transcript, c.visualDesc].join(' ');
				if (!haystack.includes(text)) return false;
			}
			return true;
		});

		return {
			clips: clips.sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
			parsed: {
				dateFrom: query.dateFrom ?? null,
				dateTo: query.dateTo ?? null,
				tagNames: (query.tagIds ?? [])
					.map((id) => this.tags.find((t) => t.id === id)?.name)
					.filter((n): n is string => Boolean(n)),
				keywords: text ? [text] : []
			}
		};
	}

	async listTags(ownerId: string): Promise<Tag[]> {
		return this.tags.filter((t) => t.ownerId === ownerId);
	}

	async getSettings(ownerId: string): Promise<Settings> {
		const existing = this.settings.get(ownerId);
		if (existing) return existing;
		const created: Settings = { ownerId, ...DEFAULT_SETTINGS };
		this.settings.set(ownerId, created);
		return created;
	}

	async updateSettings(ownerId: string, patch: Partial<Settings>): Promise<Settings> {
		const current = await this.getSettings(ownerId);
		const updated = { ...current, ...patch, ownerId };
		this.settings.set(ownerId, updated);
		return updated;
	}
}
```

- [ ] **Step 5: 實作 src/lib/server/repo/index.ts**

```ts
import { MockRepo } from './mock';
import type { Repo } from './types';

let instance: Repo | null = null;

export function getRepo(): Repo {
	if (!instance) {
		instance = new MockRepo();
	}
	return instance;
}

export type { Repo } from './types';
```

- [ ] **Step 6: 執行測試確認通過**

Run: `pnpm test:unit`
Expected: PASS（全部通過）

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: 新增 Repo 介面與記憶體 mock 實作"
```

---

## Task 5: 版面骨架與底部導覽

**Files:**
- Create: `src/lib/components/BottomNav.svelte`
- Modify: `src/routes/+layout.svelte`
- Create: `src/routes/inbox/+page.svelte`, `src/routes/v/[videoId]/+page.svelte`, `src/routes/settings/+page.svelte`
- Modify: `src/routes/+page.svelte`
- Test: `tests/e2e/nav.spec.ts`

**Interfaces:**
- Consumes: 無
- Produces: 四條可導航的路由；每頁有 `data-testid="page-{name}"` 供測試定位

- [ ] **Step 1: 寫失敗的導航測試**

`tests/e2e/nav.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('底部導覽可在三個主要畫面間切換', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByTestId('page-search')).toBeVisible();

	await page.getByTestId('nav-inbox').click();
	await expect(page.getByTestId('page-inbox')).toBeVisible();

	await page.getByTestId('nav-settings').click();
	await expect(page.getByTestId('page-settings')).toBeVisible();

	await page.getByTestId('nav-search').click();
	await expect(page.getByTestId('page-search')).toBeVisible();
});

test('工作台路由可直接開啟', async ({ page }) => {
	await page.goto('/v/KUdmrPVssFA');
	await expect(page.getByTestId('page-studio')).toBeVisible();
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:e2e tests/e2e/nav.spec.ts`
Expected: FAIL，找不到 `page-search`

- [ ] **Step 3: 建立 BottomNav.svelte**

```svelte
<script lang="ts">
	import { page } from '$app/state';

	const items = [
		{ href: '/', label: '檢索', icon: '🔍', testid: 'nav-search' },
		{ href: '/inbox', label: 'Inbox', icon: '📥', testid: 'nav-inbox' },
		{ href: '/settings', label: '設定', icon: '⚙', testid: 'nav-settings' }
	];

	const current = $derived(page.url.pathname);
</script>

<nav>
	{#each items as item (item.href)}
		<a
			href={item.href}
			data-testid={item.testid}
			class:active={current === item.href}
			aria-current={current === item.href ? 'page' : undefined}
		>
			<span class="icon">{item.icon}</span>
			<span class="label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: calc(var(--nav-h) + env(safe-area-inset-bottom));
		padding-bottom: env(safe-area-inset-bottom);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		background: var(--surface);
		border-top: 1px solid var(--border);
		z-index: 50;
	}

	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		color: var(--text-dim);
		text-decoration: none;
		font-size: 0.7rem;
	}

	a.active {
		color: var(--accent);
	}

	.icon {
		font-size: 1.15rem;
	}
</style>
```

- [ ] **Step 4: 更新 +layout.svelte 掛上導覽**

```svelte
<script lang="ts">
	import '../app.css';
	import BottomNav from '$lib/components/BottomNav.svelte';
	let { children } = $props();
</script>

<main class="app-main">
	{@render children()}
</main>

<BottomNav />
```

- [ ] **Step 5: 建立四個頁面的骨架**

`src/routes/+page.svelte`：

```svelte
<section data-testid="page-search">
	<h1>檢索</h1>
</section>
```

`src/routes/inbox/+page.svelte`：

```svelte
<section data-testid="page-inbox">
	<h1>Inbox</h1>
</section>
```

`src/routes/settings/+page.svelte`：

```svelte
<section data-testid="page-settings">
	<h1>設定</h1>
</section>
```

`src/routes/v/[videoId]/+page.svelte`：

```svelte
<section data-testid="page-studio">
	<h1>工作台</h1>
</section>
```

- [ ] **Step 6: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/nav.spec.ts`
Expected: PASS（2 passed）

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: 新增底部導覽與四條路由骨架"
```

---

## Task 6: Thumb 元件（storyboard 切格）

**Files:**
- Create: `src/lib/components/Thumb.svelte`
- Test: 由 Task 8 的工作台 E2E 涵蓋（元件無獨立行為可測）

**Interfaces:**
- Consumes: `frameAt`、`pickLevel`、`sheetUrl`（Task 3）、`Video`（Task 2）
- Produces: `<Thumb {video} t={seconds} width={px} />` —— 有 `sbSpec` 時顯示該秒的 storyboard 格，否則退回 `img.youtube.com` 封面

- [ ] **Step 1: 建立 Thumb.svelte**

```svelte
<script lang="ts">
	import { frameAt, pickLevel, sheetUrl } from '$lib/storyboard';
	import type { Video } from '$lib/types';

	interface Props {
		video: Video;
		t: number;
		width?: number;
	}

	let { video, t, width = 120 }: Props = $props();

	const level = $derived(video.sbSpec ? pickLevel(video.sbSpec) : null);
	const pos = $derived(level ? frameAt(level, t) : null);
	const scale = $derived(pos ? width / pos.width : 1);
	const url = $derived(
		video.sbSpec && level && pos ? sheetUrl(video.sbSpec, level, pos.sheetIndex) : null
	);
	const fallback = $derived(`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`);
</script>

{#if url && pos}
	<div
		class="thumb sb"
		data-testid="thumb-storyboard"
		style:width="{width}px"
		style:height="{pos.height * scale}px"
		style:background-image="url({url})"
		style:background-size="{pos.sheetWidth * scale}px {pos.sheetHeight * scale}px"
		style:background-position="{pos.offsetX * scale}px {pos.offsetY * scale}px"
		role="img"
		aria-label="片段畫面"
	></div>
{:else}
	<img
		class="thumb"
		data-testid="thumb-cover"
		src={fallback}
		alt="影片封面"
		style:width="{width}px"
		loading="lazy"
	/>
{/if}

<style>
	.thumb {
		border-radius: 8px;
		background-color: var(--surface-2);
		background-repeat: no-repeat;
		flex-shrink: 0;
		display: block;
	}

	img.thumb {
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}
</style>
```

- [ ] **Step 2: 執行型別檢查確認無誤**

Run: `pnpm check`
Expected: 0 errors（warnings 可接受）

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: 新增 Thumb 元件，支援 storyboard 切格與封面 fallback"
```

---

## Task 7: Player 元件（含測試用 fake 分支）

**Files:**
- Create: `src/lib/components/Player.svelte`
- Modify: `playwright.config.ts`（加入 `PUBLIC_PLAYER_MODE=fake` 環境變數）

**Interfaces:**
- Consumes: `secToMMSS`（Task 2）、`PlayerApi`（Task 2）
- Produces:
  - `<Player {videoId} bind:currentTime onready={(api) => ...} />`
  - 透過 `onready` 交出 `PlayerApi`（`seekTo` / `playRange` / `pause`）。**刻意不用 `bind:this`** —— Svelte 5 的元件實例型別在 `svelte-check` 下不穩定，callback 交接則是普通的 TypeScript 介面，零型別風險。
  - `PUBLIC_PLAYER_MODE === 'fake'` 時渲染可控的假播放器（有 `data-testid="fake-player"` 與時間輸入框），E2E 因此離線且穩定

- [ ] **Step 1: 讓 playwright 以 fake 模式啟動**

修改 `playwright.config.ts` 的 `webServer` 區塊：

```ts
	webServer: {
		command: 'pnpm build && pnpm preview --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		env: { PUBLIC_PLAYER_MODE: 'fake' }
	}
```

並在 `vite.config.ts` 之外不需要其他設定 —— SvelteKit 會把 `PUBLIC_` 前綴的變數暴露給前端。

- [ ] **Step 2: 建立 Player.svelte**

```svelte
<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { secToMMSS } from '$lib/time';
	import type { PlayerApi } from '$lib/types';

	interface Props {
		videoId: string;
		currentTime?: number;
		onready?: (api: PlayerApi) => void;
	}

	let { videoId, currentTime = $bindable(0), onready }: Props = $props();

	const isFake = env.PUBLIC_PLAYER_MODE === 'fake';

	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let ticker: ReturnType<typeof setInterval> | null = null;

	function post(func: string, args: unknown[] = []) {
		iframeEl?.contentWindow?.postMessage(
			JSON.stringify({ event: 'command', func, args }),
			'https://www.youtube.com'
		);
	}

	let endAt = $state<number | null>(null);

	function seekTo(sec: number) {
		currentTime = sec;
		if (!isFake) post('seekTo', [sec, true]);
	}

	// YouTube iframe 不提供跨域讀取時間，改以本地計時器推進，精度足以支撐標記
	// 用途；第二階段可改接 IFrame Player API。計時器按需啟動：每次 playRange 都會
	// （重新）啟動，pause 後再次 playRange 也能重新推進；fake 模式不建計時器。
	function startTicker() {
		if (isFake || ticker) return;
		ticker = setInterval(() => {
			currentTime += 0.25;
			if (endAt !== null && currentTime >= endAt) {
				pause();
				endAt = null;
			}
		}, 250);
	}

	function playRange(start: number, end: number) {
		seekTo(start);
		if (!isFake) post('playVideo');
		endAt = end;
		startTicker();
	}

	function pause() {
		if (!isFake) post('pauseVideo');
		if (ticker) clearInterval(ticker);
		ticker = null;
	}

	// 掛載後把控制介面交給父層。$effect 只跑一次即可，
	// 因此不讀取任何 reactive 值以避免重複觸發。
	$effect(() => {
		onready?.({ seekTo, playRange, pause });
	});

	// 元件卸載時清掉殘留的計時器。
	$effect(() => {
		return () => {
			if (ticker) clearInterval(ticker);
		};
	});
</script>

<div class="player">
	{#if isFake}
		<div class="fake" data-testid="fake-player">
			<div class="fake-id">{videoId}</div>
			<label>
				目前時間（秒）
				<input
					type="number"
					data-testid="fake-time"
					value={currentTime}
					oninput={(e) => (currentTime = Number(e.currentTarget.value))}
				/>
			</label>
			<div data-testid="fake-clock">{secToMMSS(currentTime)}</div>
		</div>
	{:else}
		<iframe
			bind:this={iframeEl}
			data-testid="yt-iframe"
			src="https://www.youtube.com/embed/{videoId}?enablejsapi=1&playsinline=1"
			title="YouTube 播放器"
			allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		></iframe>
	{/if}
</div>

<style>
	.player {
		position: sticky;
		top: 0;
		z-index: 20;
		background: #000;
		aspect-ratio: 16 / 9;
		width: 100%;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	.fake {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: var(--surface-2);
		font-size: 0.8rem;
	}

	.fake input {
		width: 8rem;
	}
</style>
```

- [ ] **Step 3: 執行型別檢查**

Run: `pnpm check`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: 新增 Player 元件，測試模式走可控的 fake 播放器"
```

---

## Task 8: 工作台頁面 — clip 列表與時間軸

**Files:**
- Create: `src/routes/v/[videoId]/+page.server.ts`
- Modify: `src/routes/v/[videoId]/+page.svelte`
- Create: `src/lib/components/Timeline.svelte`, `src/lib/components/ClipRow.svelte`
- Test: `tests/e2e/studio.spec.ts`

**Interfaces:**
- Consumes: `getRepo()`（Task 4）、`Player`（Task 7）、`Thumb`（Task 6）、`secToMMSS`（Task 2）
- Produces: 工作台載入 `{ video, clips, tags, settings }`；clip 列表項有 `data-testid="clip-row"`

- [ ] **Step 1: 寫失敗的測試**

`tests/e2e/studio.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('工作台顯示影片資訊與既有 clip', async ({ page }) => {
	await page.goto('/v/KUdmrPVssFA');
	await expect(page.getByTestId('video-title')).toContainText('20260726');
	await expect(page.getByTestId('video-channel')).toContainText('Scott Lin');
	await expect(page.getByTestId('clip-row')).toHaveCount(2);
});

test('clip 列表顯示時間區間', async ({ page }) => {
	await page.goto('/v/KUdmrPVssFA');
	await expect(page.getByTestId('clip-row').first()).toContainText('00:02');
	await expect(page.getByTestId('clip-row').first()).toContainText('00:12');
});

test('影片不存在時顯示 404', async ({ page }) => {
	const res = await page.goto('/v/does-not-exist');
	expect(res?.status()).toBe(404);
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:e2e tests/e2e/studio.spec.ts`
Expected: FAIL，找不到 `video-title`

- [ ] **Step 3: 建立 +page.server.ts**

```ts
import { error } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const repo = getRepo();
	const video = await repo.getVideo(DEV_OWNER_ID, params.videoId);
	if (!video) error(404, '找不到這支影片');

	return {
		video,
		clips: await repo.listClipsByVideo(DEV_OWNER_ID, params.videoId),
		tags: await repo.listTags(DEV_OWNER_ID),
		settings: await repo.getSettings(DEV_OWNER_ID)
	};
};
```

- [ ] **Step 4: 建立 Timeline.svelte**

```svelte
<script lang="ts">
	import type { Clip } from '$lib/types';

	interface Props {
		duration: number;
		clips: Clip[];
		currentTime: number;
		selectedId: string | null;
	}

	let { duration, clips, currentTime, selectedId }: Props = $props();

	const pct = (sec: number) => (duration > 0 ? (sec / duration) * 100 : 0);
</script>

<div class="timeline" data-testid="timeline">
	{#each clips as clip (clip.id)}
		<div
			class="band"
			class:selected={clip.id === selectedId}
			style:left="{pct(clip.startSec)}%"
			style:width="{Math.max(1, pct(clip.endSec - clip.startSec))}%"
		></div>
	{/each}
	<div class="playhead" style:left="{pct(currentTime)}%"></div>
</div>

<style>
	.timeline {
		position: relative;
		height: 10px;
		background: var(--surface-2);
		border-bottom: 1px solid var(--border);
	}

	.band {
		position: absolute;
		top: 0;
		bottom: 0;
		background: var(--accent);
		opacity: 0.45;
	}

	.band.selected {
		opacity: 1;
	}

	.playhead {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--text);
	}
</style>
```

- [ ] **Step 5: 建立 ClipRow.svelte**

```svelte
<script lang="ts">
	import Thumb from './Thumb.svelte';
	import { secToMMSS } from '$lib/time';
	import type { Clip, Video } from '$lib/types';

	interface Props {
		clip: Clip;
		video: Video;
		selected: boolean;
		onselect: (id: string) => void;
	}

	let { clip, video, selected, onselect }: Props = $props();

	const STATUS_LABEL: Record<Clip['status'], string> = {
		inbox: '待分析',
		analyzing: '分析中',
		analyzed: '待校對',
		reviewed: '已完成',
		failed: '分析失敗'
	};
</script>

<button
	class="row"
	class:selected
	data-testid="clip-row"
	data-clip-id={clip.id}
	onclick={() => onselect(clip.id)}
>
	<Thumb {video} t={clip.startSec} width={96} />
	<div class="meta">
		<div class="range">{secToMMSS(clip.startSec)} – {secToMMSS(clip.endSec)}</div>
		<div class="title">{clip.summary || clip.note || '(未命名)'}</div>
		<div class="status" data-status={clip.status}>{STATUS_LABEL[clip.status]}</div>
	</div>
</button>

<style>
	.row {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		width: 100%;
		text-align: left;
		padding: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
	}

	.row.selected {
		border-color: var(--accent);
	}

	.meta {
		min-width: 0;
		flex: 1;
	}

	.range {
		font-variant-numeric: tabular-nums;
		font-size: 0.8rem;
		color: var(--text-dim);
	}

	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status {
		font-size: 0.7rem;
		color: var(--text-dim);
	}

	.status[data-status='reviewed'] {
		color: var(--ok);
	}

	.status[data-status='failed'] {
		color: var(--danger);
	}
</style>
```

- [ ] **Step 6: 改寫工作台頁面**

`src/routes/v/[videoId]/+page.svelte`：

```svelte
<script lang="ts">
	import ClipRow from '$lib/components/ClipRow.svelte';
	import Player from '$lib/components/Player.svelte';
	import Timeline from '$lib/components/Timeline.svelte';
	import type { PlayerApi } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let clips = $state(data.clips);
	let selectedId = $state<string | null>(null);
	let currentTime = $state(0);
	let api = $state<PlayerApi | null>(null);

	function select(id: string) {
		selectedId = id;
		const clip = clips.find((c) => c.id === id);
		if (clip) api?.seekTo(clip.startSec);
	}
</script>

<section data-testid="page-studio">
	<Player videoId={data.video.id} bind:currentTime onready={(a) => (api = a)} />

	<Timeline duration={data.video.durationSec} {clips} {currentTime} {selectedId} />

	<header>
		<h1 data-testid="video-title">{data.video.title}</h1>
		<p data-testid="video-channel">{data.video.channelTitle} ・ {data.video.publishedAt}</p>
	</header>

	<div class="list">
		<h2>Clips ({clips.length})</h2>
		{#each clips as clip (clip.id)}
			<ClipRow {clip} video={data.video} selected={clip.id === selectedId} onselect={select} />
		{/each}
	</div>
</section>

<style>
	header {
		padding: 0.75rem;
	}

	h1 {
		font-size: 1rem;
		margin: 0 0 0.2rem;
	}

	header p {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-dim);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0 0.75rem 1rem;
	}

	h2 {
		font-size: 0.85rem;
		color: var(--text-dim);
		margin: 0.25rem 0;
	}
</style>
```

- [ ] **Step 7: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/studio.spec.ts`
Expected: PASS（3 passed）

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: 工作台顯示影片資訊、時間軸與 clip 列表"
```

---

## Task 9: 標記互動（FAB → 建立 clip）

**Files:**
- Create: `src/routes/api/clips/+server.ts`
- Modify: `src/routes/v/[videoId]/+page.svelte`
- Test: `tests/e2e/mark.spec.ts`

**Interfaces:**
- Consumes: `getRepo()`、`defaultRange`（Task 2）、`CreateClipInput`（Task 4）
- Produces: `POST /api/clips`，body `{ videoId, startSec, endSec, note?, origin }` → `201` 與建立的 `Clip` JSON

- [ ] **Step 1: 寫失敗的測試**

`tests/e2e/mark.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('按下標記此刻會依預設區間建立 clip', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await expect(page.getByTestId('clip-row')).toHaveCount(2);

	await page.getByTestId('fake-time').fill('750');
	await page.getByTestId('mark-now').click();

	await expect(page.getByTestId('clip-row')).toHaveCount(3);
	// 750 - 20 = 730 → 12:10；750 + 10 = 760 → 12:40
	await expect(page.getByTestId('clip-row').filter({ hasText: '12:10 – 12:40' })).toHaveCount(1);
});

test('起點不會小於 0', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('fake-time').fill('5');
	await page.getByTestId('mark-now').click();
	await expect(page.getByTestId('clip-row').filter({ hasText: '00:00 – 00:15' })).toHaveCount(1);
});

// 用 900（有別於前兩個測試的 750／5）避免與同一長駐 server 上累積的
// clip 撞名 —— MockRepo 是單例、e2e 全程共享狀態、無 per-test reset。
// 900 - 20 = 880 → 14:40；900 + 10 = 910 → 15:10。
test('標記後自動選中新的 clip', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('fake-time').fill('900');
	await page.getByTestId('mark-now').click();
	await expect(page.getByTestId('clip-row').filter({ hasText: '14:40 – 15:10' })).toHaveClass(
		/selected/
	);
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:e2e tests/e2e/mark.spec.ts`
Expected: FAIL，找不到 `mark-now`

- [ ] **Step 3: 建立 POST /api/clips**

`src/routes/api/clips/+server.ts`：

```ts
import { error, json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { ClipOrigin } from '$lib/types';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as {
		videoId?: string;
		startSec?: number;
		endSec?: number;
		note?: string;
		origin?: ClipOrigin;
	};

	if (!body.videoId || typeof body.startSec !== 'number' || typeof body.endSec !== 'number') {
		error(400, 'videoId、startSec、endSec 為必填');
	}
	if (body.endSec <= body.startSec) {
		error(400, 'endSec 必須大於 startSec');
	}

	const clip = await getRepo().createClip({
		ownerId: DEV_OWNER_ID,
		videoId: body.videoId,
		startSec: body.startSec,
		endSec: body.endSec,
		note: body.note ?? '',
		origin: body.origin ?? 'web'
	});

	return json(clip, { status: 201 });
};

export const GET: RequestHandler = async () => {
	return json(await getRepo().listInbox(DEV_OWNER_ID));
};
```

- [ ] **Step 4: 在工作台加上 FAB 與標記邏輯**

在 `src/routes/v/[videoId]/+page.svelte` 的 `<script>` 末尾加入：

```ts
	async function markNow() {
		const { startSec, endSec } = defaultRange(
			currentTime,
			data.video.durationSec,
			data.settings.markBeforeSec,
			data.settings.markAfterSec
		);

		const res = await fetch('/api/clips', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ videoId: data.video.id, startSec, endSec, origin: 'web' })
		});
		if (!res.ok) return;

		const clip: Clip = await res.json();
		clips = [...clips, clip].sort((a, b) => a.startSec - b.startSec);
		selectedId = clip.id;

		if (data.settings.pauseOnMark) api?.pause();
	}
```

在 `<script>` 頂部的 import 區加入：

```ts
	import { defaultRange } from '$lib/time';
	import type { Clip } from '$lib/types';
```

在 `</section>` 之前加入 FAB：

```svelte
	<button class="fab" data-testid="mark-now" onclick={markNow}>⬤ 標記此刻</button>
```

並在 `<style>` 中加入：

```css
	.fab {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + 12px);
		z-index: 40;
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
		font-weight: 600;
		padding: 0.85rem 1.5rem;
		border-radius: 999px;
		box-shadow: 0 6px 20px rgb(0 0 0 / 0.4);
	}
```

- [ ] **Step 5: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/mark.spec.ts`
Expected: PASS（3 passed）

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: 新增一鍵標記，依設定的預設區間建立 clip"
```

---

## Task 10: ClipSheet 編輯面板

**Files:**
- Create: `src/lib/components/ClipSheet.svelte`, `src/lib/components/TagChip.svelte`
- Create: `src/routes/api/clips/[id]/+server.ts`
- Modify: `src/routes/v/[videoId]/+page.svelte`
- Test: `tests/e2e/review.spec.ts`

**Interfaces:**
- Consumes: `getRepo()`、`UpdateClipPatch`（Task 4）、`secToMMSS` / `mmssToSec` / `shiftBoundary`（Task 2）
- Produces:
  - `PATCH /api/clips/[id]`，body 為 `UpdateClipPatch` → `200` 與更新後的 `Clip`
  - `DELETE /api/clips/[id]` → `204`
  - `<ClipSheet {clip} {video} {tags} onupdate={...} onclose={...} />`

- [ ] **Step 1: 寫失敗的測試**

`tests/e2e/review.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('點 clip 會打開編輯面板', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').first().click();
	await expect(page.getByTestId('clip-sheet')).toBeVisible();
	await expect(page.getByTestId('sheet-range')).toContainText('05:12');
});

test('編輯摘要後按確認，狀態變成已完成', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').filter({ hasText: '阿明' }).click();

	await page.getByTestId('field-summary').fill('阿明在溪邊滑倒摔進水裡');
	await page.getByTestId('confirm-clip').click();

	await expect(page.getByTestId('clip-sheet')).toBeHidden();
	await expect(
		page.getByTestId('clip-row').filter({ hasText: '阿明在溪邊滑倒摔進水裡' })
	).toContainText('已完成');
});

test('AI 標籤是虛線，點一下變成已確認', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').filter({ hasText: '阿明跌倒' }).click();

	const aiChip = page.getByTestId('tag-chip').filter({ hasText: '阿明' });
	await expect(aiChip).toHaveAttribute('data-source', 'ai');
	await aiChip.click();
	await expect(aiChip).toHaveAttribute('data-source', 'human');
});

test('±5s 按鈕可微調區間', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').filter({ hasText: '阿明跌倒' }).click();
	await expect(page.getByTestId('sheet-range')).toContainText('12:30 – 13:00');

	await page.getByTestId('start-minus').click();
	await expect(page.getByTestId('sheet-range')).toContainText('12:25 – 13:00');
});

test('事件日期與上傳日不同時顯示提示', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').first().click();
	// 種子資料 eventDate=2025-07-12，publishedAt=2025-07-15
	await expect(page.getByTestId('date-mismatch')).toBeVisible();
});

test('下拉把手可關閉面板', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').first().click();
	await page.getByTestId('sheet-close').click();
	await expect(page.getByTestId('clip-sheet')).toBeHidden();
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:e2e tests/e2e/review.spec.ts`
Expected: FAIL，找不到 `clip-sheet`

- [ ] **Step 3: 建立 PATCH / DELETE 端點**

`src/routes/api/clips/[id]/+server.ts`：

```ts
import { error, json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { UpdateClipPatch } from '$lib/server/repo/types';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const patch = (await request.json()) as UpdateClipPatch;

	if (
		patch.startSec !== undefined &&
		patch.endSec !== undefined &&
		patch.endSec <= patch.startSec
	) {
		error(400, 'endSec 必須大於 startSec');
	}

	try {
		return json(await getRepo().updateClip(DEV_OWNER_ID, params.id, patch));
	} catch {
		error(404, '找不到這個 clip');
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	await getRepo().deleteClip(DEV_OWNER_ID, params.id);
	return new Response(null, { status: 204 });
};
```

- [ ] **Step 4: 建立 TagChip.svelte**

```svelte
<script lang="ts">
	import type { ClipTag } from '$lib/types';

	interface Props {
		clipTag: ClipTag;
		onconfirm: (tagId: string) => void;
		onremove: (tagId: string) => void;
	}

	let { clipTag, onconfirm, onremove }: Props = $props();

	const KIND_ICON: Record<string, string> = {
		person: '👤',
		pet: '🐾',
		place: '📍',
		topic: '⌗',
		other: '⌗'
	};
</script>

<span class="chip" data-testid="tag-chip" data-source={clipTag.source}>
	<button
		class="body"
		onclick={() => onconfirm(clipTag.tag.id)}
		title={clipTag.source === 'ai' ? '點一下確認這個標籤' : '已確認'}
	>
		{KIND_ICON[clipTag.tag.kind]}
		{clipTag.tag.name}
	</button>
	<button class="x" onclick={() => onremove(clipTag.tag.id)} aria-label="移除標籤">✕</button>
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		border: 1px solid var(--border);
		overflow: hidden;
		font-size: 0.8rem;
	}

	.chip[data-source='ai'] {
		border-style: dashed;
		opacity: 0.75;
	}

	.body,
	.x {
		border: 0;
		border-radius: 0;
		background: var(--surface-2);
		padding: 0.25rem 0.5rem;
	}

	.x {
		color: var(--text-dim);
		padding-left: 0.25rem;
	}
</style>
```

- [ ] **Step 5: 建立 ClipSheet.svelte**

```svelte
<script lang="ts">
	import TagChip from './TagChip.svelte';
	import { secToMMSS, shiftBoundary } from '$lib/time';
	import type { Clip, Tag, Video } from '$lib/types';
	import type { UpdateClipPatch } from '$lib/server/repo/types';

	interface Props {
		clip: Clip;
		video: Video;
		tags: Tag[];
		currentTime: number;
		onupdate: (patch: UpdateClipPatch) => void;
		onclose: () => void;
	}

	let { clip, video, tags, currentTime, onupdate, onclose }: Props = $props();

	const dateMismatch = $derived(clip.eventDate !== video.publishedAt);
	const unusedTags = $derived(
		tags.filter((t) => !clip.tags.some((ct) => ct.tag.id === t.id))
	);

	let showRaw = $state(false);

	function moveStart(delta: number) {
		onupdate({ startSec: shiftBoundary(clip.startSec, delta, 0, clip.endSec - 1) });
	}

	function moveEnd(delta: number) {
		onupdate({ endSec: shiftBoundary(clip.endSec, delta, clip.startSec + 1, video.durationSec) });
	}

	function currentTagIds() {
		return clip.tags.map((ct) => ct.tag.id);
	}
</script>

<div class="sheet" data-testid="clip-sheet">
	<button class="handle" data-testid="sheet-close" onclick={onclose} aria-label="關閉面板"></button>

	<div class="range" data-testid="sheet-range">
		{secToMMSS(clip.startSec)} – {secToMMSS(clip.endSec)}
	</div>

	<div class="row">
		<span>起</span>
		<button onclick={() => onupdate({ startSec: Math.min(Math.round(currentTime), clip.endSec - 1) })}>
			設為目前
		</button>
		<button data-testid="start-minus" onclick={() => moveStart(-5)}>−5s</button>
		<button data-testid="start-plus" onclick={() => moveStart(5)}>+5s</button>
	</div>

	<div class="row">
		<span>迄</span>
		<button onclick={() => onupdate({ endSec: Math.max(Math.round(currentTime), clip.startSec + 1) })}>
			設為目前
		</button>
		<button data-testid="end-minus" onclick={() => moveEnd(-5)}>−5s</button>
		<button data-testid="end-plus" onclick={() => moveEnd(5)}>+5s</button>
	</div>

	<label>
		備註
		<input
			data-testid="field-note"
			value={clip.note}
			onchange={(e) => onupdate({ note: e.currentTarget.value })}
		/>
	</label>

	<label>
		摘要
		<textarea
			data-testid="field-summary"
			rows="2"
			value={clip.summary}
			onchange={(e) => onupdate({ summary: e.currentTarget.value })}
		></textarea>
	</label>

	<div class="tags">
		{#each clip.tags as ct (ct.tag.id)}
			<TagChip
				clipTag={ct}
				onconfirm={(id) => onupdate({ tagIds: [...new Set([...currentTagIds(), id])] })}
				onremove={(id) => onupdate({ tagIds: currentTagIds().filter((x) => x !== id) })}
			/>
		{/each}
		{#if unusedTags.length > 0}
			<select
				data-testid="add-tag"
				value=""
				onchange={(e) => {
					const id = e.currentTarget.value;
					if (id) onupdate({ tagIds: [...currentTagIds(), id] });
					e.currentTarget.value = '';
				}}
			>
				<option value="">＋ 加標籤</option>
				{#each unusedTags as t (t.id)}
					<option value={t.id}>{t.name}</option>
				{/each}
			</select>
		{/if}
	</div>

	<label class="date">
		日期
		<input
			type="date"
			data-testid="field-date"
			value={clip.eventDate}
			onchange={(e) => onupdate({ eventDate: e.currentTarget.value })}
		/>
		{#if dateMismatch}
			<span class="warn" data-testid="date-mismatch">⚠ 與上傳日 {video.publishedAt} 不同</span>
		{/if}
	</label>

	<button class="toggle" onclick={() => (showRaw = !showRaw)}>
		{showRaw ? '▾' : '▸'} 語音逐字 / 畫面描述
	</button>
	{#if showRaw}
		<label>
			語音逐字
			<textarea
				data-testid="field-transcript"
				rows="2"
				value={clip.transcript}
				onchange={(e) => onupdate({ transcript: e.currentTarget.value })}
			></textarea>
		</label>
		<label>
			畫面描述
			<textarea
				data-testid="field-visual"
				rows="2"
				value={clip.visualDesc}
				onchange={(e) => onupdate({ visualDesc: e.currentTarget.value })}
			></textarea>
		</label>
	{/if}

	<button class="confirm" data-testid="confirm-clip" onclick={() => onupdate({ status: 'reviewed' })}>
		✓ 確認完成
	</button>
</div>

<style>
	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
		max-height: 62dvh;
		overflow-y: auto;
		z-index: 45;
		background: var(--surface);
		border-top: 1px solid var(--border);
		border-radius: 16px 16px 0 0;
		padding: 0.5rem 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.handle {
		width: 44px;
		height: 5px;
		border-radius: 3px;
		background: var(--border);
		border: 0;
		padding: 0;
		align-self: center;
		margin-bottom: 0.25rem;
	}

	.range {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		color: var(--text-dim);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.warn {
		color: var(--warn);
		font-size: 0.75rem;
	}

	.toggle {
		align-self: flex-start;
		background: none;
		border: 0;
		padding: 0;
		color: var(--text-dim);
		font-size: 0.8rem;
	}

	.confirm {
		background: var(--ok);
		border-color: var(--ok);
		color: #06210f;
		font-weight: 600;
		padding: 0.75rem;
	}
</style>
```

- [ ] **Step 6: 把 ClipSheet 接到工作台**

在 `src/routes/v/[videoId]/+page.svelte` 的 import 區加入：

```ts
	import ClipSheet from '$lib/components/ClipSheet.svelte';
	import type { UpdateClipPatch } from '$lib/server/repo/types';
```

在 `<script>` 加入 derived 與更新函式：

```ts
	const selected = $derived(clips.find((c) => c.id === selectedId) ?? null);

	async function updateSelected(patch: UpdateClipPatch) {
		if (!selectedId) return;
		const res = await fetch(`/api/clips/${selectedId}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(patch)
		});
		if (!res.ok) return;

		const updated: Clip = await res.json();
		clips = clips
			.map((c) => (c.id === updated.id ? updated : c))
			.sort((a, b) => a.startSec - b.startSec);

		if (patch.status === 'reviewed') selectedId = null;
	}
```

在 FAB 之前加入面板：

```svelte
	{#if selected}
		<ClipSheet
			clip={selected}
			video={data.video}
			tags={data.tags}
			{currentTime}
			onupdate={updateSelected}
			onclose={() => (selectedId = null)}
		/>
	{/if}
```

- [ ] **Step 7: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/review.spec.ts`
Expected: PASS（6 passed）

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: 新增 clip 編輯面板，支援區間微調、標籤確認與校對完成"
```

---

## Task 11: Inbox 收集匣

**Files:**
- Create: `src/routes/inbox/+page.server.ts`
- Modify: `src/routes/inbox/+page.svelte`
- Test: `tests/e2e/inbox.spec.ts`

**Interfaces:**
- Consumes: `getRepo()`、`Thumb`（Task 6）、`secToMMSS`（Task 2）
- Produces: Inbox 載入 `{ groups }`，`groups` 為 `{ video: Video; clips: Clip[] }[]`

- [ ] **Step 1: 寫失敗的測試**

`tests/e2e/inbox.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('Inbox 依影片分組顯示未完成的 clip', async ({ page }) => {
	await page.goto('/inbox');
	await expect(page.getByTestId('inbox-group')).toHaveCount(2);
	await expect(page.getByTestId('inbox-group').first()).toContainText('20260726');
});

test('點 clip 會跳到該影片的工作台', async ({ page }) => {
	await page.goto('/inbox');
	await page.getByTestId('inbox-clip').first().click();
	await expect(page.getByTestId('page-studio')).toBeVisible();
});

test('全部完成後顯示空狀態', async ({ page }) => {
	await page.goto('/inbox');
	const ids = await page.getByTestId('inbox-clip').evaluateAll((els) =>
		els.map((el) => el.getAttribute('data-clip-id'))
	);
	for (const id of ids) {
		await page.request.patch(`/api/clips/${id}`, { data: { status: 'reviewed' } });
	}
	await page.goto('/inbox');
	await expect(page.getByTestId('inbox-empty')).toBeVisible();
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:e2e tests/e2e/inbox.spec.ts`
Expected: FAIL，找不到 `inbox-group`

- [ ] **Step 3: 建立 +page.server.ts**

```ts
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { Clip, Video } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const repo = getRepo();
	const clips = await repo.listInbox(DEV_OWNER_ID);

	const groups: { video: Video; clips: Clip[] }[] = [];
	for (const clip of clips) {
		let group = groups.find((g) => g.video.id === clip.videoId);
		if (!group) {
			const video = await repo.getVideo(DEV_OWNER_ID, clip.videoId);
			if (!video) continue;
			group = { video, clips: [] };
			groups.push(group);
		}
		group.clips.push(clip);
	}

	for (const g of groups) g.clips.sort((a, b) => a.startSec - b.startSec);
	return { groups };
};
```

- [ ] **Step 4: 改寫 Inbox 頁面**

`src/routes/inbox/+page.svelte`：

```svelte
<script lang="ts">
	import Thumb from '$lib/components/Thumb.svelte';
	import { secToMMSS } from '$lib/time';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const total = $derived(data.groups.reduce((n, g) => n + g.clips.length, 0));
</script>

<section data-testid="page-inbox">
	<h1>Inbox ({total})</h1>

	{#if total === 0}
		<p class="empty" data-testid="inbox-empty">目前沒有待處理的片段。</p>
	{/if}

	{#each data.groups as group (group.video.id)}
		<article data-testid="inbox-group">
			<header>
				<strong>{group.video.title}</strong>
				<span>@{group.video.channelTitle} ・ {group.clips.length} 個片段</span>
			</header>
			{#each group.clips as clip (clip.id)}
				<a
					class="clip"
					data-testid="inbox-clip"
					data-clip-id={clip.id}
					href="/v/{group.video.id}"
				>
					<Thumb video={group.video} t={clip.startSec} width={80} />
					<div>
						<div class="range">{secToMMSS(clip.startSec)} – {secToMMSS(clip.endSec)}</div>
						<div>{clip.summary || clip.note || '(未命名)'}</div>
					</div>
				</a>
			{/each}
		</article>
	{/each}
</section>

<style>
	section {
		padding: 0.75rem;
	}

	h1 {
		font-size: 1.1rem;
	}

	.empty {
		color: var(--text-dim);
	}

	article {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		margin-bottom: 0.75rem;
		overflow: hidden;
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0.6rem;
		border-bottom: 1px solid var(--border);
	}

	header span {
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.clip {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		padding: 0.5rem 0.6rem;
		color: inherit;
		text-decoration: none;
		border-top: 1px solid var(--border);
	}

	.range {
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-dim);
	}
</style>
```

- [ ] **Step 5: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/inbox.spec.ts`
Expected: PASS（3 passed）

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: 新增 Inbox 收集匣，依影片分組列出待處理片段"
```

---

## Task 12: 檢索頁與就地回放

**Files:**
- Create: `src/routes/+page.server.ts`, `src/routes/api/search/+server.ts`
- Create: `src/lib/components/ResultCard.svelte`
- Modify: `src/routes/+page.svelte`
- Test: `tests/e2e/search.spec.ts`

**Interfaces:**
- Consumes: `getRepo()`、`SearchQuery` / `SearchResult`（Task 4）、`Thumb`（Task 6）
- Produces:
  - `GET /api/search?text=&dateFrom=&dateTo=&tagIds=a,b` → `SearchResult` JSON
  - 檢索頁以 URL query 驅動（可分享、可重新整理）

- [ ] **Step 1: 寫失敗的測試**

`tests/e2e/search.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('預設列出所有已完成的片段', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByTestId('result-card')).toHaveCount(1);
	await expect(page.getByTestId('result-card').first()).toContainText('搭帳篷');
});

test('關鍵字可過濾', async ({ page }) => {
	await page.goto('/');
	await page.getByTestId('search-input').fill('帳篷');
	await page.getByTestId('search-submit').click();
	await expect(page.getByTestId('result-card')).toHaveCount(1);

	await page.getByTestId('search-input').fill('不存在的關鍵字');
	await page.getByTestId('search-submit').click();
	await expect(page.getByTestId('search-empty')).toBeVisible();
});

test('顯示「聽懂了」的解析結果', async ({ page }) => {
	await page.goto('/?text=帳篷');
	await expect(page.getByTestId('parsed-summary')).toContainText('帳篷');
});

test('結果卡片顯示上傳者與事件日期', async ({ page }) => {
	await page.goto('/');
	const card = page.getByTestId('result-card').first();
	await expect(card).toContainText('阿明的頻道');
	await expect(card).toContainText('2025-07-12');
});

test('點卡片會就地展開播放器並帶對區間', async ({ page }) => {
	await page.goto('/');
	await page.getByTestId('play-clip').first().click();
	const frame = page.getByTestId('result-iframe').first();
	await expect(frame).toHaveAttribute('src', /start=312/);
	await expect(frame).toHaveAttribute('src', /end=342/);
	await expect(frame).toHaveAttribute('src', /playsinline=1/);
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:e2e tests/e2e/search.spec.ts`
Expected: FAIL，找不到 `result-card`

- [ ] **Step 3: 建立 GET /api/search**

`src/routes/api/search/+server.ts`：

```ts
import { json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const tagIds = url.searchParams.get('tagIds');
	const result = await getRepo().searchClips(DEV_OWNER_ID, {
		text: url.searchParams.get('text') ?? undefined,
		dateFrom: url.searchParams.get('dateFrom') ?? undefined,
		dateTo: url.searchParams.get('dateTo') ?? undefined,
		tagIds: tagIds ? tagIds.split(',').filter(Boolean) : undefined
	});
	return json(result);
};
```

- [ ] **Step 4: 建立 +page.server.ts**

```ts
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { Video } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const repo = getRepo();
	const tagIds = url.searchParams.get('tagIds');

	const result = await repo.searchClips(DEV_OWNER_ID, {
		text: url.searchParams.get('text') ?? undefined,
		dateFrom: url.searchParams.get('dateFrom') ?? undefined,
		dateTo: url.searchParams.get('dateTo') ?? undefined,
		tagIds: tagIds ? tagIds.split(',').filter(Boolean) : undefined
	});

	const videos: Record<string, Video> = {};
	for (const clip of result.clips) {
		if (!videos[clip.videoId]) {
			const v = await repo.getVideo(DEV_OWNER_ID, clip.videoId);
			if (v) videos[clip.videoId] = v;
		}
	}

	return {
		result,
		videos,
		query: {
			text: url.searchParams.get('text') ?? '',
			dateFrom: url.searchParams.get('dateFrom') ?? '',
			dateTo: url.searchParams.get('dateTo') ?? ''
		}
	};
};
```

- [ ] **Step 5: 建立 ResultCard.svelte**

```svelte
<script lang="ts">
	import Thumb from './Thumb.svelte';
	import { secToMMSS } from '$lib/time';
	import type { Clip, Video } from '$lib/types';

	interface Props {
		clip: Clip;
		video: Video;
	}

	let { clip, video }: Props = $props();

	let playing = $state(false);

	const embedSrc = $derived(
		`https://www.youtube.com/embed/${video.id}` +
			`?start=${clip.startSec}&end=${clip.endSec}&autoplay=1&mute=1&playsinline=1`
	);
</script>

<article class="card" data-testid="result-card">
	{#if playing}
		<iframe
			data-testid="result-iframe"
			src={embedSrc}
			title={clip.summary || '片段'}
			allow="autoplay; encrypted-media; picture-in-picture"
			allowfullscreen
		></iframe>
	{:else}
		<button class="cover" data-testid="play-clip" onclick={() => (playing = true)}>
			<Thumb {video} t={clip.startSec} width={360} />
			<span class="play">▶</span>
		</button>
	{/if}

	<div class="meta">
		<div class="range">{secToMMSS(clip.startSec)} – {secToMMSS(clip.endSec)}</div>
		<div class="summary">{clip.summary || clip.note || '(未命名)'}</div>
		<div class="sub">{clip.eventDate} ・ @{video.channelTitle}</div>
		<a class="external" href="https://youtu.be/{video.id}?t={clip.startSec}" target="_blank" rel="noreferrer">
			在 YouTube 開啟 ↗
		</a>
	</div>
</article>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		margin-bottom: 0.75rem;
	}

	iframe {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: 0;
		display: block;
	}

	.cover {
		position: relative;
		width: 100%;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: #000;
		display: block;
	}

	.cover :global(.thumb) {
		width: 100% !important;
		height: auto !important;
		aspect-ratio: 16 / 9;
	}

	.play {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 2rem;
		color: #fff;
		text-shadow: 0 2px 8px rgb(0 0 0 / 0.6);
	}

	.meta {
		padding: 0.6rem;
	}

	.range {
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-dim);
	}

	.summary {
		margin: 0.15rem 0;
	}

	.sub {
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.external {
		display: inline-block;
		margin-top: 0.35rem;
		font-size: 0.75rem;
		color: var(--accent);
	}
</style>
```

- [ ] **Step 6: 改寫檢索頁**

`src/routes/+page.svelte`：

```svelte
<script lang="ts">
	import ResultCard from '$lib/components/ResultCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let text = $state(data.query.text);
	let dateFrom = $state(data.query.dateFrom);
	let dateTo = $state(data.query.dateTo);

	const parsedSummary = $derived.by(() => {
		const p = data.result.parsed;
		const bits: string[] = [];
		if (p.dateFrom || p.dateTo) bits.push(`${p.dateFrom ?? '不限'} ~ ${p.dateTo ?? '不限'}`);
		if (p.tagNames.length) bits.push(p.tagNames.join('、'));
		if (p.keywords.length) bits.push(p.keywords.join('、'));
		return bits.length ? bits.join(' ・ ') : '沒有條件，列出全部';
	});
</script>

<section data-testid="page-search">
	<form method="GET" data-testid="search-form">
		<input
			name="text"
			data-testid="search-input"
			placeholder="用一句話描述你要找的片段"
			bind:value={text}
		/>
		<div class="dates">
			<input type="date" name="dateFrom" bind:value={dateFrom} aria-label="起始日期" />
			<input type="date" name="dateTo" bind:value={dateTo} aria-label="結束日期" />
			<button type="submit" data-testid="search-submit">搜尋</button>
		</div>
	</form>

	<p class="parsed" data-testid="parsed-summary">聽懂了：{parsedSummary}</p>

	{#if data.result.clips.length === 0}
		<p class="empty" data-testid="search-empty">找不到符合的片段。</p>
	{/if}

	{#each data.result.clips as clip (clip.id)}
		{#if data.videos[clip.videoId]}
			<ResultCard {clip} video={data.videos[clip.videoId]} />
		{/if}
	{/each}
</section>

<style>
	section {
		padding: 0.75rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 0.5rem;
	}

	.dates {
		display: flex;
		gap: 0.4rem;
	}

	.parsed {
		font-size: 0.78rem;
		color: var(--text-dim);
		margin: 0 0 0.75rem;
	}

	.empty {
		color: var(--text-dim);
	}
</style>
```

- [ ] **Step 7: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/search.spec.ts`
Expected: PASS（5 passed）

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: 新增檢索頁、查詢解析顯示與結果卡片就地回放"
```

---

## Task 13: 設定頁

**Files:**
- Create: `src/routes/settings/+page.server.ts`, `src/routes/api/settings/+server.ts`
- Modify: `src/routes/settings/+page.svelte`
- Test: `tests/e2e/settings.spec.ts`

**Interfaces:**
- Consumes: `getRepo()`、`Settings`（Task 2）
- Produces: `PATCH /api/settings`，body 為 `Partial<Settings>` → `200` 與更新後的 `Settings`

- [ ] **Step 1: 寫失敗的測試**

`tests/e2e/settings.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('設定頁顯示預設標記區間', async ({ page }) => {
	await page.goto('/settings');
	await expect(page.getByTestId('mark-before')).toHaveValue('20');
	await expect(page.getByTestId('mark-after')).toHaveValue('10');
});

test('改過的預設區間會影響標記結果', async ({ page }) => {
	await page.goto('/settings');
	await page.getByTestId('mark-before').fill('5');
	await page.getByTestId('mark-after').fill('5');
	await page.getByTestId('save-settings').click();
	await expect(page.getByTestId('save-ok')).toBeVisible();

	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('fake-time').fill('750');
	await page.getByTestId('mark-now').click();
	// 750-5=745 → 12:25；750+5=755 → 12:35
	await expect(page.getByTestId('clip-row').filter({ hasText: '12:25 – 12:35' })).toHaveCount(1);
});

test('設定頁列出既有標籤', async ({ page }) => {
	await page.goto('/settings');
	await expect(page.getByTestId('tag-item')).toHaveCount(4);
	await expect(page.getByTestId('tag-item').filter({ hasText: '阿明' })).toContainText('明哥');
});

test('storyboard 健康狀態顯示為正常（第一階段固定值）', async ({ page }) => {
	await page.goto('/settings');
	await expect(page.getByTestId('sb-health')).toContainText('正常');
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:e2e tests/e2e/settings.spec.ts`
Expected: FAIL，找不到 `mark-before`

- [ ] **Step 3: 建立 PATCH /api/settings**

`src/routes/api/settings/+server.ts`：

```ts
import { error, json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { Settings } from '$lib/types';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Partial<Settings>;

	for (const key of ['markBeforeSec', 'markAfterSec'] as const) {
		const v = body[key];
		if (v !== undefined && (typeof v !== 'number' || v < 0 || v > 600)) {
			error(400, `${key} 必須是 0 到 600 之間的數字`);
		}
	}

	const { ownerId: _ignored, ...patch } = body;
	return json(await getRepo().updateSettings(DEV_OWNER_ID, patch));
};
```

- [ ] **Step 4: 建立 settings/+page.server.ts**

```ts
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const repo = getRepo();
	return {
		settings: await repo.getSettings(DEV_OWNER_ID),
		tags: await repo.listTags(DEV_OWNER_ID),
		// 第三階段接上真實探測結果；第一階段固定回報正常
		storyboardHealthy: true
	};
};
```

- [ ] **Step 5: 改寫設定頁**

`src/routes/settings/+page.svelte`：

```svelte
<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let markBefore = $state(data.settings.markBeforeSec);
	let markAfter = $state(data.settings.markAfterSec);
	let pauseOnMark = $state(data.settings.pauseOnMark);
	let saved = $state(false);

	async function save() {
		const res = await fetch('/api/settings', {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				markBeforeSec: Number(markBefore),
				markAfterSec: Number(markAfter),
				pauseOnMark
			})
		});
		saved = res.ok;
	}
</script>

<section data-testid="page-settings">
	<h1>設定</h1>

	<h2>標記行為</h2>
	<label>
		標記時往前抓幾秒
		<input type="number" data-testid="mark-before" min="0" max="600" bind:value={markBefore} />
	</label>
	<label>
		標記時往後抓幾秒
		<input type="number" data-testid="mark-after" min="0" max="600" bind:value={markAfter} />
	</label>
	<label class="inline">
		<input type="checkbox" data-testid="pause-on-mark" bind:checked={pauseOnMark} />
		標記時自動暫停影片
	</label>

	<button data-testid="save-settings" onclick={save}>儲存</button>
	{#if saved}
		<p class="ok" data-testid="save-ok">已儲存</p>
	{/if}

	<h2>縮圖服務</h2>
	<p data-testid="sb-health" class:bad={!data.storyboardHealthy}>
		storyboard 解析器：{data.storyboardHealthy ? '正常' : '異常（已退回封面模式）'}
	</p>

	<h2>標籤（{data.tags.length}）</h2>
	<ul>
		{#each data.tags as tag (tag.id)}
			<li data-testid="tag-item">
				<strong>{tag.name}</strong>
				<span class="kind">{tag.kind}</span>
				{#if tag.aliases.length}
					<span class="aliases">別名：{tag.aliases.join('、')}</span>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		padding: 0.75rem;
	}

	h1 {
		font-size: 1.1rem;
	}

	h2 {
		font-size: 0.85rem;
		color: var(--text-dim);
		margin: 1.25rem 0 0.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		margin-bottom: 0.6rem;
	}

	label.inline {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	label.inline input {
		width: auto;
	}

	.ok {
		color: var(--ok);
		font-size: 0.8rem;
	}

	.bad {
		color: var(--danger);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		margin-bottom: 0.4rem;
		font-size: 0.85rem;
	}

	.kind,
	.aliases {
		color: var(--text-dim);
		font-size: 0.75rem;
		margin-left: 0.4rem;
	}
</style>
```

- [ ] **Step 6: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/settings.spec.ts`
Expected: PASS（4 passed）

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: 新增設定頁，可調整預設標記區間並檢視標籤與縮圖健康狀態"
```

---

## Task 14: PWA manifest 與安裝

**Files:**
- Create: `static/manifest.webmanifest`, `static/icons/icon-192.png`, `static/icons/icon-512.png`
- Test: `tests/e2e/pwa.spec.ts`

**Interfaces:**
- Consumes: 無
- Produces: 可安裝的 PWA；manifest 已宣告 `share_target`（第六階段才實作 `/share` 端點）

- [ ] **Step 1: 寫失敗的測試**

`tests/e2e/pwa.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('manifest 可取得且欄位正確', async ({ request }) => {
	const res = await request.get('/manifest.webmanifest');
	expect(res.status()).toBe(200);

	const m = await res.json();
	expect(m.name).toBe('yt-space');
	expect(m.display).toBe('standalone');
	expect(m.start_url).toBe('/');
	expect(m.icons.length).toBeGreaterThanOrEqual(2);
});

test('manifest 宣告了 share_target', async ({ request }) => {
	const m = await (await request.get('/manifest.webmanifest')).json();
	expect(m.share_target.action).toBe('/share');
	expect(m.share_target.method).toBe('POST');
	expect(m.share_target.enctype).toBe('multipart/form-data');
	expect(m.share_target.params.files[0].accept).toContain('image/*');
});

test('頁面有連到 manifest', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `pnpm test:e2e tests/e2e/pwa.spec.ts`
Expected: FAIL，manifest 回傳 404

- [ ] **Step 3: 建立 static/manifest.webmanifest**

```json
{
	"name": "yt-space",
	"short_name": "yt-space",
	"description": "YouTube 片段標記與語意化檢索",
	"lang": "zh-Hant",
	"start_url": "/",
	"scope": "/",
	"display": "standalone",
	"orientation": "portrait",
	"background_color": "#111318",
	"theme_color": "#111318",
	"icons": [
		{ "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
		{ "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
	],
	"share_target": {
		"action": "/share",
		"method": "POST",
		"enctype": "multipart/form-data",
		"params": {
			"title": "title",
			"text": "text",
			"url": "url",
			"files": [{ "name": "image", "accept": ["image/*"] }]
		}
	}
}
```

- [ ] **Step 4: 產生兩個圖示**

用 Node 產生純色 PNG 佔位圖示（正式圖示由使用者日後替換）：

```bash
node -e "
const fs=require('fs'),zlib=require('zlib');
function png(size){
  const w=size,h=size,raw=Buffer.alloc((w*3+1)*h);
  for(let y=0;y<h;y++){const off=y*(w*3+1);raw[off]=0;
    for(let x=0;x<w;x++){raw[off+1+x*3]=0x4c;raw[off+2+x*3]=0x8d;raw[off+3+x*3]=0xff;}}
  const crcT=[...Array(256)].map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
  const crc=b=>{let c=0xffffffff;for(const x of b)c=crcT[(c^x)&0xff]^(c>>>8);return (c^0xffffffff)>>>0;};
  const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);
    const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);
  ihdr[8]=8;ihdr[9]=2;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),
    chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
fs.mkdirSync('static/icons',{recursive:true});
fs.writeFileSync('static/icons/icon-192.png',png(192));
fs.writeFileSync('static/icons/icon-512.png',png(512));
console.log('icons written');
"
```

- [ ] **Step 5: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/pwa.spec.ts`
Expected: PASS（3 passed）

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: 新增 PWA manifest 與圖示，宣告 share_target"
```

---

## Task 15: 全流程整合測試與收尾

**Files:**
- Create: `tests/e2e/flow.spec.ts`
- Modify: `README.md`（新建）
- Test: 全部既有測試

**Interfaces:**
- Consumes: 前面所有任務
- Produces: 一條涵蓋「標記 → 校對 → 檢索 → 回放」的端到端測試；`README.md` 記錄如何跑起來

> **注意：** mock repo 是 process 內的單例，測試之間會共用狀態。此測試刻意設計成「只增不減」，不依賴其他測試留下的精確筆數。

- [ ] **Step 1: 寫全流程測試**

`tests/e2e/flow.spec.ts`：

```ts
import { expect, test } from '@playwright/test';

test('標記 → 校對 → 檢索 → 回放 全流程', async ({ page }) => {
	// 1. 到工作台標記一個新片段
	await page.goto('/v/KUdmrPVssFA');
	const before = await page.getByTestId('clip-row').count();

	await page.getByTestId('fake-time').fill('18');
	await page.getByTestId('mark-now').click();
	await expect(page.getByTestId('clip-row')).toHaveCount(before + 1);

	// 2. 面板應已自動開啟並選中新片段
	await expect(page.getByTestId('clip-sheet')).toBeVisible();

	// 3. 填入摘要並確認完成
	const marker = `整合測試${Date.now()}`;
	await page.getByTestId('field-summary').fill(marker);
	await page.getByTestId('confirm-clip').click();
	await expect(page.getByTestId('clip-sheet')).toBeHidden();
	await expect(page.getByTestId('clip-row').filter({ hasText: marker })).toContainText('已完成');

	// 4. 到檢索頁應該搜得到
	await page.goto(`/?text=${encodeURIComponent(marker)}`);
	await expect(page.getByTestId('result-card')).toHaveCount(1);

	// 5. 點下去要能就地播放且帶對區間
	await page.getByTestId('play-clip').click();
	await expect(page.getByTestId('result-iframe')).toHaveAttribute('src', /start=0/);
	await expect(page.getByTestId('result-iframe')).toHaveAttribute('src', /end=24/);
});

test('已完成的片段不會再出現在 Inbox', async ({ page }) => {
	await page.goto('/v/KUdmrPVssFA');
	await page.getByTestId('fake-time').fill('10');
	await page.getByTestId('mark-now').click();

	const marker = `離開Inbox${Date.now()}`;
	await page.getByTestId('field-summary').fill(marker);

	await page.goto('/inbox');
	await expect(page.getByTestId('inbox-clip').filter({ hasText: marker })).toHaveCount(1);

	await page.goto('/v/KUdmrPVssFA');
	await page.getByTestId('clip-row').filter({ hasText: marker }).click();
	await page.getByTestId('confirm-clip').click();

	await page.goto('/inbox');
	await expect(page.getByTestId('inbox-clip').filter({ hasText: marker })).toHaveCount(0);
});
```

- [ ] **Step 2: 執行測試確認通過**

Run: `pnpm test:e2e tests/e2e/flow.spec.ts`
Expected: PASS（2 passed）

若第二個測試因為 `field-summary` 的 `onchange` 尚未觸發而失敗，在 `fill` 之後加一行 `await page.getByTestId('field-summary').blur();`。

- [ ] **Step 3: 執行全部測試**

Run: `pnpm test:unit && pnpm test:e2e`
Expected: 單元測試與 E2E 全數 PASS

- [ ] **Step 4: 執行型別檢查**

Run: `pnpm check`
Expected: 0 errors

- [ ] **Step 5: 建立 README.md**

```markdown
# yt-space

YouTube 片段標記與語意化檢索系統（手機優先）。

- 設計規格：[docs/superpowers/specs/2026-08-07-yt-space-clip-design.md](docs/superpowers/specs/2026-08-07-yt-space-clip-design.md)
- 實作計畫：[docs/superpowers/plans/](docs/superpowers/plans/)

## 目前進度

**第一階段：UI/UX 原型** —— 四個畫面與全部互動已完成，資料層為記憶體 mock。

## 開發

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## 測試

```bash
pnpm test:unit    # Vitest：純函式
pnpm test:e2e     # Playwright：Pixel 7 viewport
pnpm check        # svelte-check 型別檢查
```

E2E 以 `PUBLIC_PLAYER_MODE=fake` 執行，播放器走可控的假實作，因此測試離線且穩定。

## 資料層

所有存取經過 `src/lib/server/repo` 的 `Repo` 介面。第一階段掛 `MockRepo`（記憶體 + 種子資料），
第二階段接上 D1 時只需替換 `getRepo()` 的實作，UI 不需修改。
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "test: 新增全流程整合測試並補上 README"
```

---

## 第一階段完成標準

全部勾選才算完成：

- [ ] `pnpm test:unit` 全數通過
- [ ] `pnpm test:e2e` 全數通過（smoke / nav / studio / mark / review / inbox / search / settings / pwa / flow）
- [ ] `pnpm check` 0 errors
- [ ] `pnpm dev` 開起來後，在瀏覽器的手機模擬模式下四個畫面都能操作
- [ ] 標記 → 校對 → 檢索 → 回放 可以手動走通一輪

## 明確不在第一階段範圍

以下項目屬於後續階段，**不要在此階段實作**：

| 項目 | 階段 |
|---|---|
| D1 schema、migrations、`d1.ts` 實作 | 2 |
| Cloudflare Access 認證（`owner_id` 目前是常數） | 2 |
| YouTube Data API 抓 metadata | 3 |
| storyboard 真實抓取、R2 存放、健康偵測與告警 | 3 |
| Gemini 分析、配額顯示、失敗降級 | 4 |
| FTS5 檢索、Gemini 查詢解析、相關度排序 | 5 |
| `/share` 端點、Web Share Target 實際接收 | 6 |
| 手動上傳截圖、canvas 縮圖壓縮 | 6 |
| 視覺回歸測試 | v2 |
