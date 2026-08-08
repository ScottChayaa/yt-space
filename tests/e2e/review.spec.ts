import { expect, test } from './_setup';

test('點 clip 會打開編輯面板', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').first().click();
	await expect(page.getByTestId('clip-sheet')).toBeVisible();
	await expect(page.getByTestId('sheet-range')).toContainText('05:12');
});

test('編輯摘要後按確認，狀態變成已完成', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').filter({ hasText: '阿明' }).click();

	await page.getByTestId('field-summary').fill('阿明在溪邊滑倒摔進水裡');
	await page.getByTestId('confirm-clip').click();

	await expect(page.getByTestId('clip-sheet')).toBeHidden();
	await expect(
		page.getByTestId('clip-row').filter({ hasText: '阿明在溪邊滑倒摔進水裡' })
	).toContainText('已完成');
});

test('AI 標籤是虛線，點一下變成已確認', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	// 用 summary 的子字串 '溪邊' 定位列 —— ClipRow 顯示 summary || note，
	// clip_seed_2 有 summary，故 note '阿明跌倒' 不會顯示，不能用來定位。
	await page.getByTestId('clip-row').filter({ hasText: '溪邊' }).click();

	const aiChip = page.getByTestId('tag-chip').filter({ hasText: '阿明' });
	await expect(aiChip).toHaveAttribute('data-source', 'ai');
	await aiChip.click();
	await expect(aiChip).toHaveAttribute('data-source', 'human');
});

test('±5s 按鈕可微調區間', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	// 同上：用顯示中的 summary 子字串 '溪邊' 定位，而非未顯示的 note '阿明跌倒'。
	await page.getByTestId('clip-row').filter({ hasText: '溪邊' }).click();
	await expect(page.getByTestId('sheet-range')).toContainText('12:30 – 13:00');

	await page.getByTestId('start-minus').click();
	await expect(page.getByTestId('sheet-range')).toContainText('12:25 – 13:00');
});

test('事件日期與上傳日不同時顯示提示', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').first().click();
	// 種子資料 eventDate=2025-07-12，publishedAt=2025-07-15
	await expect(page.getByTestId('date-mismatch')).toBeVisible();
});

test('下拉把手可關閉面板', async ({ page }) => {
	await page.goto('/v/dQw4w9WgXcQ');
	await page.getByTestId('clip-row').first().click();
	await page.getByTestId('sheet-close').click();
	await expect(page.getByTestId('clip-sheet')).toBeHidden();
});
