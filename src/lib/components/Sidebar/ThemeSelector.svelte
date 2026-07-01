<script lang="ts">
  import { posterStore } from '$lib/stores/posterStore';
  import { themes } from '$lib/themes/themes';
</script>

<div class="panel">
  <h2 class="panel-title">Poster theme</h2>
  <div class="theme-grid">
    {#each themes as theme (theme.id)}
      <button
        type="button"
        class="theme-card"
        class:active={$posterStore.themeId === theme.id}
        on:click={() => posterStore.setTheme(theme.id)}
      >
        <span
          class="theme-swatch"
          style="background: linear-gradient(160deg, {theme.bgGradientFrom}, {theme.bgGradientTo});"
        >
          <span class="swatch-header" style="background:{theme.tableHeaderBg};"></span>
        </span>
        <span class="theme-name">{theme.name}</span>
      </button>
    {/each}
  </div>
</div>
