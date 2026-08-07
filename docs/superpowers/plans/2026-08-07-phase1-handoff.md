# 第一階段 UI/UX 原型 — 跨機器交接文件

> 建立於 2026-08-07，用途：在另一台電腦上接續 subagent-driven-development 流程
> 分支：`feat/clip-phase1-ui`

---

## 給接手的 Claude：一句話說明現況

正在用 **superpowers:subagent-driven-development** 執行
[`2026-08-07-yt-space-clip-phase1-ui.md`](2026-08-07-yt-space-clip-phase1-ui.md)
的 15 個任務。**Task 1–3 已完成並通過審查，Task 4 程式碼已 commit 但尚未審查。**

**恢復的第一個動作不是派 Task 5，而是補做 Task 4 的任務審查。**

---

## 環境重建（新機器第一次）

```bash
git clone git@github.com:ScottChayaa/yt-space.git
cd yt-space
git checkout feat/clip-phase1-ui
pnpm install
pnpm approve-builds --all
pnpm exec playwright install chromium
```

`pnpm approve-builds` 是 pnpm 10 的必要步驟，否則 esbuild 與 workerd 的 postinstall 不會執行，build 會失敗。

驗證環境正常：

```bash
pnpm test:unit    # 應為 39 passed
pnpm check        # 應為 0 errors
pnpm build        # 應成功
```

`pnpm test:e2e` 目前只有 Task 1 的 smoke test（1 passed）。

---

## 進度

| Task | 狀態 | commits |
|---|---|---|
| 1 專案骨架與工具鏈 | ✅ 完成，審查乾淨 | `62fad95`, `1530557` |
| 2 共用型別與時間工具 | ✅ 完成，審查乾淨 | `4fd400e` |
| 3 storyboard 座標計算 | ✅ 完成，審查乾淨（含 1 輪修正） | `2faddf6`, `be9b035` |
| **4 Repo 介面與 mock** | ⚠️ **已 commit，尚未審查** | `656e19e` |
| 5–15 | 未開始 | — |

分支起點：`3bb5b9d`（`master` 之後的第一個 commit）。

---

## Ledger（原本在 git-ignored 的 `.superpowers/`，此處為完整內容）

```
# SDD ledger — plan: docs/superpowers/plans/2026-08-07-yt-space-clip-phase1-ui.md

分支：feat/clip-phase1-ui（從 master 開出，同目錄，非 worktree — 使用者選擇）
起始 commit：3bb5b9d
Pre-flight 掃描：發現計畫 Task 4 埋設的刻意錯字檢查點無測試覆蓋，已於 5bae494 移除。其餘無衝突。

Task 1: 實作完成 DONE_WITH_CONCERNS (commit 62fad95) — e2e 1/1 passing, build OK
Task 1: 修正 — pnpm check 因 typescript 解析到 7.0.2 與 svelte-check 4.7.4 不相容而失敗；
        controller 裁定鎖 typescript@^5（不採 --tsgo）
Task 1: 已接受的觀察 — pnpm 10 需 approve-builds 才能跑 esbuild/workerd postinstall，
        pnpm-workspace.yaml 已 commit 以確保可重現（非 monorepo 設定）
Task 1: 已核准偏離 — vite.config.ts 的 defineConfig 改從 'vitest/config' 匯入
        （計畫原文寫 'vite' 是錯的，Vite 的型別不含 test 鍵）→ 計畫已於 fb52776 修正
Task 1: minor (deferred) — src/app.html 引用的 manifest.webmanifest 要到 Task 14 才存在，
        期間瀏覽器載入會有 404 console error（計畫原文如此，非實作缺陷）
Task 1: complete (commits 3bb5b9d..1530557, review clean)

Task 2: minor (deferred) — 計畫 Step 6 原寫「13 passed」但測試碼只有 9 個 it；已修正計畫
Task 2: 注意 — StoryboardLevel.sigh 不是錯字，是 YouTube storyboard URL 的實際參數名
        （sigh=rs$AOn4...）。審查者曾誤判為 sig 的錯字，後續任務不可「修正」它
Task 2: complete (commits fb52776..4fd400e, review clean)

Task 3: 已核准偏離 — frameAt 的 offsetX/offsetY 加 col===0/row===0 判斷，避免 JS 的 -0
        讓 Vitest toMatchObject 失敗。審查確認改在正確的一側（實作而非測試期望值）
Task 3: minor (deferred) — 測試標題「沒有任何 interval > 0 的 level」實際測的是 levels: []
Task 3: minor (deferred) — parseStoryboardSpec 跳過畸形 level 時，levels 陣列索引會與 level
        欄位錯開；pickLevel 用 level 欄位所以不受影響，僅測試直接用 levels[3] 時需注意
Task 3: fix round 1/5 (1 addressed, 0 open — frameCount=0 防護；commits 2faddf6..be9b035)
Task 3: complete (commits c65d29b..be9b035, review clean — 23 tests passing)

Task 4: 實作完成但【尚未審查】(commit 656e19e) — 39 tests passing (23 + 16 new), pnpm check 0 errors
        實作者自稱四個檔案皆逐字謄寫、無偏離。此宣稱未經獨立驗證。

=== 2026-08-07 使用者指示停損，暫停於此 ===
```

