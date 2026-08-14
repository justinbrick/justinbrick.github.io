<script lang="ts">
    import { onMount } from "svelte";
    import { acceptCallback } from "$lib/auth.svelte";

    onMount(acceptCallback);
</script>
