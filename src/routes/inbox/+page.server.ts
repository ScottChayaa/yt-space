import { DEV_OWNER_ID } from '$lib/constants';
import { getRepo } from '$lib/server/repo';
import type { Clip, Video } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const repo = getRepo();
	const clips = await repo.listInbox(DEV_OWNER_ID);

	const groups: { video: Video; clips: Clip[] }[] = [];
	for (const clip of clips) {
		let group = groups.find((g) => g.video.id === clip.videoId);
		if (!group) {
			const video = await repo.getVideo(DEV_OWNER_ID, clip.videoId);
			if (!video) continue;
			group = { video, clips: [] };
			groups.push(group);
		}
		group.clips.push(clip);
	}

	for (const g of groups) g.clips.sort((a, b) => a.startSec - b.startSec);
	return { groups };
};
