import type { Clip, ClipOrigin, ParsedQuery, Settings, Tag, Video } from '$lib/types';

export interface CreateClipInput {
	ownerId: string;
	videoId: string;
	startSec: number;
	endSec: number;
	note?: string;
	origin: ClipOrigin;
}

export interface UpdateClipPatch {
	startSec?: number;
	endSec?: number;
	eventDate?: string;
	note?: string;
	summary?: string;
	transcript?: string;
	visualDesc?: string;
	status?: Clip['status'];
	tagIds?: string[];
}

export interface SearchQuery {
	text?: string;
	dateFrom?: string;
	dateTo?: string;
	tagIds?: string[];
}

export interface SearchResult {
	clips: Clip[];
	parsed: ParsedQuery;
}

export interface Repo {
	getVideo(ownerId: string, videoId: string): Promise<Video | null>;
	listClipsByVideo(ownerId: string, videoId: string): Promise<Clip[]>;
	listInbox(ownerId: string): Promise<Clip[]>;
	getClip(ownerId: string, clipId: string): Promise<Clip | null>;
	createClip(input: CreateClipInput): Promise<Clip>;
	updateClip(ownerId: string, clipId: string, patch: UpdateClipPatch): Promise<Clip>;
	deleteClip(ownerId: string, clipId: string): Promise<void>;
	searchClips(ownerId: string, query: SearchQuery): Promise<SearchResult>;
	listTags(ownerId: string): Promise<Tag[]>;
	getSettings(ownerId: string): Promise<Settings>;
	updateSettings(ownerId: string, patch: Partial<Settings>): Promise<Settings>;
}
