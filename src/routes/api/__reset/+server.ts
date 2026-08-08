import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { resetRepo } from '$lib/server/repo';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
	if (env.PUBLIC_PLAYER_MODE !== 'fake') error(403, '重置端點僅在測試模式可用');
	resetRepo();
	return json({ ok: true });
};
