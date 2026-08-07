import { expect, test } from '@playwright/test';

test('首頁可以載入', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByTestId('home-title')).toHaveText('yt-space');
});
