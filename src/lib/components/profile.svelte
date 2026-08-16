<script lang="ts">
    import {
        authState,
        PROVIDERS,
        loginWithProvider,
        logout,
    } from "$lib/auth.svelte";
    import AccountIcon from "$lib/assets/icons/account_circle.svg";
</script>

{#if !authState.idToken}
    <button id="login" popovertarget="login-providers">Login</button>
    <div id="login-providers" popover>
        {#each Object.entries(PROVIDERS) as [provider, data]}
            <button
                aria-label="Login using {data.details.name}"
                class="secondary"
                onclick={() => loginWithProvider(provider)}
            >
                <img
                    src={data.details.imagePath}
                    alt="{data.details.name} logo"
                />
            </button>
        {/each}
    </div>
{:else}
    <button
        id="profile"
        aria-label="See profile options"
        class="secondary"
        popovertarget="profile-popover"
    >
        <img src={AccountIcon} alt="Account icon" />
        {authState.idToken.name}
    </button>
    <div id="profile-popover" popover>
        <button onclick={logout}>Log out</button>
    </div>
{/if}

<style lang="scss">
    [popover] {
        position-area: bottom;
        margin: unset;
        border: unset;
    }
</style>
