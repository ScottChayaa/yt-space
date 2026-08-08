import { error, json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { Settings } from '$lib/types';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Partial<Settings>;

	for (const key of ['markBeforeSec', 'markAfterSec'] as const) {
		const v = body[key];
		if (v !== undefined && (typeof v !== 'number' || v < 0 || v > 600)) {
			error(400, `${key} 必須是 0 到 600 之間的數字`);
		}
	}

	const { ownerId: _ignored, ...patch } = body;
	return json(await getRepo().updateSettings(DEV_OWNER_ID, patch));
};
