<script lang="ts">
	import Thumb from '$lib/components/Thumb.svelte';
	import { secToMMSS } from '$lib/time';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const total = $derived(data.groups.reduce((n, g) => n + g.clips.length, 0));
</script>

<section data-testid="page-inbox">
	<h1>Inbox ({total})</h1>

	{#if total === 0}
		<p class="empty" data-testid="inbox-empty">目前沒有待處理的片段。</p>
	{/if}

	{#each data.groups as group (group.video.id)}
		<article data-testid="inbox-group">
			<header>
				<strong>{group.video.title}</strong>
				<span>@{group.video.channelTitle} ・ {group.clips.length} 個片段</span>
			</header>
			{#each group.clips as clip (clip.id)}
				<a
					class="clip"
					data-testid="inbox-clip"
					data-clip-id={clip.id}
					href="/v/{group.video.id}"
				>
					<Thumb video={group.video} t={clip.startSec} width={80} />
					<div>
						<div class="range">{secToMMSS(clip.startSec)} – {secToMMSS(clip.endSec)}</div>
						<div>{clip.summary || clip.note || '(未命名)'}</div>
					</div>
				</a>
			{/each}
		</article>
	{/each}
</section>

<style>
	section {
		padding: 0.75rem;
	}

	h1 {
		font-size: 1.1rem;
	}

	.empty {
		color: var(--text-dim);
	}

	article {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		margin-bottom: 0.75rem;
		overflow: hidden;
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0.6rem;
		border-bottom: 1px solid var(--border);
	}

	header span {
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.clip {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		padding: 0.5rem 0.6rem;
		color: inherit;
		text-decoration: none;
		border-top: 1px solid var(--border);
	}

	.range {
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-dim);
	}
</style>
