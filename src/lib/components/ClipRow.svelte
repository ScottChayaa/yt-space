<script lang="ts">
	import Thumb from './Thumb.svelte';
	import { secToMMSS } from '$lib/time';
	import type { Clip, Video } from '$lib/types';

	interface Props {
		clip: Clip;
		video: Video;
		selected: boolean;
		onselect: (id: string) => void;
	}

	let { clip, video, selected, onselect }: Props = $props();

	const STATUS_LABEL: Record<Clip['status'], string> = {
		inbox: '待分析',
		analyzing: '分析中',
		analyzed: '待校對',
		reviewed: '已完成',
		failed: '分析失敗'
	};
</script>

<button
	class="row"
	class:selected
	data-testid="clip-row"
	data-clip-id={clip.id}
	onclick={() => onselect(clip.id)}
>
	<Thumb {video} t={clip.startSec} width={96} />
	<div class="meta">
		<div class="range">{secToMMSS(clip.startSec)} – {secToMMSS(clip.endSec)}</div>
		<div class="title">{clip.summary || clip.note || '(未命名)'}</div>
		<div class="status" data-status={clip.status}>{STATUS_LABEL[clip.status]}</div>
	</div>
</button>

<style>
	.row {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		width: 100%;
		text-align: left;
		padding: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
	}

	.row.selected {
		border-color: var(--accent);
	}

	.meta {
		min-width: 0;
		flex: 1;
	}

	.range {
		font-variant-numeric: tabular-nums;
		font-size: 0.8rem;
		color: var(--text-dim);
	}

	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status {
		font-size: 0.7rem;
		color: var(--text-dim);
	}

	.status[data-status='reviewed'] {
		color: var(--ok);
	}

	.status[data-status='failed'] {
		color: var(--danger);
	}
</style>
