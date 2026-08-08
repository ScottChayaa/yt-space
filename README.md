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
