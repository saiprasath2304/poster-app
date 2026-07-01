<script lang="ts">
  import { posterStore } from '$lib/stores/posterStore';
  import { toIsoDate } from '$lib/utils/dateUtils';
  import type { ScheduleEvent } from '$lib/types';

  let draggedId: string | null = null;

  let form = {
    date: '',
    day: '',
    title: '',
    description: '',
    highlight: false
  };

  $: sortedEvents = [...$posterStore.events].sort((a, b) => a.order - b.order);

  function resetForm() {
    form = { date: '', day: '', title: '', description: '', highlight: false };
  }

  function addEvent() {
    if (!form.date.trim() || !form.title.trim()) return;
    posterStore.addEvent({
      date: form.date.trim(),
      day: form.day.trim() || '—',
      isoDate: toIsoDate(new Date()),
      title: form.title.trim(),
      description: form.description.trim(),
      highlight: form.highlight,
      color: undefined
    });
    resetForm();
  }

  function handleDragStart(id: string) {
    draggedId = id;
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const ids = sortedEvents.map((e) => e.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, draggedId);
    posterStore.reorderEvents(ids);
    draggedId = null;
  }
</script>

<div class="panel">
  <h2 class="panel-title">Add an event</h2>

  <div class="field-row">
    <label class="field">
      <span>Date label</span>
      <input type="text" placeholder="04 Jul" bind:value={form.date} />
    </label>
    <label class="field">
      <span>Day</span>
      <input type="text" placeholder="Saturday" bind:value={form.day} />
    </label>
  </div>

  <label class="field">
    <span>Title</span>
    <input type="text" placeholder="Vedham Chanting" bind:value={form.title} />
  </label>

  <label class="field">
    <span>Description / timing</span>
    <textarea rows="2" placeholder="06:30 PM" bind:value={form.description}></textarea>
  </label>

  <label class="checkbox-field">
    <input type="checkbox" bind:checked={form.highlight} />
    <span>Highlight this event (special occasion)</span>
  </label>

  <button type="button" class="btn-primary full" on:click={addEvent}>+ Add event</button>

  <h2 class="panel-title mt">
    Events ({sortedEvents.length})
    <span class="hint">drag to reorder</span>
  </h2>

  <ul class="event-list">
    {#each sortedEvents as event (event.id)}
      <li
        class="event-item"
        draggable="true"
        on:dragstart={() => handleDragStart(event.id)}
        on:dragover|preventDefault
        on:drop={() => handleDrop(event.id)}
      >
        <span class="drag-handle" aria-hidden="true">⠿</span>
        <div class="event-info">
          <div class="event-line1">
            <strong>{event.date}, {event.day}</strong>
            {#if event.highlight}<span class="badge">highlight</span>{/if}
          </div>
          <div class="event-line2">{event.title}</div>
        </div>
        <div class="event-actions">
          <button
            type="button"
            title="Toggle highlight"
            class="icon-btn"
            on:click={() => posterStore.updateEvent(event.id, { highlight: !event.highlight })}
          >
            ★
          </button>
          <button
            type="button"
            title="Duplicate"
            class="icon-btn"
            on:click={() => posterStore.duplicateEvent(event.id)}
          >
            ⧉
          </button>
          <button
            type="button"
            title="Delete"
            class="icon-btn danger"
            on:click={() => posterStore.removeEvent(event.id)}
          >
            ✕
          </button>
        </div>
      </li>
    {/each}
    {#if sortedEvents.length === 0}
      <li class="empty">No events yet. Add one above, or use Recurring Events / Auto-generate.</li>
    {/if}
  </ul>
</div>
