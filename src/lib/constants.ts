import type { Settings } from './types';

export const DEV_OWNER_ID = 'dev@local';

export const DEFAULT_SETTINGS: Omit<Settings, 'ownerId'> = {
	markBeforeSec: 20,
	markAfterSec: 10,
	pauseOnMark: false
};
