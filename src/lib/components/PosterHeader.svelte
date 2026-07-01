<script lang="ts">
  import { posterStore } from '$lib/stores/posterStore';
  import EditableText from './EditableText.svelte';
</script>

<header class="poster-header">
  {#if $posterStore.logo.dataUrl && $posterStore.logo.position !== 'center-watermark'}
    <img
      class="poster-logo poster-logo-{$posterStore.logo.position}"
      src={$posterStore.logo.dataUrl}
      alt="Organization logo"
      style="width:{$posterStore.logo.size}px; height:{$posterStore.logo.size}px;"
    />
  {/if}
  <EditableText
    tag="h1"
    className="poster-title"
    value={$posterStore.organization}
    placeholder="Organization name"
    on:change={(e) => posterStore.setOrganization(e.detail)}
  />
</header>

{#if $posterStore.logo.dataUrl && $posterStore.logo.position === 'center-watermark'}
  <img
    class="poster-watermark"
    src={$posterStore.logo.dataUrl}
    alt=""
    style="opacity:{$posterStore.logo.opacity};"
  />
{/if}

<style>
  .poster-header {
    position: relative;
    text-align: center;
    padding-bottom: 14px;
  }

  :global(.poster-title) {
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: calc(38px * var(--font-scale));
    color: var(--header-text);
    text-shadow: var(--header-shadow);
    letter-spacing: 0.5px;
    display: inline-block;
    min-width: 200px;
  }

  .poster-logo {
    position: absolute;
    top: 0;
    object-fit: contain;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    padding: 4px;
  }

  .poster-logo-top-left {
    left: 0;
  }

  .poster-logo-top-right {
    right: 0;
  }

  .poster-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 55%;
    pointer-events: none;
    z-index: 0;
  }
</style>
