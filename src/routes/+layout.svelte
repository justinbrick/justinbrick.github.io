<script lang="ts">
	import "$lib/styles.scss";
	import "@picocss/pico/css/pico.min.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="container">
	<nav>
		<ul><h3>justin.directory</h3></ul>
		<ul>
			<li><a href="/">Home</a></li>
		</ul>
	</nav>
</header>
<hr />

<main class="container">
	{@render children()}
</main>

<footer class="container">
	<hr />
	<p>Copyright 2026 Justin</p>
	<p>Website made with absolutely no AI.</p>
</footer>
