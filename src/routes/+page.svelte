<script lang="ts">
  import { posterStore } from '$lib/stores/posterStore';
  import { activeTab } from '$lib/stores/uiStore';
  import type { SidebarTab } from '$lib/stores/uiStore';

  import PosterPreview from '$lib/components/PosterPreview.svelte';
  import OrgForm from '$lib/components/Sidebar/OrgForm.svelte';
  import EventList from '$lib/components/Sidebar/EventList.svelte';
  import RecurringEventForm from '$lib/components/Sidebar/RecurringEventForm.svelte';
  import FooterEditor from '$lib/components/Sidebar/FooterEditor.svelte';
  import ThemeSelector from '$lib/components/Sidebar/ThemeSelector.svelte';
  import TemplateManager from '$lib/components/Sidebar/TemplateManager.svelte';
  import ExportPanel from '$lib/components/Sidebar/ExportPanel.svelte';
  import ZoomControl from '$lib/components/Toolbar/ZoomControl.svelte';
  import UndoRedo from '$lib/components/Toolbar/UndoRedo.svelte';

  let previewEl: HTMLDivElement | undefined;

  const tabs: { id: SidebarTab; label: string }[] = [
    { id: 'org', label: 'Organization' },
    { id: 'events', label: 'Events' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'footer', label: 'Footer' },
    { id: 'theme', label: 'Theme' },
    { id: 'templates', label: 'Templates' },
    { id: 'export', label: 'Export' }
  ];

  function handleKeydown(e: KeyboardEvent) {
    const isMod = e.ctrlKey || e.metaKey;
    if (!isMod) return;
    if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      posterStore.undo();
    } else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
      e.preventDefault();
      posterStore.redo();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <title>{$posterStore.organization} — Monthly Schedule Poster</title>
</svelte:head>

<div class="app-shell">
  <header class="app-toolbar">
    <div class="brand">
      <span class="brand-mark">🗓️</span>
      <span class="brand-name">Schedule Poster Studio</span>
    </div>
    <div class="toolbar-actions">
      <UndoRedo />
      <div class="divider"></div>
      <ZoomControl />
    </div>
  </header>

  <div class="app-body">
    <aside class="sidebar">
      <nav class="tab-bar">
        {#each tabs as tab (tab.id)}
          <button
            type="button"
            class="tab-btn"
            class:active={$activeTab === tab.id}
            on:click={() => activeTab.set(tab.id)}
          >
            {tab.label}
          </button>
        {/each}
      </nav>

      <div class="tab-content">
        {#if $activeTab === 'org'}
          <OrgForm />
        {:else if $activeTab === 'events'}
          <EventList />
        {:else if $activeTab === 'recurring'}
          <RecurringEventForm />
        {:else if $activeTab === 'footer'}
          <FooterEditor />
        {:else if $activeTab === 'theme'}
          <ThemeSelector />
        {:else if $activeTab === 'templates'}
          <TemplateManager />
        {:else if $activeTab === 'export'}
          <ExportPanel {previewEl} />
        {/if}
      </div>
    </aside>

    <main class="preview-area">
      <PosterPreview bind:previewEl />
    </main>
  </div>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f1f5f9;
  }

  .app-toolbar {
    height: 56px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: #1e293b;
  }

  .brand-mark {
    font-size: 20px;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .divider {
    width: 1px;
    height: 22px;
    background: #e2e8f0;
  }

  .app-body {
    flex: 1 1 auto;
    display: flex;
    min-height: 0;
    flex-direction: column;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    background: white;
    border-right: 1px solid #e2e8f0;
    min-height: 0;
  }

  .tab-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 10px 12px;
    border-bottom: 1px solid #e2e8f0;
    flex: 0 0 auto;
  }

  .tab-btn {
    border: none;
    background: #f1f5f9;
    color: #475569;
    padding: 6px 10px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .tab-btn.active {
    background: #1d4ed8;
    color: white;
  }

  .tab-content {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 16px;
  }

  .preview-area {
    flex: 1 1 auto;
    min-height: 0;
  }

  /* Desktop: 40% sidebar / 60% preview, side by side */
  @media (min-width: 1024px) {
    .app-body {
      flex-direction: row;
    }
    .sidebar {
      width: 40%;
      max-width: 560px;
    }
    .preview-area {
      width: 60%;
      flex: 1 1 auto;
    }
  }

  /* Mobile / tablet: stacked layout */
  @media (max-width: 1023px) {
    .sidebar {
      max-height: 55vh;
    }
    .preview-area {
      min-height: 45vh;
    }
  }
</style>
