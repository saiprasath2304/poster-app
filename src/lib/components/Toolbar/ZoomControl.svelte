<script lang="ts">
  import { zoom, ZOOM_LEVELS } from '$lib/stores/uiStore';
</script>

<div class="zoom-control">
  {#each ZOOM_LEVELS as level (level)}
    <button
      type="button"
      class="zoom-btn"
      class:active={$zoom === level}
      on:click={() => zoom.set(level)}
    >
      {Math.round(level * 100)}%
    </button>
  {/each}
</div>

<style>
  .zoom-control {
    display: inline-flex;
    background: #f1f5f9;
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
  }
  .zoom-btn {
    border: none;
    background: transparent;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
  }
  .zoom-btn.active {
    background: white;
    color: #1e293b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  .zoom-btn:hover:not(.active) {
    color: #1e293b;
  }
</style>
