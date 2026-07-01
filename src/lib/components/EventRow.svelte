<script lang="ts">
  import type { ScheduleEvent } from '$lib/types';
  import { posterStore } from '$lib/stores/posterStore';
  import EditableText from './EditableText.svelte';

  export let event: ScheduleEvent;
  export let rowIndex: number;

  function change(patch: Partial<ScheduleEvent>) {
    posterStore.updateEvent(event.id, patch);
  }
</script>

<tr class="event-row" class:row-b={rowIndex % 2 === 1}>
  <td class="date-cell">
    <EditableText
      className="date-text"
      value={event.date}
      placeholder="Date"
      on:change={(e) => change({ date: e.detail })}
    />
    <span class="sep">, </span>
    <EditableText
      className="day-text"
      value={event.day}
      placeholder="Day"
      on:change={(e) => change({ day: e.detail })}
    />
  </td>
  <td class="desc-cell" class:highlight={event.highlight}>
    <EditableText
      tag="div"
      className="event-title"
      value={event.title}
      placeholder="Event title"
      on:change={(e) => change({ title: e.detail })}
    />
    {#if event.description !== undefined}
      <EditableText
        tag="div"
        className="event-desc"
        multiline
        value={event.description ?? ''}
        placeholder="Description / timing"
        on:change={(e) => change({ description: e.detail })}
      />
    {/if}
  </td>
</tr>

<style>
  .event-row {
    border-bottom: 1px solid var(--border);
  }
  .row-b {
    background: var(--row-b);
  }
  .date-cell {
    width: 190px;
    text-align: center;
    padding: 10px 12px;
    font-weight: 700;
    vertical-align: top;
    white-space: nowrap;
  }
  .sep {
    color: var(--body-text);
  }
  :global(.date-text),
  :global(.day-text) {
    display: inline;
    font-size: calc(15px * var(--font-scale));
    color: var(--body-text);
  }
  .desc-cell {
    padding: 10px 20px;
    vertical-align: top;
  }
  .desc-cell.highlight :global(.event-title),
  .desc-cell.highlight :global(.event-desc) {
    color: var(--highlight);
    font-weight: 700;
  }
  :global(.event-title) {
    font-size: calc(15px * var(--font-scale));
    font-weight: 600;
    color: var(--body-text);
    white-space: pre-line;
  }
  :global(.event-desc) {
    font-size: calc(15px * var(--font-scale));
    color: var(--body-text);
    margin-top: 2px;
    white-space: pre-line;
  }
</style>
