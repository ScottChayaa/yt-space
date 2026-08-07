import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	use: {
		...devices['Pixel 7'],
		baseURL: 'http://localhost:4173'
	},
	webServer: {
		command: 'pnpm build && pnpm preview --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		env: { PUBLIC_PLAYER_MODE: 'fake' }
	}
});
