<script lang="ts">
  import type { FooterSection } from '$lib/types';
  import { posterStore } from '$lib/stores/posterStore';
  import EditableText from './EditableText.svelte';

  export let section: FooterSection;

  function updateItem(itemId: string, label: string, time: string) {
    posterStore.updateFooterSection(section.id, {
      items: section.items.map((it) => (it.id === itemId ? { ...it, label, time } : it))
    });
  }

  function updateDate(index: number, value: string) {
    const dates = [...section.dates];
    dates[index] = value;
    posterStore.updateFooterSection(section.id, { dates });
  }
</script>

<div class="footer-section">
  <EditableText
    tag="h3"
    className="footer-title"
    value={section.title}
    placeholder="Section title"
    on:change={(e) => posterStore.updateFooterSection(section.id, { title: e.detail })}
  />

  {#if section.dates.length > 0}
    <p class="footer-dates">
      {#each section.dates as date, i (i)}
        <EditableText
          className="footer-date"
          value={date}
          on:change={(e) => updateDate(i, e.detail)}
        />{#if i < section.dates.length - 1}<span>, </span>{/if}
      {/each}
    </p>
  {/if}

  <ul class="footer-items">
    {#each section.items as item (item.id)}
      <li>
        <EditableText
          className="footer-time"
          value={item.time}
          on:change={(e) => updateItem(item.id, item.label, e.detail)}
        />
        <span class="dash"> – </span>
        <EditableText
          className="footer-label"
          value={item.label}
          on:change={(e) => updateItem(item.id, e.detail, item.time)}
        />
      </li>
    {/each}
  </ul>
</div>

<style>
  .footer-section {
    margin-bottom: 12px;
  }
  :global(.footer-title) {
    font-weight: 700;
    color: var(--footer-title);
    font-size: calc(14px * var(--font-scale));
    display: block;
    margin-bottom: 3px;
  }
  .footer-dates {
    font-size: calc(12px * var(--font-scale));
    color: var(--body-text);
    margin: 0 0 4px;
  }
  :global(.footer-date) {
    display: inline;
  }
  .footer-items {
    margin: 0;
    padding-left: 16px;
  }
  .footer-items li {
    font-size: calc(12.5px * var(--font-scale));
    color: var(--body-text);
    list-style: disc;
    margin-bottom: 1px;
  }
  :global(.footer-time),
  :global(.footer-label) {
    display: inline;
  }
  .dash {
    color: var(--body-text);
  }
</style>
