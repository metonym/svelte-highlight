<script>
  export let currentStyle = undefined;

  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let styles = {};

  onMount(async () => {
    // eslint-disable-next-line
    styles = await import('svelte-highlight/styles');
  });

  $: supportedStyles = Object.keys(styles);
  $: style = styles[currentStyle];
</script>

<style>
  ul {
    position: fixed;
    top: 0;
    left: 0;
    width: 16rem;
    height: 100vh;
    overflow-y: scroll;
    padding: 1rem 0;
  }

  li {
    display: flex;
    align-items: flex-start;
    border-left: 0.25rem solid transparent;
    letter-spacing: 0.03rem;
  }

  li.active {
    border-left-color: #0f62fe;
  }
</style>

<svelte:head>
  {@html style}
</svelte:head>

<ul>
  <slot />
  <h2>Themes</h2>
  {#each supportedStyles as style, i (style)}
    <li class:active={currentStyle === style}>
      <button
        type="button"
        on:click={() => {
          dispatch('style', style);
        }}>
        {style}
      </button>
    </li>
  {/each}
</ul>
