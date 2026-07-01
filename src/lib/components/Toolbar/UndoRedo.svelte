<script lang="ts">
  import { posterStore, canUndo, canRedo } from '$lib/stores/posterStore';
</script>

<div class="undo-redo">
  <button
    type="button"
    class="toolbar-btn"
    title="Undo (Ctrl+Z)"
    disabled={!$canUndo}
    on:click={() => posterStore.undo()}
  >
    ↶ Undo
  </button>
  <button
    type="button"
    class="toolbar-btn"
    title="Redo (Ctrl+Y)"
    disabled={!$canRedo}
    on:click={() => posterStore.redo()}
  >
    ↷ Redo
  </button>
</div>

<style>
  .undo-redo {
    display: inline-flex;
    gap: 6px;
  }
  .toolbar-btn {
    border: 1px solid #e2e8f0;
    background: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
  }
  .toolbar-btn:hover:not(:disabled) {
    background: #f1f5f9;
  }
  .toolbar-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
