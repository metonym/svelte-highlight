<script>
  import { scopeClassFor, scopeStyle } from "./scoped.js";

  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`.
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   * @type {string}
   */
  export let theme;

  /**
   * Wrapper class the scoped selectors target.
   * @type {string}
   */
  export let scopeClass = scopeClassFor(theme);

  $: style = scopeStyle(theme, scopeClass);
</script>

<svelte:head> {@html style} </svelte:head>

<div class={scopeClass} {...$$restProps}>
  <slot {scopeClass} />
</div>
