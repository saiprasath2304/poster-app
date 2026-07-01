<script lang="ts">
  import { posterStore } from '$lib/stores/posterStore';
  import { generateId } from '$lib/utils/id';
  import type { FooterItem } from '$lib/types';

  let newTitle = '';
  let newPosition: 'left' | 'right' = 'left';
  let newDates = '';
  let newItems: FooterItem[] = [{ id: generateId(), time: '', label: '' }];

  let draggedId: string | null = null;

  $: sortedSections = [...$posterStore.footerSections].sort((a, b) => a.order - b.order);

  function addItemRow() {
    newItems = [...newItems, { id: generateId(), time: '', label: '' }];
  }
  function removeItemRow(id: string) {
    newItems = newItems.filter((i) => i.id !== id);
  }

  function addSection() {
    if (!newTitle.trim()) return;
    const dates = newDates
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const cleanItems = newItems.filter((i) => i.time.trim() || i.label.trim());
    posterStore.addFooterSection({
      title: newTitle.trim(),
      dates,
      items: cleanItems,
      position: newPosition,
      visible: true
    });
    newTitle = '';
    newDates = '';
    newItems = [{ id: generateId(), time: '', label: '' }];
  }

  function addItemToSection(sectionId: string) {
    const section = $posterStore.footerSections.find((s) => s.id === sectionId);
    if (!section) return;
    posterStore.updateFooterSection(sectionId, {
      items: [...section.items, { id: generateId(), time: '', label: '' }]
    });
  }

  function removeItemFromSection(sectionId: string, itemId: string) {
    const section = $posterStore.footerSections.find((s) => s.id === sectionId);
    if (!section) return;
    posterStore.updateFooterSection(sectionId, {
      items: section.items.filter((i) => i.id !== itemId)
    });
  }

  function updateSectionTitle(sectionId: string, e: Event) {
    posterStore.updateFooterSection(sectionId, {
      title: (e.target as HTMLInputElement).value
    });
  }

  function updateItemField(
    sectionId: string,
    itemId: string,
    field: 'time' | 'label',
    e: Event
  ) {
    const section = $posterStore.footerSections.find((s) => s.id === sectionId);
    if (!section) return;
    const value = (e.target as HTMLInputElement).value;
    posterStore.updateFooterSection(sectionId, {
      items: section.items.map((it) => (it.id === itemId ? { ...it, [field]: value } : it))
    });
  }

  function handleDragStart(id: string) {
    draggedId = id;
  }
  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const ids = sortedSections.map((s) => s.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, draggedId);
    posterStore.reorderFooterSections(ids);
    draggedId = null;
  }
</script>

<div class="panel">
  <h2 class="panel-title">New footer section</h2>

  <label class="field">
    <span>Title</span>
    <input type="text" placeholder="Thursday Evening Bhajan" bind:value={newTitle} />
  </label>

  <label class="field">
    <span>Position</span>
    <select bind:value={newPosition}>
      <option value="left">Left column</option>
      <option value="right">Right column</option>
    </select>
  </label>

  <label class="field">
    <span>Dates (comma separated)</span>
    <input type="text" placeholder="02.07.26, 09.07.26, 16.07.26" bind:value={newDates} />
  </label>

  <span class="field-label">Timed items</span>
  {#each newItems as item, i (item.id)}
    <div class="field-row item-row">
      <input type="text" placeholder="06:00 PM" bind:value={item.time} />
      <input type="text" placeholder="Vedam" bind:value={item.label} />
      {#if newItems.length > 1}
        <button type="button" class="icon-btn danger" on:click={() => removeItemRow(item.id)}
          >✕</button
        >
      {/if}
    </div>
  {/each}
  <button type="button" class="btn-text" on:click={addItemRow}>+ Add timed item</button>

  <button type="button" class="btn-primary full mt-sm" on:click={addSection}
    >+ Add footer section</button
  >

  <h2 class="panel-title mt">Footer sections ({sortedSections.length})</h2>
  <ul class="section-list">
    {#each sortedSections as section (section.id)}
      <li
        class="section-item"
        class:hidden-section={!section.visible}
        draggable="true"
        on:dragstart={() => handleDragStart(section.id)}
        on:dragover|preventDefault
        on:drop={() => handleDrop(section.id)}
      >
        <div class="section-header">
          <span class="drag-handle" aria-hidden="true">⠿</span>
          <input
            type="text"
            class="section-title-input"
            value={section.title}
            on:input={(e) => updateSectionTitle(section.id, e)}
          />
          <span class="pos-badge">{section.position}</span>
        </div>

        <div class="section-body">
          {#each section.items as item (item.id)}
            <div class="field-row item-row">
              <input
                type="text"
                value={item.time}
                on:input={(e) => updateItemField(section.id, item.id, 'time', e)}
              />
              <input
                type="text"
                value={item.label}
                on:input={(e) => updateItemField(section.id, item.id, 'label', e)}
              />
              <button
                type="button"
                class="icon-btn danger"
                on:click={() => removeItemFromSection(section.id, item.id)}>✕</button
              >
            </div>
          {/each}
          <button type="button" class="btn-text" on:click={() => addItemToSection(section.id)}
            >+ Add item</button
          >
        </div>

        <div class="section-actions">
          <button
            type="button"
            class="btn-secondary sm"
            on:click={() => posterStore.toggleFooterVisibility(section.id)}
          >
            {section.visible ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            class="icon-btn danger"
            on:click={() => posterStore.removeFooterSection(section.id)}>✕ Delete</button
          >
        </div>
      </li>
    {/each}
    {#if sortedSections.length === 0}
      <li class="empty">No footer sections yet.</li>
    {/if}
  </ul>
</div>
