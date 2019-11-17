<script>
  import { onMount } from 'svelte';
  export let currentStyle;
  export let updateStyle = () => false;

  let styles = {};
  let style;

  onMount(async () => {
    styles = await import('../styles');
  });

  $: supportedStyles = Object.keys(styles);
  $: {
    if (styles) {
      style = styles[currentStyle];
    }
  }
</script>

<style>
  button {
    outline: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    letter-spacing: inherit;
    cursor: pointer;
    width: 100%;
    height: 100%;
    padding: 0.5rem 1rem;
    text-align: left;
  }

  button:focus {
    color: #0f62fe;
  }

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
    list-style: none;
    display: flex;
    align-items: flex-start;
    border-left: 0.25rem solid transparent;
  }

  li:hover {
    background-color: #f4f4f4;
  }

  li.active {
    color: #0f62fe;
    background-color: #f4f4f4;
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
          updateStyle(style);
        }}>
        {style}
      </button>
    </li>
  {/each}
</ul>
