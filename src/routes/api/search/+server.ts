import { json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const tagIds = url.searchParams.get('tagIds');
	const result = await getRepo().searchClips(DEV_OWNER_ID, {
		text: url.searchParams.get('text') ?? undefined,
		dateFrom: url.searchParams.get('dateFrom') ?? undefined,
		dateTo: url.searchParams.get('dateTo') ?? undefined,
		tagIds: tagIds ? tagIds.split(',').filter(Boolean) : undefined
	});
	return json(result);
};
