export function secToMMSS(sec: number): string {
	const total = Math.max(0, Math.floor(sec));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, '0');
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function mmssToSec(text: string): number | null {
	const parts = text.trim().split(':');
	if (parts.length < 2 || parts.length > 3) return null;
	if (parts.some((p) => p === '' || !/^\d+$/.test(p))) return null;
	const nums = parts.map(Number);
	return nums.length === 3
		? nums[0] * 3600 + nums[1] * 60 + nums[2]
		: nums[0] * 60 + nums[1];
}

export function defaultRange(
	t: number,
	duration: number,
	before: number,
	after: number
): { startSec: number; endSec: number } {
	const startSec = Math.max(0, Math.round(t - before));
	const endSec = Math.min(Math.round(duration), Math.round(t + after));
	return { startSec, endSec };
}

export function shiftBoundary(value: number, delta: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value + delta));
}
