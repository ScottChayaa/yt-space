<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { secToMMSS } from '$lib/time';
	import type { PlayerApi } from '$lib/types';

	interface Props {
		videoId: string;
		currentTime?: number;
		onready?: (api: PlayerApi) => void;
	}

	let { videoId, currentTime = $bindable(0), onready }: Props = $props();

	const isFake = env.PUBLIC_PLAYER_MODE === 'fake';

	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let ticker: ReturnType<typeof setInterval> | null = null;

	function post(func: string, args: unknown[] = []) {
		iframeEl?.contentWindow?.postMessage(
			JSON.stringify({ event: 'command', func, args }),
			'https://www.youtube.com'
		);
	}

	let endAt = $state<number | null>(null);

	function seekTo(sec: number) {
		currentTime = sec;
		if (!isFake) post('seekTo', [sec, true]);
	}

	function playRange(start: number, end: number) {
		seekTo(start);
		if (!isFake) post('playVideo');
		endAt = end;
	}

	function pause() {
		if (!isFake) post('pauseVideo');
		if (ticker) clearInterval(ticker);
		ticker = null;
	}

	// 掛載後把控制介面交給父層。$effect 只跑一次即可，
	// 因此不讀取任何 reactive 值以避免重複觸發。
	$effect(() => {
		onready?.({ seekTo, playRange, pause });
	});

	$effect(() => {
		if (isFake) return;
		// YouTube iframe 不提供跨域讀取時間，改以本地計時器推進，
		// 精度足以支撐標記用途；第二階段可改接 IFrame Player API。
		ticker = setInterval(() => {
			currentTime += 0.25;
			if (endAt !== null && currentTime >= endAt) {
				pause();
				endAt = null;
			}
		}, 250);
		return () => {
			if (ticker) clearInterval(ticker);
		};
	});
</script>

<div class="player">
	{#if isFake}
		<div class="fake" data-testid="fake-player">
			<div class="fake-id">{videoId}</div>
			<label>
				目前時間（秒）
				<input
					type="number"
					data-testid="fake-time"
					value={currentTime}
					oninput={(e) => (currentTime = Number(e.currentTarget.value))}
				/>
			</label>
			<div data-testid="fake-clock">{secToMMSS(currentTime)}</div>
		</div>
	{:else}
		<iframe
			bind:this={iframeEl}
			data-testid="yt-iframe"
			src="https://www.youtube.com/embed/{videoId}?enablejsapi=1&playsinline=1"
			title="YouTube 播放器"
			allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		></iframe>
	{/if}
</div>

<style>
	.player {
		position: sticky;
		top: 0;
		z-index: 20;
		background: #000;
		aspect-ratio: 16 / 9;
		width: 100%;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	.fake {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: var(--surface-2);
		font-size: 0.8rem;
	}

	.fake input {
		width: 8rem;
	}
</style>
