import { error, json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { UpdateClipPatch } from '$lib/server/repo/types';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const patch = (await request.json()) as UpdateClipPatch;

	if (
		patch.startSec !== undefined &&
		patch.endSec !== undefined &&
		patch.endSec <= patch.startSec
	) {
		error(400, 'endSec 必須大於 startSec');
	}

	try {
		return json(await getRepo().updateClip(DEV_OWNER_ID, params.id, patch));
	} catch {
		error(404, '找不到這個 clip');
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	await getRepo().deleteClip(DEV_OWNER_ID, params.id);
	return new Response(null, { status: 204 });
};
