<script context="module">
  import { createStyleRegistry } from "./style-registry.js";

  const isBrowser = typeof document !== "undefined";

  // Identical styles across instances render one `<style>` tag.
  const styleRegistry = createStyleRegistry();
</script>

<script>
  import { onDestroy } from "svelte";
  import { dualStyle, scopeClassFor, scopeStyle } from "./scoped.js";
  import {
    dualPaletteSupportsStyle,
    lightFallbackStyle,
    paletteStyle,
  } from "./theme-style.js";

  /**
   * Theme CSS (`svelte-highlight/styles/<theme>`) or a `ThemePalette`
   * (`svelte-highlight/themes/<theme>`, applied as inline vars).
   * @type {string | import("./theme.d.ts").ThemePalette}
   */
  export let theme = undefined;

  /**
   * Light theme; with `dark`, overrides `theme`. Same type as `dark`.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let light = undefined;

  /**
   * Dark theme; pair with `light`.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let dark = undefined;

  /**
   * `"auto"` | `"light"` | `"dark"` | a CSS selector that gates dark.
   * @type {"auto" | "light" | "dark" | string}
   */
  export let mode = "auto";

  /** Wrapper class the scoped selectors target. */
  export let scopeClass = undefined;

  /**
   * CSP nonce for the injected `<style>` tag.
   * @type {string | undefined}
   */
  export let nonce = undefined;

  // Captured once so a consumer-supplied class is never overwritten.
  const hasOwnScopeClass = scopeClass !== undefined && scopeClass !== "";

  $: usingPair = light !== undefined && dark !== undefined;
  $: usingObjectPair =
    usingPair && typeof light === "object" && typeof dark === "object";
  $: usingObjectTheme =
    !usingPair && theme !== undefined && typeof theme === "object";

  $: hasTheme = theme !== undefined || usingPair;

  $: if (!hasOwnScopeClass) {
    scopeClass = usingObjectPair
      ? scopeClassFor(`${light.name}::${dark.name}`)
      : usingObjectTheme
        ? scopeClassFor(theme.name)
        : scopeClassFor(theme ?? `${light}${dark}`);
  }

  // <svelte:head> content; empty for a single ThemePalette (inline vars only).
  $: style = hasTheme
    ? usingObjectPair
      ? dualPaletteSupportsStyle(scopeClass, light, dark, mode, nonce)
      : usingObjectTheme
        ? ""
        : usingPair
          ? dualStyle(light, dark, scopeClass, mode, nonce)
          : scopeStyle(theme, scopeClass, nonce)
    : "";

  // For an object pair: light-only baseline, upgraded by `style` where
  // light-dark() is supported.
  $: inlineStyle = usingObjectPair
    ? lightFallbackStyle(light, dark)
    : usingObjectTheme
      ? paletteStyle(theme)
      : undefined;

  const token = Symbol();
  let registeredKey;
  /** @type {import("svelte/store").Writable<symbol[]> | undefined} */
  let registry;

  function unregister() {
    if (registry) styleRegistry.unregister(registeredKey, registry, token);
  }

  $: {
    const key = style ? `${scopeClass}::${style}` : undefined;
    if (key !== registeredKey) {
      unregister();
      registeredKey = key;
      registry =
        isBrowser && key !== undefined
          ? styleRegistry.register(key, token)
          : undefined;
    }
  }

  $: owners = $registry ?? [];
  $: shouldRender = !isBrowser || owners[0] === token;

  onDestroy(unregister);
</script>

<svelte:head
  >{#if shouldRender}
    {@html style}
  {/if}</svelte:head
>

<div class={scopeClass} style={inlineStyle} {...$$restProps}>
  <slot {scopeClass} />
</div>
