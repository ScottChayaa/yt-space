import { expect, test } from '@playwright/test';

test('首頁可以載入', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByTestId('page-search')).toBeVisible();
	await expect(page.getByRole('heading', { name: '檢索' })).toBeVisible();
});
