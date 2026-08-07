import { error, json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { ClipOrigin } from '$lib/types';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as {
		videoId?: string;
		startSec?: number;
		endSec?: number;
		note?: string;
		origin?: ClipOrigin;
	};

	if (!body.videoId || typeof body.startSec !== 'number' || typeof body.endSec !== 'number') {
		error(400, 'videoId、startSec、endSec 為必填');
	}
	if (body.endSec <= body.startSec) {
		error(400, 'endSec 必須大於 startSec');
	}

	const clip = await getRepo().createClip({
		ownerId: DEV_OWNER_ID,
		videoId: body.videoId,
		startSec: body.startSec,
		endSec: body.endSec,
		note: body.note ?? '',
		origin: body.origin ?? 'web'
	});

	return json(clip, { status: 201 });
};

export const GET: RequestHandler = async () => {
	return json(await getRepo().listInbox(DEV_OWNER_ID));
};
