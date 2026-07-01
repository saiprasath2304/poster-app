<script lang="ts">
  import { posterStore } from '$lib/stores/posterStore';
  import { generateId } from '$lib/utils/id';
  import type { RecurrenceItem } from '$lib/types';

  const WEEKDAYS = [
    { value: 0, label: 'Every Sunday' },
    { value: 1, label: 'Every Monday' },
    { value: 2, label: 'Every Tuesday' },
    { value: 3, label: 'Every Wednesday' },
    { value: 4, label: 'Every Thursday' },
    { value: 5, label: 'Every Friday' },
    { value: 6, label: 'Every Saturday' }
  ];

  let dayOfWeek = 4; // Thursday, matching the reference poster
  let title = '';
  let highlight = false;
  let items: RecurrenceItem[] = [{ id: generateId(), time: '', label: '' }];

  function addItemRow() {
    items = [...items, { id: generateId(), time: '', label: '' }];
  }

  function removeItemRow(id: string) {
    items = items.filter((i) => i.id !== id);
  }

  function addRule() {
    const cleanItems = items.filter((i) => i.time.trim() || i.label.trim());
    if (!title.trim() || cleanItems.length === 0) return;
    posterStore.addRecurrenceRule({
      type: 'weekly',
      dayOfWeek,
      title: title.trim(),
      items: cleanItems,
      highlight
    });
    title = '';
    highlight = false;
    items = [{ id: generateId(), time: '', label: '' }];
  }
</script>

<div class="panel">
  <h2 class="panel-title">New recurring schedule</h2>

  <label class="field">
    <span>Recurs on</span>
    <select bind:value={dayOfWeek}>
      {#each WEEKDAYS as wd}
        <option value={wd.value}>{wd.label}</option>
      {/each}
    </select>
  </label>

  <label class="field">
    <span>Title</span>
    <input type="text" placeholder="Evening Bhajan" bind:value={title} />
  </label>

  <span class="field-label">Timed items</span>
  {#each items as item, i (item.id)}
    <div class="field-row item-row">
      <input type="text" placeholder="06:00 PM" bind:value={item.time} />
      <input type="text" placeholder="Vedam" bind:value={item.label} />
      {#if items.length > 1}
        <button type="button" class="icon-btn danger" on:click={() => removeItemRow(item.id)}
          >✕</button
        >
      {/if}
    </div>
  {/each}
  <button type="button" class="btn-text" on:click={addItemRow}>+ Add timed item</button>

  <label class="checkbox-field mt-sm">
    <input type="checkbox" bind:checked={highlight} />
    <span>Highlight generated events</span>
  </label>

  <button type="button" class="btn-primary full mt-sm" on:click={addRule}
    >+ Save recurring rule</button
  >

  <h2 class="panel-title mt">
    Active rules ({$posterStore.recurrenceRules.length})
  </h2>
  <ul class="rule-list">
    {#each $posterStore.recurrenceRules as rule (rule.id)}
      <li class="rule-item">
        <div>
          <strong>{WEEKDAYS.find((w) => w.value === rule.dayOfWeek)?.label}</strong>
          <div class="rule-title">{rule.title}</div>
          <div class="rule-items">
            {#each rule.items as it}<span>{it.time} {it.label}</span>{/each}
          </div>
        </div>
        <button
          type="button"
          class="icon-btn danger"
          on:click={() => posterStore.removeRecurrenceRule(rule.id)}>✕</button
        >
      </li>
    {/each}
    {#if $posterStore.recurrenceRules.length === 0}
      <li class="empty">No recurring rules yet.</li>
    {/if}
  </ul>

  <button
    type="button"
    class="btn-primary full mt"
    disabled={$posterStore.recurrenceRules.length === 0}
    on:click={() => posterStore.generateFromRecurrenceRules()}
  >
    ⚡ Auto-generate {$posterStore.month} {$posterStore.year}
  </button>
  <p class="hint-block">
    Fills in every matching date for {$posterStore.month} {$posterStore.year} from your recurring rules,
    keeping any manually-added events.
  </p>
</div>
