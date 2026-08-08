<script lang="ts">
	import ResultCard from '$lib/components/ResultCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let text = $state(data.query.text);
	let dateFrom = $state(data.query.dateFrom);
	let dateTo = $state(data.query.dateTo);

	const parsedSummary = $derived.by(() => {
		const p = data.result.parsed;
		const bits: string[] = [];
		if (p.dateFrom || p.dateTo) bits.push(`${p.dateFrom ?? '不限'} ~ ${p.dateTo ?? '不限'}`);
		if (p.tagNames.length) bits.push(p.tagNames.join('、'));
		if (p.keywords.length) bits.push(p.keywords.join('、'));
		return bits.length ? bits.join(' ・ ') : '沒有條件，列出全部';
	});
</script>

<section data-testid="page-search">
	<h1>檢索</h1>

	<form method="GET" data-testid="search-form">
		<input
			name="text"
			data-testid="search-input"
			placeholder="用一句話描述你要找的片段"
			bind:value={text}
		/>
		<div class="dates">
			<input type="date" name="dateFrom" bind:value={dateFrom} aria-label="起始日期" />
			<input type="date" name="dateTo" bind:value={dateTo} aria-label="結束日期" />
			<button type="submit" data-testid="search-submit">搜尋</button>
		</div>
	</form>

	<p class="parsed" data-testid="parsed-summary">聽懂了：{parsedSummary}</p>

	{#if data.result.clips.length === 0}
		<p class="empty" data-testid="search-empty">找不到符合的片段。</p>
	{/if}

	{#each data.result.clips as clip (clip.id)}
		{#if data.videos[clip.videoId]}
			<ResultCard {clip} video={data.videos[clip.videoId]} />
		{/if}
	{/each}
</section>

<style>
	section {
		padding: 0.75rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 0.5rem;
	}

	.dates {
		display: flex;
		gap: 0.4rem;
	}

	.parsed {
		font-size: 0.78rem;
		color: var(--text-dim);
		margin: 0 0 0.75rem;
	}

	.empty {
		color: var(--text-dim);
	}
</style>
