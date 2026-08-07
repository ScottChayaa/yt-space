import { describe, expect, it } from 'vitest';
import { defaultRange, mmssToSec, secToMMSS, shiftBoundary } from './time';

describe('secToMMSS', () => {
	it('補零成 mm:ss', () => {
		expect(secToMMSS(0)).toBe('00:00');
		expect(secToMMSS(75)).toBe('01:15');
		expect(secToMMSS(750)).toBe('12:30');
	});

	it('超過一小時改用 h:mm:ss', () => {
		expect(secToMMSS(3661)).toBe('1:01:01');
	});

	it('負數與小數一律夾到合法值', () => {
		expect(secToMMSS(-5)).toBe('00:00');
		expect(secToMMSS(75.9)).toBe('01:15');
	});
});

describe('mmssToSec', () => {
	it('解析 mm:ss 與 h:mm:ss', () => {
		expect(mmssToSec('01:15')).toBe(75);
		expect(mmssToSec('12:30')).toBe(750);
		expect(mmssToSec('1:01:01')).toBe(3661);
	});

	it('格式錯誤回傳 null', () => {
		expect(mmssToSec('abc')).toBeNull();
		expect(mmssToSec('')).toBeNull();
		expect(mmssToSec('1:2:3:4')).toBeNull();
	});
});

describe('defaultRange', () => {
	it('以 t 為基準向前 20 秒、向後 10 秒', () => {
		expect(defaultRange(750, 1471, 20, 10)).toEqual({ startSec: 730, endSec: 760 });
	});

	it('起點不會小於 0', () => {
		expect(defaultRange(5, 1471, 20, 10)).toEqual({ startSec: 0, endSec: 15 });
	});

	it('終點不會超過影片長度', () => {
		expect(defaultRange(1468, 1471, 20, 10)).toEqual({ startSec: 1448, endSec: 1471 });
	});
});

describe('shiftBoundary', () => {
	it('位移後夾在 min 與 max 之間', () => {
		expect(shiftBoundary(100, 5, 0, 200)).toBe(105);
		expect(shiftBoundary(3, -5, 0, 200)).toBe(0);
		expect(shiftBoundary(198, 5, 0, 200)).toBe(200);
	});
});
