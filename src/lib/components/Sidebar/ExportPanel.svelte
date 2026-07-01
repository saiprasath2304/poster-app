<script lang="ts">
  import { posterStore, currentPosterData, exportPosterJson } from '$lib/stores/posterStore';
  import { exportAsPng, exportAsJpg, exportAsPdf, printNode } from '$lib/utils/exportUtils';
  import type { PosterJsonExport } from '$lib/types';

  export let previewEl: HTMLDivElement | undefined = undefined;

  let exporting = false;
  let jsonFileInput: HTMLInputElement;
  let statusMessage = '';

  function baseFilename() {
    const org = $posterStore.organization.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    return `${org || 'poster'}-${$posterStore.month.toLowerCase()}-${$posterStore.year}`;
  }

  async function runExport(fn: (node: HTMLElement, opts: { filename: string }) => Promise<void>, ext: string) {
    if (!previewEl) return;
    exporting = true;
    statusMessage = '';
    try {
      await fn(previewEl, { filename: `${baseFilename()}.${ext}` });
      statusMessage = `Exported ${ext.toUpperCase()} successfully.`;
    } catch (err) {
      console.error(err);
      statusMessage = `Export failed: ${(err as Error).message}`;
    } finally {
      exporting = false;
    }
  }

  async function handlePrint() {
    if (!previewEl) return;
    exporting = true;
    try {
      await printNode(previewEl);
    } finally {
      exporting = false;
    }
  }

  function exportJson() {
    const data = exportPosterJson(currentPosterData());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function triggerJsonImport() {
    jsonFileInput.click();
  }

  function handleJsonImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string) as PosterJsonExport;
        posterStore.importJson(json);
        statusMessage = 'JSON imported successfully.';
      } catch (err) {
        statusMessage = 'Could not parse that JSON file.';
      }
    };
    reader.readAsText(file);
    (e.target as HTMLInputElement).value = '';
  }
</script>

<div class="panel">
  <h2 class="panel-title">Export poster</h2>
  <div class="export-grid">
    <button
      type="button"
      class="btn-primary"
      disabled={exporting}
      on:click={() => runExport(exportAsPng, 'png')}
    >
      Export PNG
    </button>
    <button
      type="button"
      class="btn-primary"
      disabled={exporting}
      on:click={() => runExport(exportAsJpg, 'jpg')}
    >
      Export JPG
    </button>
    <button
      type="button"
      class="btn-primary"
      disabled={exporting}
      on:click={() => runExport(exportAsPdf, 'pdf')}
    >
      Export PDF
    </button>
    <button type="button" class="btn-secondary" disabled={exporting} on:click={handlePrint}>
      Print
    </button>
  </div>
  {#if statusMessage}
    <p class="status-msg">{statusMessage}</p>
  {/if}

  <h2 class="panel-title mt">Import / export data</h2>
  <div class="export-grid two-col">
    <button type="button" class="btn-secondary" on:click={exportJson}>Export JSON</button>
    <button type="button" class="btn-secondary" on:click={triggerJsonImport}>Import JSON</button>
  </div>
  <input
    bind:this={jsonFileInput}
    type="file"
    accept="application/json"
    class="hidden-input"
    on:change={handleJsonImport}
  />

  <h2 class="panel-title mt">Danger zone</h2>
  <button
    type="button"
    class="btn-text danger"
    on:click={() => {
      if (confirm('Reset the poster to a blank default? This cannot be undone (but Ctrl+Z works once).'))
        posterStore.reset();
    }}
  >
    Reset poster to blank
  </button>
</div>

<style>
  .hidden-input {
    display: none;
  }
</style>
