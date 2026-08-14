<script lang="ts">
    import { authState, PROVIDERS, loginWithProvider } from "$lib/auth.svelte";
</script>

<button id="login" popovertarget="login-providers">Login</button>
<div id="login-providers" popover>
    {#each Object.entries(PROVIDERS) as [provider, data]}
        <button
            aria-label="Login using {data.details.name}"
            class="secondary"
            onclick={() => loginWithProvider(provider)}
        >
            <img src={data.details.imagePath} alt="{data.details.name} logo" />
        </button>
    {/each}
</div>

<style lang="scss">
    [popover] {
        position-area: bottom;
        margin: unset;
        border: unset;
    }
    .icon {
        border-radius: 25%;
        background-color: white;
    }
</style>
