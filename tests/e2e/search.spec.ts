import { expect, test } from './_setup';

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
