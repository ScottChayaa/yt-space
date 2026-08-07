import { describe, expect, it } from 'vitest';
import { frameAt, parseStoryboardSpec, pickLevel, sheetUrl } from './storyboard';

// 實測擷取自 YouTube watch page（24 秒的 unlisted 影片）
const REAL_SPEC =
	'https://i.ytimg.com/sb/KUdmrPVssFA/storyboard3_L$L/$N.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgjTpKzTBg==' +
	'|48#27#100#10#10#0#default#rs$AOn4CLDCQG-jwLOoOGPBLaFWxpqItJgENA' +
	'|80#45#25#10#10#1000#M$M#rs$AOn4CLAdQajGjXcFllukj8IozdMskyx6Zw' +
	'|160#90#25#5#5#1000#M$M#rs$AOn4CLDDTrcJY1ywfKuJLuu2E4bctSN8og' +
	'|320#180#25#3#3#1000#M$M#rs$AOn4CLAF8rkqvc6h6mM0WUjOJy55DJC1vA';

describe('parseStoryboardSpec', () => {
	it('解析出 base URL 與四個 level', () => {
		const spec = parseStoryboardSpec(REAL_SPEC);
		expect(spec).not.toBeNull();
		expect(spec!.levels).toHaveLength(4);
		expect(spec!.sqp).toBe('-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgjTpKzTBg==');
	});

	it('L3 的參數正確', () => {
		const spec = parseStoryboardSpec(REAL_SPEC)!;
		const l3 = spec.levels[3];
		expect(l3).toEqual({
			level: 3,
			width: 320,
			height: 180,
			frameCount: 25,
			cols: 3,
			rows: 3,
			intervalMs: 1000,
			sigh: 'rs$AOn4CLAF8rkqvc6h6mM0WUjOJy55DJC1vA'
		});
	});

	it('格式不符回傳 null', () => {
		expect(parseStoryboardSpec('')).toBeNull();
		expect(parseStoryboardSpec('https://example.com/no-levels')).toBeNull();
		expect(parseStoryboardSpec('not-a-url|1#2')).toBeNull();
	});
});

describe('pickLevel', () => {
	it('預設取 level 3', () => {
		const spec = parseStoryboardSpec(REAL_SPEC)!;
		expect(pickLevel(spec)!.level).toBe(3);
	});

	it('指定的 level 不存在時退回最高可用的', () => {
		const spec = parseStoryboardSpec(REAL_SPEC)!;
		expect(pickLevel(spec, 9)!.level).toBe(3);
	});

	it('沒有任何 interval > 0 的 level 時回傳 null', () => {
		const spec = { baseUrl: 'x', sqp: '', levels: [] };
		expect(pickLevel(spec)).toBeNull();
	});

	it('frameCount = 0 的 level 會被過濾掉', () => {
		const spec = {
			baseUrl: 'x',
			sqp: '',
			levels: [
				{ level: 0, width: 100, height: 100, frameCount: 0, cols: 3, rows: 3, intervalMs: 1000, sigh: 'test' }
			]
		};
		expect(pickLevel(spec)).toBeNull();
	});
});

describe('frameAt', () => {
	const spec = parseStoryboardSpec(REAL_SPEC)!;
	const l3 = spec.levels[3]; // 320x180, 3x3, 每格 1 秒

	it('t=0 是第 0 張的左上角', () => {
		expect(frameAt(l3, 0)).toMatchObject({ sheetIndex: 0, col: 0, row: 0, offsetX: 0, offsetY: 0 });
	});

	it('t=4 是第 0 張的第 1 列第 1 欄', () => {
		expect(frameAt(l3, 4)).toMatchObject({
			sheetIndex: 0,
			col: 1,
			row: 1,
			offsetX: -320,
			offsetY: -180
		});
	});

	it('t=9 跨到第 1 張的左上角', () => {
		expect(frameAt(l3, 9)).toMatchObject({ sheetIndex: 1, col: 0, row: 0 });
	});

	it('超過 frameCount 時夾到最後一格', () => {
		expect(frameAt(l3, 9999).sheetIndex).toBe(2);
		expect(frameAt(l3, 9999).col).toBe(0);
		expect(frameAt(l3, 9999).row).toBe(2);
	});

	it('帶出整張 sheet 的尺寸供 CSS background-size 使用', () => {
		expect(frameAt(l3, 0)).toMatchObject({ sheetWidth: 960, sheetHeight: 540 });
	});

	it('frameCount = 0 時回傳安全的索引（不為負）', () => {
		const zeroFrameLevel: typeof l3 = {
			level: 0,
			width: 320,
			height: 180,
			frameCount: 0,
			cols: 3,
			rows: 3,
			intervalMs: 1000,
			sigh: 'test'
		};
		const result = frameAt(zeroFrameLevel, 5);
		expect(result.sheetIndex).toBeGreaterThanOrEqual(0);
		expect(result.col).toBeGreaterThanOrEqual(0);
		expect(result.row).toBeGreaterThanOrEqual(0);
		expect(result.offsetX).toBeLessThanOrEqual(0);
		expect(result.offsetY).toBeLessThanOrEqual(0);
		// 實際預期為第 0 張左上角
		expect(result).toMatchObject({
			sheetIndex: 0,
			col: 0,
			row: 0,
			offsetX: 0,
			offsetY: 0
		});
	});
});

describe('sheetUrl', () => {
	it('把 $L 換成 level、$N 換成 M{index} 並補上 sigh', () => {
		const spec = parseStoryboardSpec(REAL_SPEC)!;
		const url = sheetUrl(spec, spec.levels[3], 1);
		expect(url).toContain('/storyboard3_L3/M1.jpg');
		expect(url).toContain('sigh=rs$AOn4CLAF8rkqvc6h6mM0WUjOJy55DJC1vA');
		expect(url).toContain('sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgjTpKzTBg==');
	});
});
