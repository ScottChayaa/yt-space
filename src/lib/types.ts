export type ClipStatus = 'inbox' | 'analyzing' | 'analyzed' | 'reviewed' | 'failed';
// 分析模式。刻意不用 L0/L2 這種編號 —— storyboard 的 L0~L3 是 YouTube 定義的縮圖層級，
// 兩者放在同一個專案裡撞名會誤導（見 storyboard.ts）。v2 會加 'fullscan'（全片掃描）。
export type AnalysisMode = 'bookmark' | 'segment';
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
	analysisMode: AnalysisMode;
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
