import { DEFAULT_SETTINGS, DEV_OWNER_ID } from '$lib/constants';
import { parseStoryboardSpec } from '$lib/storyboard';
import type { Clip, Settings, Tag, Video } from '$lib/types';
import type {
	CreateClipInput,
	Repo,
	SearchQuery,
	SearchResult,
	UpdateClipPatch
} from './types';

const SEED_SB_SPEC =
	'https://i.ytimg.com/sb/KUdmrPVssFA/storyboard3_L$L/$N.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgjTpKzTBg==' +
	'|48#27#100#10#10#0#default#rs$AOn4CLDCQG-jwLOoOGPBLaFWxpqItJgENA' +
	'|80#45#25#10#10#1000#M$M#rs$AOn4CLAdQajGjXcFllukj8IozdMskyx6Zw' +
	'|160#90#25#5#5#1000#M$M#rs$AOn4CLDDTrcJY1ywfKuJLuu2E4bctSN8og' +
	'|320#180#25#3#3#1000#M$M#rs$AOn4CLAF8rkqvc6h6mM0WUjOJy55DJC1vA';

let counter = 0;
const nextId = (prefix: string) => `${prefix}_${++counter}`;

function seedVideos(): Video[] {
	return [
		{
			id: 'KUdmrPVssFA',
			ownerId: DEV_OWNER_ID,
			title: '20260726 家庭聚會',
			channelTitle: 'Scott Lin',
			publishedAt: '2026-07-26',
			durationSec: 24,
			privacy: 'unlisted',
			sbKey: 'sb/KUdmrPVssFA',
			sbSpec: parseStoryboardSpec(SEED_SB_SPEC)
		},
		{
			id: 'dQw4w9WgXcQ',
			ownerId: DEV_OWNER_ID,
			title: '宜蘭兩天一夜',
			channelTitle: '阿明的頻道',
			publishedAt: '2025-07-15',
			durationSec: 1471,
			privacy: 'public',
			sbKey: null,
			sbSpec: null
		}
	];
}

function seedTags(): Tag[] {
	return [
		{ id: 'tag_a', ownerId: DEV_OWNER_ID, name: '阿明', kind: 'person', aliases: ['明哥'] },
		{ id: 'tag_b', ownerId: DEV_OWNER_ID, name: '宜蘭', kind: 'place', aliases: [] },
		{ id: 'tag_c', ownerId: DEV_OWNER_ID, name: '露營', kind: 'topic', aliases: [] },
		{ id: 'tag_d', ownerId: DEV_OWNER_ID, name: '家庭聚會', kind: 'topic', aliases: [] }
	];
}

function seedClips(tags: Tag[]): Clip[] {
	const base = {
		ownerId: DEV_OWNER_ID,
		thumbKey: null,
		aiRaw: null,
		origin: 'web' as const,
		createdAt: '2026-08-01T10:00:00.000Z'
	};
	return [
		{
			...base,
			id: 'clip_seed_1',
			videoId: 'dQw4w9WgXcQ',
			startSec: 312,
			endSec: 342,
			eventDate: '2025-07-12',
			note: '搭帳篷',
			summary: '一群人在營地手忙腳亂地搭帳篷',
			transcript: '這個角要先拉起來啦',
			visualDesc: '草地上三個人合力撐起一頂綠色帳篷',
			analysisMode: 'segment',
			status: 'reviewed',
			tags: [
				{ tag: tags[0], source: 'ai' },
				{ tag: tags[1], source: 'human' },
				{ tag: tags[2], source: 'human' }
			]
		},
		{
			...base,
			id: 'clip_seed_2',
			videoId: 'dQw4w9WgXcQ',
			startSec: 750,
			endSec: 780,
			eventDate: '2025-07-12',
			note: '阿明跌倒',
			summary: '阿明在溪邊踩滑跌進水裡',
			transcript: '啊啊啊小心',
			visualDesc: '溪流旁的石頭上有人失去平衡',
			analysisMode: 'segment',
			status: 'analyzed',
			tags: [
				{ tag: tags[0], source: 'ai' },
				{ tag: tags[1], source: 'ai' }
			]
		},
		{
			...base,
			id: 'clip_seed_3',
			videoId: 'KUdmrPVssFA',
			startSec: 2,
			endSec: 12,
			eventDate: '2026-07-26',
			note: '',
			summary: '',
			transcript: '',
			visualDesc: '',
			analysisMode: 'bookmark',
			status: 'inbox',
			tags: []
		},
		{
			...base,
			id: 'clip_seed_4',
			videoId: 'KUdmrPVssFA',
			startSec: 14,
			endSec: 24,
			eventDate: '2026-07-26',
			note: '大合照那段',
			summary: '',
			transcript: '',
			visualDesc: '',
			analysisMode: 'bookmark',
			status: 'inbox',
			tags: []
		}
	];
}

