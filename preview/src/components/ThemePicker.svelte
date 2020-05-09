<script>
  export let currentStyle = "anOldHope";

  import * as styles from "svelte-highlight/styles";

  $: supportedStyles = Object.keys(styles);
  $: style = styles[currentStyle] || "";
</script>

<style>
  ul {
    position: fixed;
    top: 0;
    left: 0;
    width: 16rem;
    height: 100vh;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 1rem 0;
  }

  @media (max-width: 720px) {
    ul {
      width: 14.5rem;
    }
  }

  li {
    display: flex;
    align-items: flex-start;
    border-left: 0.25rem solid transparent;
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
          currentStyle = style;
        }}>
        {style}
      </button>
    </li>
  {/each}
</ul>
