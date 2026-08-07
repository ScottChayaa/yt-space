export type ClipStatus = 'inbox' | 'analyzing' | 'analyzed' | 'reviewed' | 'failed';
export type AnalysisLevel = 'L0' | 'L2';
export type ClipOrigin = 'web' | 'share' | 'extension' | 'pipeline';
export type TagKind = 'person' | 'pet' | 'place' | 'topic' | 'other';
export type Privacy = 'public' | 'unlisted' | 'unknown';

export interface StoryboardLevel {
	level: number;
	width: number;
	height: number;
	frameCount: number;
	cols: number;
	rows: number;
	intervalMs: number;
	sigh: string;
}

export interface StoryboardSpec {
	baseUrl: string;
	sqp: string;
	levels: StoryboardLevel[];
}

export interface FramePos {
	sheetIndex: number;
	col: number;
	row: number;
	offsetX: number;
	offsetY: number;
	width: number;
	height: number;
	sheetWidth: number;
	sheetHeight: number;
}

export interface Video {
	id: string;
	ownerId: string;
	title: string;
	channelTitle: string;
	publishedAt: string;
	durationSec: number;
	privacy: Privacy;
	sbKey: string | null;
	sbSpec: StoryboardSpec | null;
}

export interface Tag {
	id: string;
	ownerId: string;
	name: string;
	kind: TagKind;
	aliases: string[];
}

export interface ClipTag {
	tag: Tag;
	source: 'ai' | 'human';
}

export interface AiRaw {
	summary: string;
	transcript: string;
	visualDesc: string;
	tags: { name: string; kind: TagKind }[];
	dateHints: string[];
}

export interface Clip {
	id: string;
	videoId: string;
	ownerId: string;
	startSec: number;
	endSec: number;
	eventDate: string;
	note: string;
	summary: string;
	transcript: string;
	visualDesc: string;
	thumbKey: string | null;
	aiRaw: AiRaw | null;
	analysisLevel: AnalysisLevel;
	status: ClipStatus;
	origin: ClipOrigin;
	createdAt: string;
	tags: ClipTag[];
}

export interface Settings {
	ownerId: string;
	markBeforeSec: number;
	markAfterSec: number;
	pauseOnMark: boolean;
}

export interface ParsedQuery {
	dateFrom: string | null;
	dateTo: string | null;
	tagNames: string[];
	keywords: string[];
}

/** Player 元件透過 onready callback 交出來的控制介面（見 Task 7）。 */
export interface PlayerApi {
	seekTo(sec: number): void;
	playRange(start: number, end: number): void;
	pause(): void;
}
