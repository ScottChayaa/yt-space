<script lang="ts">
	import { page } from '$app/state';

	const items = [
		{ href: '/', label: '檢索', icon: '🔍', testid: 'nav-search' },
		{ href: '/inbox', label: 'Inbox', icon: '📥', testid: 'nav-inbox' },
		{ href: '/settings', label: '設定', icon: '⚙', testid: 'nav-settings' }
	];

	const current = $derived(page.url.pathname);
</script>

<nav>
	{#each items as item (item.href)}
		<a
			href={item.href}
			data-testid={item.testid}
			class:active={current === item.href}
			aria-current={current === item.href ? 'page' : undefined}
		>
			<span class="icon">{item.icon}</span>
			<span class="label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: calc(var(--nav-h) + env(safe-area-inset-bottom));
		padding-bottom: env(safe-area-inset-bottom);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		background: var(--surface);
		border-top: 1px solid var(--border);
		z-index: 50;
	}

	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		color: var(--text-dim);
		text-decoration: none;
		font-size: 0.7rem;
	}

	a.active {
		color: var(--accent);
	}

	.icon {
		font-size: 1.15rem;
	}
</style>
