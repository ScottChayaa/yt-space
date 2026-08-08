import { expect, test } from '@playwright/test';

test('Inbox 依影片分組顯示未完成的 clip', async ({ page }) => {
	await page.goto('/inbox');
	await expect(page.getByTestId('inbox-group')).toHaveCount(2);
	// listInbox 依 createdAt desc 排序，種子 clip 的 createdAt 全相同 → 穩定排序保留種子順序，
	// 首組會是 dQw（宜蘭），故不用 .first()；改為確認 20260726（KUdmr）這組存在（順序無關）。
	await expect(page.getByTestId('inbox-group').filter({ hasText: '20260726' })).toHaveCount(1);
});

test('點 clip 會跳到該影片的工作台', async ({ page }) => {
	await page.goto('/inbox');
	await page.getByTestId('inbox-clip').first().click();
	await expect(page.getByTestId('page-studio')).toBeVisible();
});

test('全部完成後顯示空狀態', async ({ page }) => {
	await page.goto('/inbox');
	const ids = await page.getByTestId('inbox-clip').evaluateAll((els) =>
		els.map((el) => el.getAttribute('data-clip-id'))
	);
	for (const id of ids) {
		await page.request.patch(`/api/clips/${id}`, { data: { status: 'reviewed' } });
	}
	await page.goto('/inbox');
	await expect(page.getByTestId('inbox-empty')).toBeVisible();
});
