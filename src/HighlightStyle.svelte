<script>
  import { dualStyle, scopeClassFor, scopeStyle } from "./scoped.js";

  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`.
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   * @type {string}
   */
  export let theme = undefined;

  /**
   * Light theme CSS. With `dark`, overrides `theme`.
   * @type {string | undefined}
   */
  export let light = undefined;

  /** Dark theme CSS; pair with `light`. */
  export let dark = undefined;

  /**
   * Theme switch: `"auto"` | `"light"` | `"dark"` | CSS selector for dark.
   * @type {"auto" | "light" | "dark" | string}
   */
  export let mode = "auto";

  /** Scope class for prefixed selectors. */
  export let scopeClass = scopeClassFor(theme ?? `${light}${dark}`);

  $: style =
    light !== undefined && dark !== undefined
      ? dualStyle(light, dark, scopeClass, mode)
      : scopeStyle(theme, scopeClass);
</script>

<svelte:head> {@html style} </svelte:head>

<div class={scopeClass} {...$$restProps}>
  <slot {scopeClass} />
</div>