export class MockRepo implements Repo {
	private videos: Video[];
	private tags: Tag[];
	private clips: Clip[];
	private settings: Map<string, Settings>;

	constructor() {
		this.videos = seedVideos();
		this.tags = seedTags();
		this.clips = seedClips(this.tags);
		this.settings = new Map();
	}

	async getVideo(ownerId: string, videoId: string): Promise<Video | null> {
		return this.videos.find((v) => v.ownerId === ownerId && v.id === videoId) ?? null;
	}

	async listClipsByVideo(ownerId: string, videoId: string): Promise<Clip[]> {
		return this.clips
			.filter((c) => c.ownerId === ownerId && c.videoId === videoId)
			.sort((a, b) => a.startSec - b.startSec);
	}

	async listInbox(ownerId: string): Promise<Clip[]> {
		return this.clips
			.filter((c) => c.ownerId === ownerId && c.status !== 'reviewed')
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}

	async getClip(ownerId: string, clipId: string): Promise<Clip | null> {
		return this.clips.find((c) => c.ownerId === ownerId && c.id === clipId) ?? null;
	}

	async createClip(input: CreateClipInput): Promise<Clip> {
		const video = await this.getVideo(input.ownerId, input.videoId);
		if (!video) throw new Error(`找不到影片 ${input.videoId}`);

		const clip: Clip = {
			id: nextId('clip'),
			videoId: input.videoId,
			ownerId: input.ownerId,
			startSec: input.startSec,
			endSec: input.endSec,
			eventDate: video.publishedAt,
			note: input.note ?? '',
			summary: '',
			transcript: '',
			visualDesc: '',
			thumbKey: null,
			aiRaw: null,
			analysisMode: 'bookmark',
			status: 'inbox',
			origin: input.origin,
			createdAt: new Date().toISOString(),
			tags: []
		};
		this.clips.push(clip);
		return clip;
	}

	async updateClip(ownerId: string, clipId: string, patch: UpdateClipPatch): Promise<Clip> {
		const clip = this.clips.find((c) => c.ownerId === ownerId && c.id === clipId);
		if (!clip) throw new Error(`找不到 clip ${clipId}`);

		const { tagIds, ...fields } = patch;
		Object.assign(clip, fields);

		if (tagIds) {
			clip.tags = tagIds
				.map((id) => this.tags.find((t) => t.ownerId === ownerId && t.id === id))
				.filter((t): t is Tag => Boolean(t))
				.map((tag) => ({ tag, source: 'human' as const }));
		}
		return clip;
	}

	async deleteClip(ownerId: string, clipId: string): Promise<void> {
		this.clips = this.clips.filter((c) => !(c.ownerId === ownerId && c.id === clipId));
	}

	async searchClips(ownerId: string, query: SearchQuery): Promise<SearchResult> {
		const text = query.text?.trim() ?? '';
		const clips = this.clips.filter((c) => {
			if (c.ownerId !== ownerId || c.status !== 'reviewed') return false;
			if (query.dateFrom && c.eventDate < query.dateFrom) return false;
			if (query.dateTo && c.eventDate > query.dateTo) return false;
			if (query.tagIds?.length) {
				const ids = c.tags.map((t) => t.tag.id);
				if (!query.tagIds.every((id) => ids.includes(id))) return false;
			}
			if (text) {
				const haystack = [c.note, c.summary, c.transcript, c.visualDesc].join(' ');
				if (!haystack.includes(text)) return false;
			}
			return true;
		});

		return {
			clips: clips.sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
			parsed: {
				dateFrom: query.dateFrom ?? null,
				dateTo: query.dateTo ?? null,
				tagNames: (query.tagIds ?? [])
					.map((id) => this.tags.find((t) => t.id === id)?.name)
					.filter((n): n is string => Boolean(n)),
				keywords: text ? [text] : []
			}
		};
	}

	async listTags(ownerId: string): Promise<Tag[]> {
		return this.tags.filter((t) => t.ownerId === ownerId);
	}

	async getSettings(ownerId: string): Promise<Settings> {
		const existing = this.settings.get(ownerId);
		if (existing) return existing;
		const created: Settings = { ownerId, ...DEFAULT_SETTINGS };
		this.settings.set(ownerId, created);
		return created;
	}

	async updateSettings(ownerId: string, patch: Partial<Settings>): Promise<Settings> {
		const current = await this.getSettings(ownerId);
		const updated = { ...current, ...patch, ownerId };
		this.settings.set(ownerId, updated);
		return updated;
	}
}
