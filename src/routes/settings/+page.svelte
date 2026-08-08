<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let markBefore = $state(data.settings.markBeforeSec);
	let markAfter = $state(data.settings.markAfterSec);
	let pauseOnMark = $state(data.settings.pauseOnMark);
	let saved = $state(false);

	async function save() {
		const res = await fetch('/api/settings', {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				markBeforeSec: Number(markBefore),
				markAfterSec: Number(markAfter),
				pauseOnMark
			})
		});
		saved = res.ok;
	}
</script>

<section data-testid="page-settings">
	<h1>設定</h1>

	<h2>標記行為</h2>
	<label>
		標記時往前抓幾秒
		<input type="number" data-testid="mark-before" min="0" max="600" bind:value={markBefore} />
	</label>
	<label>
		標記時往後抓幾秒
		<input type="number" data-testid="mark-after" min="0" max="600" bind:value={markAfter} />
	</label>
	<label class="inline">
		<input type="checkbox" data-testid="pause-on-mark" bind:checked={pauseOnMark} />
		標記時自動暫停影片
	</label>

	<button data-testid="save-settings" onclick={save}>儲存</button>
	{#if saved}
		<p class="ok" data-testid="save-ok">已儲存</p>
	{/if}

	<h2>縮圖服務</h2>
	<p data-testid="sb-health" class:bad={!data.storyboardHealthy}>
		storyboard 解析器：{data.storyboardHealthy ? '正常' : '異常（已退回封面模式）'}
	</p>

	<h2>標籤（{data.tags.length}）</h2>
	<ul>
		{#each data.tags as tag (tag.id)}
			<li data-testid="tag-item">
				<strong>{tag.name}</strong>
				<span class="kind">{tag.kind}</span>
				{#if tag.aliases.length}
					<span class="aliases">別名：{tag.aliases.join('、')}</span>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		padding: 0.75rem;
	}

	h1 {
		font-size: 1.1rem;
	}

	h2 {
		font-size: 0.85rem;
		color: var(--text-dim);
		margin: 1.25rem 0 0.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		margin-bottom: 0.6rem;
	}

	label.inline {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	label.inline input {
		width: auto;
	}

	.ok {
		color: var(--ok);
		font-size: 0.8rem;
	}

	.bad {
		color: var(--danger);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		margin-bottom: 0.4rem;
		font-size: 0.85rem;
	}

	.kind,
	.aliases {
		color: var(--text-dim);
		font-size: 0.75rem;
		margin-left: 0.4rem;
	}
</style>
