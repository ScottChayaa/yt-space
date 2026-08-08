import { error, json } from '@sveltejs/kit';
import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { UpdateClipPatch } from '$lib/server/repo/types';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	let patch: UpdateClipPatch;
	try {
		patch = (await request.json()) as UpdateClipPatch;
	} catch {
		error(400, '請求內容不是有效的 JSON');
	}

	if (
		patch.startSec !== undefined &&
		patch.endSec !== undefined &&
		patch.endSec <= patch.startSec
	) {
		error(400, 'endSec 必須大於 startSec');
	}

	// 先確認 clip 存在（且屬於此 owner）→ 不存在回 404；
	// updateClip 本身不再包 try/catch，讓其他錯誤（如第二階段 D1 的約束/連線錯誤）
	// 自然浮現為 500，而非被誤報成 404。
	const existing = await getRepo().getClip(DEV_OWNER_ID, params.id);
	if (!existing) error(404, '找不到這個 clip');

	return json(await getRepo().updateClip(DEV_OWNER_ID, params.id, patch));
};

export const DELETE: RequestHandler = async ({ params }) => {
	await getRepo().deleteClip(DEV_OWNER_ID, params.id);
	return new Response(null, { status: 204 });
};
