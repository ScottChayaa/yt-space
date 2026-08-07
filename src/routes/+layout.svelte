<script lang="ts">
	import '../app.css';
	import BottomNav from '$lib/components/BottomNav.svelte';
	let { children } = $props();
</script>

<main class="app-main">
	{@render children()}
</main>

<BottomNav />
