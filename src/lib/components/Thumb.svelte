<script lang="ts">
	import { frameAt, pickLevel, sheetUrl } from '$lib/storyboard';
	import type { Video } from '$lib/types';

	interface Props {
		video: Video;
		t: number;
		width?: number;
	}

	let { video, t, width = 120 }: Props = $props();

	const level = $derived(video.sbSpec ? pickLevel(video.sbSpec) : null);
	const pos = $derived(level ? frameAt(level, t) : null);
	const scale = $derived(pos ? width / pos.width : 1);
	const url = $derived(
		video.sbSpec && level && pos ? sheetUrl(video.sbSpec, level, pos.sheetIndex) : null
	);
	const fallback = $derived(`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`);
</script>

{#if url && pos}
	<div
		class="thumb sb"
		data-testid="thumb-storyboard"
		style:width="{width}px"
		style:height="{pos.height * scale}px"
		style:background-image="url({url})"
		style:background-size="{pos.sheetWidth * scale}px {pos.sheetHeight * scale}px"
		style:background-position="{pos.offsetX * scale}px {pos.offsetY * scale}px"
		role="img"
		aria-label="片段畫面"
	></div>
{:else}
	<img
		class="thumb"
		data-testid="thumb-cover"
		src={fallback}
		alt="影片封面"
		style:width="{width}px"
		loading="lazy"
	/>
{/if}

<style>
	.thumb {
		border-radius: 8px;
		background-color: var(--surface-2);
		background-repeat: no-repeat;
		flex-shrink: 0;
		display: block;
	}

	img.thumb {
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}
</style>
