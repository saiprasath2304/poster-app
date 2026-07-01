<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value: string;
  export let tag: 'span' | 'div' | 'h1' | 'h2' | 'p' = 'span';
  export let className = '';
  export let placeholder = 'Click to edit';
  export let multiline = false;

  const dispatch = createEventDispatcher<{ change: string }>();

  let editing = false;
  let el: HTMLElement;

  function commit() {
    const text = (el?.innerText ?? '').trim();
    editing = false;
    if (text !== value) {
      dispatch('change', text);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      el.blur();
    }
    if (e.key === 'Escape') {
      if (el) el.innerText = value;
      el.blur();
    }
  }
</script>

<svelte:element
  this={tag}
  bind:this={el}
  class={className}
  contenteditable="true"
  role="textbox"
  tabindex="0"
  aria-label={placeholder}
  on:focus={() => (editing = true)}
  on:blur={commit}
  on:keydown={handleKeydown}
  data-placeholder={placeholder}
>{value}</svelte:element>

<style>
  [contenteditable]:empty::before {
    content: attr(data-placeholder);
    opacity: 0.45;
    font-style: italic;
  }
</style>
