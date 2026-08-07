<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<main class="app-main">
	{@render children()}
</main>
