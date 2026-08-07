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
