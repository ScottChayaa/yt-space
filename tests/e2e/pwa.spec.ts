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
