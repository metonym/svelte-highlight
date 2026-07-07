<script context="module">
  const isBrowser = typeof document !== "undefined";

  /** @type {Map<string, number>} */
  const refCounts = new Map();

  /** @param {string} key */
  function acquire(key) {
    if (!isBrowser) return true;
    const count = refCounts.get(key) ?? 0;
    refCounts.set(key, count + 1);
    return count === 0;
  }

  /** @param {string | undefined} key */
  function release(key) {
    if (!isBrowser || key === undefined) return;
    const count = refCounts.get(key) ?? 0;
    if (count <= 1) {
      refCounts.delete(key);
    } else {
      refCounts.set(key, count - 1);
    }
  }
</script>

<script>
  import { onMount } from "svelte";
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
  export let scopeClass = undefined;

  // Captured once: a consumer-supplied scopeClass is honored for the
  // lifetime of the instance instead of being overwritten by the hash below.
  const hasOwnScopeClass = scopeClass !== undefined;

  $: hasTheme =
    theme !== undefined || (light !== undefined && dark !== undefined);

  $: if (!hasOwnScopeClass) {
    scopeClass = scopeClassFor(theme ?? `${light}${dark}`);
  }

  $: style = hasTheme
    ? light !== undefined && dark !== undefined
      ? dualStyle(light, dark, scopeClass, mode)
      : scopeStyle(theme, scopeClass)
    : "";

  let registeredKey;
  let shouldRender = false;

  $: {
    const key = style ? `${scopeClass}::${style}` : undefined;
    if (key !== registeredKey) {
      release(registeredKey);
      registeredKey = key;
      shouldRender = key !== undefined && acquire(key);
    }
  }

  onMount(() => () => release(registeredKey));
</script>

<svelte:head
  >{#if shouldRender}
    {@html style}
  {/if}</svelte:head
>

<div class={scopeClass} {...$$restProps}>
  <slot {scopeClass} />
</div>
