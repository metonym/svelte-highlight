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
   * Light theme CSS; pair with `dark` to emit both stylesheets and switch
   * automatically. Takes precedence over `theme` when both `light` and `dark`
   * are provided.
   * @type {string | undefined}
   */
  export let light = undefined;

  /**
   * Dark theme CSS; pair with `light` to emit both stylesheets.
   * @type {string | undefined}
   */
  export let dark = undefined;

  /**
   * How to switch between `light` and `dark`:
   * `"auto"` uses `prefers-color-scheme` media queries, `"light"`/`"dark"`
   * force a single theme, and any other string is a CSS selector that gates
   * the dark block (e.g. `[data-theme="dark"]`).
   * @type {"auto" | "light" | "dark" | string}
   */
  export let mode = "auto";

  /**
   * Wrapper class the scoped selectors target.
   * @type {string}
   */
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
