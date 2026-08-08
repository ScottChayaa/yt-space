import { expect, test } from './_setup';

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
