<script lang="ts">
	import Thumb from './Thumb.svelte';
	import { secToMMSS } from '$lib/time';
	import type { Clip, Video } from '$lib/types';

	interface Props {
		clip: Clip;
		video: Video;
	}

	let { clip, video }: Props = $props();

	let playing = $state(false);

	const embedSrc = $derived(
		`https://www.youtube.com/embed/${video.id}` +
			`?start=${clip.startSec}&end=${clip.endSec}&autoplay=1&mute=1&playsinline=1`
	);
</script>

<article class="card" data-testid="result-card">
	{#if playing}
		<iframe
			data-testid="result-iframe"
			src={embedSrc}
			title={clip.summary || '片段'}
			allow="autoplay; encrypted-media; picture-in-picture"
			allowfullscreen
		></iframe>
	{:else}
		<button class="cover" data-testid="play-clip" onclick={() => (playing = true)}>
			<Thumb {video} t={clip.startSec} width={360} />
			<span class="play">▶</span>
		</button>
	{/if}

	<div class="meta">
		<div class="range">{secToMMSS(clip.startSec)} – {secToMMSS(clip.endSec)}</div>
		<div class="summary">{clip.summary || clip.note || '(未命名)'}</div>
		<div class="sub">{clip.eventDate} ・ @{video.channelTitle}</div>
		<a class="external" href="https://youtu.be/{video.id}?t={clip.startSec}" target="_blank" rel="noreferrer">
			在 YouTube 開啟 ↗
		</a>
	</div>
</article>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		margin-bottom: 0.75rem;
	}

	iframe {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: 0;
		display: block;
	}

	.cover {
		position: relative;
		width: 100%;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: #000;
		display: block;
	}

	.cover :global(.thumb) {
		width: 100% !important;
		height: auto !important;
		aspect-ratio: 16 / 9;
	}

	.play {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 2rem;
		color: #fff;
		text-shadow: 0 2px 8px rgb(0 0 0 / 0.6);
	}

	.meta {
		padding: 0.6rem;
	}

	.range {
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-dim);
	}

	.summary {
		margin: 0.15rem 0;
	}

	.sub {
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.external {
		display: inline-block;
		margin-top: 0.35rem;
		font-size: 0.75rem;
		color: var(--accent);
	}
</style>
