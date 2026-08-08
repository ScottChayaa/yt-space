import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ resetRepo: void }>({
	resetRepo: [
		async ({ request }, use) => {
			await request.post('/api/__reset');
			await use();
		},
		{ auto: true }
	]
});
export { expect };