在新機器上請重建這個 ledger 檔案，路徑為
`.superpowers/sdd/2026-08-07-yt-space-clip-phase1-ui/progress.md`，
第一行必須是 `# SDD ledger — plan: docs/superpowers/plans/2026-08-07-yt-space-clip-phase1-ui.md`
（skill 靠這一行辨識 ledger 歸屬）。

---

## Task 4 的審查怎麼補

任務 brief 可以重新產生（不需要從舊機器搬）：

```bash
"<superpowers skill 路徑>/subagent-driven-development/scripts/task-brief" \
  docs/superpowers/plans/2026-08-07-yt-space-clip-phase1-ui.md 4
```

審查包同樣重新產生：

```bash
"<同上>/scripts/review-package" \
  docs/superpowers/plans/2026-08-07-yt-space-clip-phase1-ui.md be9b035 656e19e
```

**實作者的 report 檔沒有跟著 git 走。** 這不影響審查品質 —— 反而少了實作者的自我宣稱可能造成的誤導。派審查者時，把 `[REPORT_FILE]` 那段換成：

> 沒有實作者報告可讀。僅依 diff 判斷，不要假設任何未在 diff 中呈現的事實。
> 實作者宣稱（未經驗證）：四個檔案皆逐字謄寫自 brief、無偏離、39 tests passing、pnpm check 0 errors。

Task 4 的實作者宣稱摘要（供對照，不可當作證據）：
- 建立 `src/lib/server/repo/types.ts`、`mock.ts`、`index.ts` 與 `mock.test.ts`
- TDD：RED 為 `Cannot find module './mock'`，GREEN 為 39/39
- 新增 16 個測試，涵蓋種子資料、owner 隔離、createClip、updateClip、listInbox、searchClips、settings

審查時特別要查的點：
1. `MockRepo` 是否確實 `implements Repo`，11 個方法簽章是否與介面一致
2. `SEED_SB_SPEC` 字串是否逐字正確（`sigh` 不是錯字、`$L`/`$N`/`$M` 是字面 token、簽章含 `$`）
3. 種子 clip 的 `status` 值是否與 brief 一致 —— `listInbox` 與 `searchClips` 的測試依賴它們
4. `updateClip` 傳入別的 `ownerId` 是否確實拋錯
5. `clip_tag` 的 `source` 在用 `tagIds` 更新後是否為 `'human'`
6. commit body 是否無 `Co-Authored-By` trailer（審查者從 diff 看不到，需 controller 自行驗）

---

## 流程上必須帶進每次 dispatch 的事項

- **每次任務審查後，controller 要自己驗 commit body 沒有 `Co-Authored-By` trailer** ——
  審查者只看得到 commit subject，這一項它必定回報為「⚠️ 無法從 diff 驗證」。
- **`StoryboardLevel.sigh` 不可「修正」為 `sig`。**
- **標記為 plan-mandated 的 Important 發現要問使用者**，不可自行裁定 —— 這是 skill 的硬規則。
- **deferred minors 要累積在 ledger**，最後的全分支審查需一併分流。

---

## 已知的計畫缺陷（實作過程中發現並已修正）

| 缺陷 | 修正 commit |
|---|---|
| `vite.config.ts` 的 `defineConfig` 從 `'vite'` 匯入會讓 `pnpm check` 報錯 | `fb52776` |
| `typescript` 未鎖版會裝到 7.x，與 `svelte-check` 4.x 不相容 | `fb52776` |
| pnpm 10 需 `approve-builds` 才執行 postinstall | `fb52776` |
| Task 2 預期測試數寫 13，實際為 9 | `c65d29b` |
| Task 3 的 `frameCount = 0` 未防護 | `be9b035` |

**Task 5 之後的任務仍可能藏有同類缺陷**，特別是 Svelte 元件的部分（計畫裡的元件程式碼未經編譯驗證）。審查機制是抓這些的主要手段，不要為了省時間跳過。

---

## 使用者的偏好與決定（此專案已確立）

- commit message 用繁體中文，格式 `<type>: <描述>`，**不加 Co-Authored-By trailer**
- 在同一個工作目錄開 feature 分支，**不用 git worktree**
- 第一階段只做手機版面（Pixel 7 基準），桌機與 Chrome 擴充排在 v2
- 使用者曾表示「如果接下來的任務要處理很久的話，先停損」—— 派發節奏請保守，
  並在每個任務完成後讓使用者有機會喊停
