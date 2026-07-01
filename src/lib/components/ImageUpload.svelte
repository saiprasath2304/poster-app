<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let currentDataUrl: string | null = null;
  export let label = 'Upload image';

  const dispatch = createEventDispatcher<{ upload: string; clear: void }>();
  let inputEl: HTMLInputElement;

  function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => dispatch('upload', reader.result as string);
    reader.readAsDataURL(file);
  }
</script>

<div class="upload-row">
  {#if currentDataUrl}
    <img src={currentDataUrl} alt="Uploaded preview" class="thumb" />
  {/if}
  <div class="buttons">
    <button type="button" class="btn-secondary" on:click={() => inputEl.click()}>
      {label}
    </button>
    {#if currentDataUrl}
      <button type="button" class="btn-text" on:click={() => dispatch('clear')}>Remove</button>
    {/if}
  </div>
  <input
    bind:this={inputEl}
    type="file"
    accept="image/*"
    class="hidden-input"
    on:change={handleFile}
  />
</div>

<style>
  .upload-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .thumb {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: white;
  }
  .buttons {
    display: flex;
    gap: 8px;
  }
  .hidden-input {
    display: none;
  }
</style>
