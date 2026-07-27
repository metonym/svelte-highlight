<script context="module">
  import { writable } from "svelte/store";

  const isBrowser = typeof document !== "undefined";

  // Instances sharing a key queue up in registration order; only the oldest
  // still-mounted instance renders the `<style>`. A store (rather than a
  // plain ref count) means that when that instance unmounts, the remaining
  // subscribers reactively re-derive a new owner instead of the tag being
  // dropped while siblings still need it.
  /** @type {Map<string, import("svelte/store").Writable<symbol[]>>} */
  const registries = new Map();

  /** @param {string} key */
  function registryFor(key) {
    let registry = registries.get(key);
    if (!registry) {
      registry = writable([]);
      registries.set(key, registry);
    }
    return registry;
  }
</script>

<script>
  import { onMount } from "svelte";
  import { dualStyle, scopeClassFor, scopeStyle } from "./scoped.js";
  import { dualPaletteStyle, paletteStyle } from "./theme-style.js";

  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`, or a `ThemePalette`
   * from `svelte-highlight/themes/<theme>` — the latter is applied by
   * inlining `--shl-*` vars on the wrapper element instead of injecting a
   * scoped `<style>` tag.
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   * @example
   * import atomOneDark from "svelte-highlight/themes/atom-one-dark";
   * @type {string | import("./theme.d.ts").ThemePalette}
   */
  export let theme = undefined;

  /**
   * Light theme CSS/palette. With `dark`, overrides `theme`. Must be the
   * same type (string or `ThemePalette`) as `dark`.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let light = undefined;

  /**
   * Dark theme CSS/palette; pair with `light`.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let dark = undefined;

  /**
   * Theme switch: `"auto"` | `"light"` | `"dark"` | CSS selector for dark.
   * On the `ThemePalette` path this controls the inlined `color-scheme`
   * (`"auto"` -> `light dark`); any other string is treated as the legacy
   * app-controlled mode, and no `color-scheme` is inlined — set it on your
   * own selector instead (e.g. `[data-theme="dark"] { color-scheme: dark }`).
   * @type {"auto" | "light" | "dark" | string}
   */
  export let mode = "auto";

  /** Scope class for prefixed selectors. Inert on the `ThemePalette` path
   * (kept for back-compat / slot access), since there's no scoped
   * `<style>` tag to match against. */
  export let scopeClass = undefined;

  // Captured once: a consumer-supplied scopeClass is honored for the
  // lifetime of the instance instead of being overwritten by the hash below.
  const hasOwnScopeClass = scopeClass !== undefined;

  $: usingPair = light !== undefined && dark !== undefined;
  $: usingObjectPair =
    usingPair && typeof light === "object" && typeof dark === "object";
  $: usingObjectTheme =
    !usingPair && theme !== undefined && typeof theme === "object";
  $: usingObjectPalette = usingObjectPair || usingObjectTheme;

  $: hasTheme = theme !== undefined || usingPair;

  $: if (!hasOwnScopeClass) {
    scopeClass = usingObjectPair
      ? scopeClassFor(`${light.name}::${dark.name}`)
      : usingObjectTheme
        ? scopeClassFor(theme.name)
        : scopeClassFor(theme ?? `${light}${dark}`);
  }

  // The scoped-<style> path's content; empty (nothing rendered) on the
  // object path, which never touches <svelte:head> or the ownership store.
  $: style =
    hasTheme && !usingObjectPalette
      ? usingPair
        ? dualStyle(light, dark, scopeClass, mode)
        : scopeStyle(theme, scopeClass)
      : "";

  // Inline vars applied to the wrapper element; undefined (no `style`
  // attribute) on the legacy scoped-<style> path.
  $: inlineStyle = usingObjectPair
    ? dualPaletteStyle(light, dark, mode)
    : usingObjectTheme
      ? paletteStyle(theme)
      : undefined;

  const token = Symbol();
  let registeredKey;
  /** @type {import("svelte/store").Writable<symbol[]> | undefined} */
  let registry;

  function unregister() {
    registry?.update((owners) => owners.filter((owner) => owner !== token));
  }

  $: {
    const key = style ? `${scopeClass}::${style}` : undefined;
    if (key !== registeredKey) {
      unregister();
      registeredKey = key;
      registry = isBrowser && key !== undefined ? registryFor(key) : undefined;
      registry?.update((owners) => [...owners, token]);
    }
  }

  $: owners = $registry ?? [];
  $: shouldRender = !isBrowser || owners[0] === token;

  onMount(() => unregister);
</script>

<svelte:head
  >{#if shouldRender}
    {@html style}
  {/if}</svelte:head
>

<div class={scopeClass} style={inlineStyle} {...$$restProps}>
  <slot {scopeClass} />
</div>
