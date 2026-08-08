<script lang="ts">
	import type { ClipTag } from '$lib/types';

	interface Props {
		clipTag: ClipTag;
		onconfirm: (tagId: string) => void;
		onremove: (tagId: string) => void;
	}

	let { clipTag, onconfirm, onremove }: Props = $props();

	const KIND_ICON: Record<string, string> = {
		person: '👤',
		pet: '🐾',
		place: '📍',
		topic: '⌗',
		other: '⌗'
	};
</script>

<span class="chip" data-testid="tag-chip" data-source={clipTag.source}>
	<button
		class="body"
		onclick={() => onconfirm(clipTag.tag.id)}
		title={clipTag.source === 'ai' ? '點一下確認這個標籤' : '已確認'}
	>
		{KIND_ICON[clipTag.tag.kind]}
		{clipTag.tag.name}
	</button>
	<button class="x" onclick={() => onremove(clipTag.tag.id)} aria-label="移除標籤">✕</button>
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		border: 1px solid var(--border);
		overflow: hidden;
		font-size: 0.8rem;
	}

	.chip[data-source='ai'] {
		border-style: dashed;
		opacity: 0.75;
	}

	.body,
	.x {
		border: 0;
		border-radius: 0;
		background: var(--surface-2);
		padding: 0.25rem 0.5rem;
	}

	.x {
		color: var(--text-dim);
		padding-left: 0.25rem;
	}
</style>
