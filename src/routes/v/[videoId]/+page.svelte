<script lang="ts">
	import ClipRow from '$lib/components/ClipRow.svelte';
	import Player from '$lib/components/Player.svelte';
	import Timeline from '$lib/components/Timeline.svelte';
	import type { PlayerApi } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let clips = $state(data.clips);
	let selectedId = $state<string | null>(null);
	let currentTime = $state(0);
	let api = $state<PlayerApi | null>(null);

	function select(id: string) {
		selectedId = id;
		const clip = clips.find((c) => c.id === id);
		if (clip) api?.seekTo(clip.startSec);
	}
</script>

<section data-testid="page-studio">
	<Player videoId={data.video.id} bind:currentTime onready={(a) => (api = a)} />

	<Timeline duration={data.video.durationSec} {clips} {currentTime} {selectedId} />

	<header>
		<h1 data-testid="video-title">{data.video.title}</h1>
		<p data-testid="video-channel">{data.video.channelTitle} ・ {data.video.publishedAt}</p>
	</header>

	<div class="list">
		<h2>Clips ({clips.length})</h2>
		{#each clips as clip (clip.id)}
			<ClipRow {clip} video={data.video} selected={clip.id === selectedId} onselect={select} />
		{/each}
	</div>
</section>

<style>
	header {
		padding: 0.75rem;
	}

	h1 {
		font-size: 1rem;
		margin: 0 0 0.2rem;
	}

	header p {
		margin: 0;
		font-size: 0.8rem;
		color: var(--text-dim);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0 0.75rem 1rem;
	}

	h2 {
		font-size: 0.85rem;
		color: var(--text-dim);
		margin: 0.25rem 0;
	}
</style>
