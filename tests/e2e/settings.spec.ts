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
