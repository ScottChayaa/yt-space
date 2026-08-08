import { expect, test } from './_setup';

test('標記 → 校對 → 檢索 → 回放 全流程', async ({ page }) => {
	// 1. 到工作台標記一個新片段
	await page.goto('/v/KUdmrPVssFA');
	const before = await page.getByTestId('clip-row').count();

	await page.getByTestId('fake-time').fill('18');
	await page.getByTestId('mark-now').click();
	await expect(page.getByTestId('clip-row')).toHaveCount(before + 1);

	// 2. 面板應已自動開啟並選中新片段
	await expect(page.getByTestId('clip-sheet')).toBeVisible();

	// 3. 填入摘要並確認完成
	const marker = `整合測試${Date.now()}`;
	await page.getByTestId('field-summary').fill(marker);
	await page.getByTestId('confirm-clip').click();
	await expect(page.getByTestId('clip-sheet')).toBeHidden();
	await expect(page.getByTestId('clip-row').filter({ hasText: marker })).toContainText('已完成');

	// 4. 到檢索頁應該搜得到
	await page.goto(`/?text=${encodeURIComponent(marker)}`);
	await expect(page.getByTestId('result-card')).toHaveCount(1);

	// 5. 點下去要能就地播放且帶對區間
	await page.getByTestId('play-clip').click();
	await expect(page.getByTestId('result-iframe')).toHaveAttribute('src', /start=0/);
	await expect(page.getByTestId('result-iframe')).toHaveAttribute('src', /end=24/);
});

test('已完成的片段不會再出現在 Inbox', async ({ page }) => {
	await page.goto('/v/KUdmrPVssFA');
	await page.getByTestId('fake-time').fill('10');
	await page.getByTestId('mark-now').click();

	const marker = `離開Inbox${Date.now()}`;
	await page.getByTestId('field-summary').fill(marker);
	await page.getByTestId('field-summary').blur();

	await page.goto('/inbox');
	await expect(page.getByTestId('inbox-clip').filter({ hasText: marker })).toHaveCount(1);

	await page.goto('/v/KUdmrPVssFA');
	await page.getByTestId('clip-row').filter({ hasText: marker }).click();
	await page.getByTestId('confirm-clip').click();

	await page.goto('/inbox');
	await expect(page.getByTestId('inbox-clip').filter({ hasText: marker })).toHaveCount(0);
});
