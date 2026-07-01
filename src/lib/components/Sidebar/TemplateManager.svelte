<script lang="ts">
  import { posterStore, currentPosterData } from '$lib/stores/posterStore';
  import { templateService } from '$lib/services/templateService';
  import type { PosterTemplate } from '$lib/types';

  let templates: PosterTemplate[] = templateService.list();
  let newTemplateName = '';

  function refresh() {
    templates = templateService.list();
  }

  function saveTemplate() {
    const name = newTemplateName.trim() || `${$posterStore.organization} — ${$posterStore.month} ${$posterStore.year}`;
    templateService.save(name, currentPosterData());
    newTemplateName = '';
    refresh();
  }

  function loadTemplate(t: PosterTemplate) {
    posterStore.loadData(t.data);
  }

  function duplicateTemplate(t: PosterTemplate) {
    templateService.duplicate(t.id);
    refresh();
  }

  function deleteTemplate(t: PosterTemplate) {
    if (!confirm(`Delete template "${t.name}"? This cannot be undone.`)) return;
    templateService.remove(t.id);
    refresh();
  }
</script>

<div class="panel">
  <h2 class="panel-title">Save current poster as template</h2>
  <div class="field-row">
    <input
      type="text"
      placeholder="Template name (optional)"
      bind:value={newTemplateName}
      class="flex-1"
    />
    <button type="button" class="btn-primary" on:click={saveTemplate}>Save</button>
  </div>

  <h2 class="panel-title mt">Saved templates ({templates.length})</h2>
  <ul class="template-list">
    {#each templates as t (t.id)}
      <li class="template-item">
        <div class="template-info">
          <strong>{t.name}</strong>
          <span class="template-meta">
            {t.data.organization} · {t.data.month} {t.data.year} · {t.data.events.length} events
          </span>
        </div>
        <div class="template-actions">
          <button type="button" class="btn-secondary sm" on:click={() => loadTemplate(t)}
            >Load</button
          >
          <button type="button" class="icon-btn" title="Duplicate" on:click={() => duplicateTemplate(t)}
            >⧉</button
          >
          <button type="button" class="icon-btn danger" title="Delete" on:click={() => deleteTemplate(t)}
            >✕</button
          >
        </div>
      </li>
    {/each}
    {#if templates.length === 0}
      <li class="empty">No saved templates yet. Save your current poster above to reuse it next month.</li>
    {/if}
  </ul>
</div>
