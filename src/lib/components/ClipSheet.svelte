<script lang="ts">
	import TagChip from './TagChip.svelte';
	import { secToMMSS, shiftBoundary } from '$lib/time';
	import type { Clip, Tag, Video } from '$lib/types';
	import type { UpdateClipPatch } from '$lib/server/repo/types';

	interface Props {
		clip: Clip;
		video: Video;
		tags: Tag[];
		currentTime: number;
		onupdate: (patch: UpdateClipPatch) => void;
		onclose: () => void;
	}

	let { clip, video, tags, currentTime, onupdate, onclose }: Props = $props();

	const dateMismatch = $derived(clip.eventDate !== video.publishedAt);
	const unusedTags = $derived(
		tags.filter((t) => !clip.tags.some((ct) => ct.tag.id === t.id))
	);

	let showRaw = $state(false);

	function moveStart(delta: number) {
		onupdate({ startSec: shiftBoundary(clip.startSec, delta, 0, clip.endSec - 1) });
	}

	function moveEnd(delta: number) {
		onupdate({ endSec: shiftBoundary(clip.endSec, delta, clip.startSec + 1, video.durationSec) });
	}

	function currentTagIds() {
		return clip.tags.map((ct) => ct.tag.id);
	}
</script>

<div class="sheet" data-testid="clip-sheet">
	<button class="handle" data-testid="sheet-close" onclick={onclose} aria-label="關閉面板"></button>

	<div class="range" data-testid="sheet-range">
		{secToMMSS(clip.startSec)} – {secToMMSS(clip.endSec)}
	</div>

	<div class="row">
		<span>起</span>
		<button onclick={() => onupdate({ startSec: Math.min(Math.round(currentTime), clip.endSec - 1) })}>
			設為目前
		</button>
		<button data-testid="start-minus" onclick={() => moveStart(-5)}>−5s</button>
		<button data-testid="start-plus" onclick={() => moveStart(5)}>+5s</button>
	</div>

	<div class="row">
		<span>迄</span>
		<button onclick={() => onupdate({ endSec: Math.max(Math.round(currentTime), clip.startSec + 1) })}>
			設為目前
		</button>
		<button data-testid="end-minus" onclick={() => moveEnd(-5)}>−5s</button>
		<button data-testid="end-plus" onclick={() => moveEnd(5)}>+5s</button>
	</div>

	<label>
		備註
		<input
			data-testid="field-note"
			value={clip.note}
			onchange={(e) => onupdate({ note: e.currentTarget.value })}
		/>
	</label>

	<label>
		摘要
		<textarea
			data-testid="field-summary"
			rows="2"
			value={clip.summary}
			onchange={(e) => onupdate({ summary: e.currentTarget.value })}
		></textarea>
	</label>

	<div class="tags">
		{#each clip.tags as ct (ct.tag.id)}
			<TagChip
				clipTag={ct}
				onconfirm={(id) => onupdate({ tagIds: [...new Set([...currentTagIds(), id])] })}
				onremove={(id) => onupdate({ tagIds: currentTagIds().filter((x) => x !== id) })}
			/>
		{/each}
		{#if unusedTags.length > 0}
			<select
				data-testid="add-tag"
				value=""
				onchange={(e) => {
					const id = e.currentTarget.value;
					if (id) onupdate({ tagIds: [...currentTagIds(), id] });
					e.currentTarget.value = '';
				}}
			>
				<option value="">＋ 加標籤</option>
				{#each unusedTags as t (t.id)}
					<option value={t.id}>{t.name}</option>
				{/each}
			</select>
		{/if}
	</div>

	<label class="date">
		日期
		<input
			type="date"
			data-testid="field-date"
			value={clip.eventDate}
			onchange={(e) => onupdate({ eventDate: e.currentTarget.value })}
		/>
		{#if dateMismatch}
			<span class="warn" data-testid="date-mismatch">⚠ 與上傳日 {video.publishedAt} 不同</span>
		{/if}
	</label>

	<button class="toggle" onclick={() => (showRaw = !showRaw)}>
		{showRaw ? '▾' : '▸'} 語音逐字 / 畫面描述
	</button>
	{#if showRaw}
		<label>
			語音逐字
			<textarea
				data-testid="field-transcript"
				rows="2"
				value={clip.transcript}
				onchange={(e) => onupdate({ transcript: e.currentTarget.value })}
			></textarea>
		</label>
		<label>
			畫面描述
			<textarea
				data-testid="field-visual"
				rows="2"
				value={clip.visualDesc}
				onchange={(e) => onupdate({ visualDesc: e.currentTarget.value })}
			></textarea>
		</label>
	{/if}

	<button class="confirm" data-testid="confirm-clip" onclick={() => onupdate({ status: 'reviewed' })}>
		✓ 確認完成
	</button>
</div>

<style>
	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
		max-height: 62dvh;
		overflow-y: auto;
		z-index: 45;
		background: var(--surface);
		border-top: 1px solid var(--border);
		border-radius: 16px 16px 0 0;
		padding: 0.5rem 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.handle {
		width: 44px;
		height: 5px;
		border-radius: 3px;
		background: var(--border);
		border: 0;
		padding: 0;
		align-self: center;
		margin-bottom: 0.25rem;
		flex-shrink: 0;
	}

	.range {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		color: var(--text-dim);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.warn {
		color: var(--warn);
		font-size: 0.75rem;
	}

	.toggle {
		align-self: flex-start;
		background: none;
		border: 0;
		padding: 0;
		color: var(--text-dim);
		font-size: 0.8rem;
	}

	.confirm {
		background: var(--ok);
		border-color: var(--ok);
		color: #06210f;
		font-weight: 600;
		padding: 0.75rem;
	}
</style>
