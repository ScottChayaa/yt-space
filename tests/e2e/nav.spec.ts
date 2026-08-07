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
