<script lang="ts">
  import { posterStore } from '$lib/stores/posterStore';
  import { monthIndexToName } from '$lib/utils/dateUtils';
  import ImageUpload from '../ImageUpload.svelte';
  import type { LogoPosition } from '$lib/types';

  const months = Array.from({ length: 12 }, (_, i) => monthIndexToName(i));

  function onOrgInput(e: Event) {
    posterStore.setOrganization((e.target as HTMLInputElement).value);
  }
  function onMonthChange(e: Event) {
    posterStore.setMonthYear((e.target as HTMLSelectElement).value, $posterStore.year);
  }
  function onYearInput(e: Event) {
    const year = Number((e.target as HTMLInputElement).value) || $posterStore.year;
    posterStore.setMonthYear($posterStore.month, year);
  }
  function onLogoUpload(dataUrl: string) {
    posterStore.setLogo({ ...$posterStore.logo, dataUrl });
  }
  function onLogoClear() {
    posterStore.setLogo({ ...$posterStore.logo, dataUrl: null });
  }
  function onPositionChange(e: Event) {
    posterStore.setLogo({
      ...$posterStore.logo,
      position: (e.target as HTMLSelectElement).value as LogoPosition
    });
  }
  function onTableTitleInput(e: Event) {
    posterStore.setTableTitle((e.target as HTMLInputElement).value);
  }
  function onLogoSizeInput(e: Event) {
    posterStore.setLogo({
      ...$posterStore.logo,
      size: Number((e.target as HTMLInputElement).value)
    });
  }
  function onLogoOpacityInput(e: Event) {
    posterStore.setLogo({
      ...$posterStore.logo,
      opacity: Number((e.target as HTMLInputElement).value)
    });
  }
  function onFontScaleInput(e: Event) {
    posterStore.setFontScale(Number((e.target as HTMLInputElement).value));
  }
</script>

<div class="panel">
  <h2 class="panel-title">Organization details</h2>

  <label class="field">
    <span>Organization name</span>
    <input type="text" value={$posterStore.organization} on:input={onOrgInput} />
  </label>

  <div class="field-row">
    <label class="field">
      <span>Month</span>
      <select value={$posterStore.month} on:change={onMonthChange}>
        {#each months as m}
          <option value={m}>{m}</option>
        {/each}
      </select>
    </label>
    <label class="field">
      <span>Year</span>
      <input type="number" value={$posterStore.year} on:input={onYearInput} />
    </label>
  </div>

  <label class="field">
    <span>Table heading</span>
    <input
      type="text"
      value={$posterStore.tableTitle}
      on:input={onTableTitleInput}
    />
  </label>

  <h2 class="panel-title mt">Logo / watermark</h2>
  <ImageUpload
    currentDataUrl={$posterStore.logo.dataUrl}
    label="Upload logo"
    on:upload={(e) => onLogoUpload(e.detail)}
    on:clear={onLogoClear}
  />

  {#if $posterStore.logo.dataUrl}
    <label class="field mt-sm">
      <span>Logo position</span>
      <select value={$posterStore.logo.position} on:change={onPositionChange}>
        <option value="top-left">Top left</option>
        <option value="top-right">Top right</option>
        <option value="center-watermark">Center watermark</option>
      </select>
    </label>

    <label class="field mt-sm">
      <span>Size ({$posterStore.logo.size}px)</span>
      <input
        type="range"
        min="32"
        max="140"
        value={$posterStore.logo.size}
        on:input={onLogoSizeInput}
      />
    </label>

    {#if $posterStore.logo.position === 'center-watermark'}
      <label class="field mt-sm">
        <span>Watermark opacity ({Math.round($posterStore.logo.opacity * 100)}%)</span>
        <input
          type="range"
          min="0.05"
          max="0.6"
          step="0.05"
          value={$posterStore.logo.opacity}
          on:input={onLogoOpacityInput}
        />
      </label>
    {/if}
  {/if}

  <h2 class="panel-title mt">Font size</h2>
  <label class="field">
    <span>Scale ({Math.round($posterStore.fontScale * 100)}%)</span>
    <input
      type="range"
      min="0.75"
      max="1.5"
      step="0.05"
      value={$posterStore.fontScale}
      on:input={onFontScaleInput}
    />
  </label>
</div>
