<script lang="ts">
	import type { Clip } from '$lib/types';

	interface Props {
		duration: number;
		clips: Clip[];
		currentTime: number;
		selectedId: string | null;
	}

	let { duration, clips, currentTime, selectedId }: Props = $props();

	const pct = (sec: number) => (duration > 0 ? (sec / duration) * 100 : 0);
</script>

<div class="timeline" data-testid="timeline">
	{#each clips as clip (clip.id)}
		<div
			class="band"
			class:selected={clip.id === selectedId}
			style:left="{pct(clip.startSec)}%"
			style:width="{Math.max(1, pct(clip.endSec - clip.startSec))}%"
		></div>
	{/each}
	<div class="playhead" style:left="{pct(currentTime)}%"></div>
</div>

<style>
	.timeline {
		position: relative;
		height: 10px;
		background: var(--surface-2);
		border-bottom: 1px solid var(--border);
	}

	.band {
		position: absolute;
		top: 0;
		bottom: 0;
		background: var(--accent);
		opacity: 0.45;
	}

	.band.selected {
		opacity: 1;
	}

	.playhead {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--text);
	}
</style>
