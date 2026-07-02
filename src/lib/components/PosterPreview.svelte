<script lang="ts">
  import { posterStore } from '$lib/stores/posterStore';
  import { getTheme } from '$lib/themes/themes';
  import { zoom, isExporting } from '$lib/stores/uiStore';
  import PosterHeader from './PosterHeader.svelte';
  import EventRow from './EventRow.svelte';
  import FooterSectionView from './FooterSectionView.svelte';
  import EditableText from './EditableText.svelte';

  // Exposed so the toolbar's export buttons can grab the raw DOM node.
  export let previewEl: HTMLDivElement | undefined = undefined;

  const POSTER_WIDTH = 1200;
  const POSTER_HEIGHT = 849; // A4 landscape ratio (297:210)

  let containerWidth = 0;
  let naturalHeight = POSTER_HEIGHT; // measured after render; grows if content overflows A4

  $: fitScale = containerWidth > 0 ? Math.min(1, (containerWidth - 48) / POSTER_WIDTH) : 1;
  $: scale = $isExporting ? 1 : fitScale * $zoom;

  $: theme = getTheme($posterStore.themeId);
  $: sortedEvents = [...$posterStore.events].sort((a, b) => a.order - b.order);
  $: leftFooters = $posterStore.footerSections
    .filter((f) => f.position === 'left' && f.visible)
    .sort((a, b) => a.order - b.order);
  $: rightFooters = $posterStore.footerSections
    .filter((f) => f.position === 'right' && f.visible)
    .sort((a, b) => a.order - b.order);
  $: hasFooters = leftFooters.length > 0 || rightFooters.length > 0;
</script>

<div class="preview-viewport" bind:clientWidth={containerWidth}>
  <div class="scale-box" style="width:{POSTER_WIDTH * scale}px; height:{naturalHeight * scale}px;">
    <div
      bind:this={previewEl}
      bind:clientHeight={naturalHeight}
      class="poster"
      style="
        width:{POSTER_WIDTH}px;
        min-height:{POSTER_HEIGHT}px;
        transform: scale({scale});
        --bg-from:{theme.bgGradientFrom};
        --bg-to:{theme.bgGradientTo};
        --header-text:{theme.headerTextColor};
        --header-shadow:{theme.headerTextShadow};
        --table-header-bg:{theme.tableHeaderBg};
        --table-header-text:{theme.tableHeaderText};
        --row-a:{theme.rowBgA};
        --row-b:{theme.rowBgB};
        --body-text:{theme.bodyTextColor};
        --highlight:{theme.highlightColor};
        --footer-bg:{theme.footerBg};
        --footer-title:{theme.footerTitleColor};
        --border:{theme.borderColor};
        --font-scale:{$posterStore.fontScale};
      "
    >
      <PosterHeader />

      <div class="poster-table-wrap">
        <table class="poster-table">
          <thead>
            <tr>
              <th class="date-col">
                <EditableText
                  className="th-text"
                  value={$posterStore.dateColumnLabel}
                  on:change={(e) => posterStore.setDateColumnLabel(e.detail)}
                />
              </th>
              <th>
                <EditableText
                  className="th-text"
                  value={$posterStore.tableTitle}
                  on:change={(e) => posterStore.setTableTitle(e.detail)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {#each sortedEvents as event, i (event.id)}
              <EventRow {event} rowIndex={i} />
            {/each}
            {#if sortedEvents.length === 0}
              <tr>
                <td colspan="2" class="empty-row">
                  No events yet — add one from the sidebar, or generate a month automatically.
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>

      {#if hasFooters}
        <div class="poster-footer">
          <div class="footer-col">
            {#each leftFooters as section (section.id)}
              <FooterSectionView {section} />
            {/each}
          </div>
          <div class="footer-divider"></div>
          <div class="footer-col">
            {#each rightFooters as section (section.id)}
              <FooterSectionView {section} />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .preview-viewport {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    background: repeating-conic-gradient(#e2e8f0 0% 25%, #eef2f7 0% 50%) 0 0 / 24px 24px;
  }

  .scale-box {
    flex-shrink: 0;
  }

  .poster {
    position: relative;
    transform-origin: top left;
    background: linear-gradient(160deg, var(--bg-from), var(--bg-to));
    border-radius: 16px;
    padding: 24px 28px 24px;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-family: 'Inter', sans-serif;
  }

  .poster-table-wrap {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    flex: 1 1 auto;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
  }

  .poster-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .poster-table thead th {
    background: var(--table-header-bg);
    color: var(--table-header-text);
    padding: 12px 16px;
    text-align: center;
    font-size: calc(19px * var(--font-scale));
    font-weight: 700;
  }

  .poster-table thead .date-col {
    width: 190px;
  }

  :global(.th-text) {
    display: inline-block;
  }

  .poster-table tbody {
    background: var(--row-a);
  }

  .empty-row {
    text-align: center;
    padding: 28px 12px;
    color: #94a3b8;
    font-style: italic;
    font-size: 14px;
  }

  .poster-footer {
    margin-top: 14px;
    background: var(--footer-bg);
    border: 2px solid rgba(0, 0, 0, 0.55);
    border-radius: 6px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    padding: 12px 18px;
  }

  .footer-col {
    min-width: 0;
  }

  .footer-divider {
    width: 2px;
    background: rgba(0, 0, 0, 0.4);
    margin: 0 18px;
  }
</style>
