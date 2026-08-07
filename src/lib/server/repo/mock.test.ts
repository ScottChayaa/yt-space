import { beforeEach, describe, expect, it } from 'vitest';
import { DEV_OWNER_ID } from '$lib/constants';
import { MockRepo } from './mock';

let repo: MockRepo;

beforeEach(() => {
	repo = new MockRepo();
});

describe('種子資料', () => {
	it('至少有一支影片與數個 clip', async () => {
		const video = await repo.getVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		expect(video).not.toBeNull();
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		expect(clips.length).toBeGreaterThanOrEqual(2);
	});

	it('影片帶有可解析的 storyboard spec', async () => {
		const video = await repo.getVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		expect(video!.sbSpec).not.toBeNull();
		expect(video!.sbSpec!.levels.length).toBeGreaterThan(0);
	});
});

describe('owner 隔離', () => {
	it('別的 owner 讀不到資料', async () => {
		expect(await repo.getVideo('other@x', 'KUdmrPVssFA')).toBeNull();
		expect(await repo.listClipsByVideo('other@x', 'KUdmrPVssFA')).toEqual([]);
		expect(await repo.listInbox('other@x')).toEqual([]);
	});
});

describe('createClip', () => {
	it('建立後可從該影片的列表讀到，狀態為 inbox', async () => {
		const clip = await repo.createClip({
			ownerId: DEV_OWNER_ID,
			videoId: 'KUdmrPVssFA',
			startSec: 3,
			endSec: 13,
			note: '測試',
			origin: 'web'
		});
		expect(clip.status).toBe('inbox');
		expect(clip.analysisLevel).toBe('L0');
		expect(clip.tags).toEqual([]);
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		expect(clips.map((c) => c.id)).toContain(clip.id);
	});

	it('event_date 預設等於影片上傳日', async () => {
		const video = await repo.getVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		const clip = await repo.createClip({
			ownerId: DEV_OWNER_ID,
			videoId: 'KUdmrPVssFA',
			startSec: 0,
			endSec: 10,
			origin: 'web'
		});
		expect(clip.eventDate).toBe(video!.publishedAt);
	});

	it('列表依 startSec 排序', async () => {
		await repo.createClip({
			ownerId: DEV_OWNER_ID,
			videoId: 'KUdmrPVssFA',
			startSec: 1,
			endSec: 5,
			origin: 'web'
		});
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		const starts = clips.map((c) => c.startSec);
		expect([...starts].sort((a, b) => a - b)).toEqual(starts);
	});
});

describe('updateClip', () => {
	it('可修改 summary 與 status', async () => {
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		const updated = await repo.updateClip(DEV_OWNER_ID, clips[0].id, {
			summary: '改過的摘要',
			status: 'reviewed'
		});
		expect(updated.summary).toBe('改過的摘要');
		expect(updated.status).toBe('reviewed');
	});

	it('用 tagIds 改標籤時，來源標記為 human', async () => {
		const tags = await repo.listTags(DEV_OWNER_ID);
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		const updated = await repo.updateClip(DEV_OWNER_ID, clips[0].id, {
			tagIds: [tags[0].id]
		});
		expect(updated.tags).toHaveLength(1);
		expect(updated.tags[0].source).toBe('human');
		expect(updated.tags[0].tag.id).toBe(tags[0].id);
	});

	it('別的 owner 更新會拋錯', async () => {
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		await expect(repo.updateClip('other@x', clips[0].id, { note: 'x' })).rejects.toThrow();
	});
});

describe('listInbox', () => {
	it('只回傳尚未 reviewed 的 clip', async () => {
		const before = await repo.listInbox(DEV_OWNER_ID);
		await repo.updateClip(DEV_OWNER_ID, before[0].id, { status: 'reviewed' });
		const after = await repo.listInbox(DEV_OWNER_ID);
		expect(after.length).toBe(before.length - 1);
		expect(after.every((c) => c.status !== 'reviewed')).toBe(true);
	});
});

describe('searchClips', () => {
	it('只回傳 reviewed 的 clip', async () => {
		const result = await repo.searchClips(DEV_OWNER_ID, {});
		expect(result.clips.every((c) => c.status === 'reviewed')).toBe(true);
	});

	it('文字比對涵蓋 note、summary、transcript、visualDesc', async () => {
		const clips = await repo.listClipsByVideo(DEV_OWNER_ID, 'KUdmrPVssFA');
		await repo.updateClip(DEV_OWNER_ID, clips[0].id, {
			summary: '獨特關鍵字ABC',
			status: 'reviewed'
		});
		const result = await repo.searchClips(DEV_OWNER_ID, { text: '獨特關鍵字ABC' });
		expect(result.clips).toHaveLength(1);
	});

	it('日期區間可過濾', async () => {
		const result = await repo.searchClips(DEV_OWNER_ID, {
			dateFrom: '1900-01-01',
			dateTo: '1900-12-31'
		});
		expect(result.clips).toHaveLength(0);
	});

	it('回傳 parsed 讓 UI 顯示「聽懂了」', async () => {
		const result = await repo.searchClips(DEV_OWNER_ID, { text: '露營' });
		expect(result.parsed).toHaveProperty('keywords');
		expect(result.parsed.keywords).toContain('露營');
	});
});

describe('settings', () => {
	it('預設值為 20 / 10 / 不暫停', async () => {
		const s = await repo.getSettings(DEV_OWNER_ID);
		expect(s.markBeforeSec).toBe(20);
		expect(s.markAfterSec).toBe(10);
		expect(s.pauseOnMark).toBe(false);
	});

	it('可更新且會保留未指定的欄位', async () => {
		const s = await repo.updateSettings(DEV_OWNER_ID, { markBeforeSec: 30 });
		expect(s.markBeforeSec).toBe(30);
		expect(s.markAfterSec).toBe(10);
	});
});
