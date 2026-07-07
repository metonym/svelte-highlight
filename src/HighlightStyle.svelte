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
  import { onDestroy } from "svelte";
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

  onDestroy(unregister);
</script>

<svelte:head
  >{#if shouldRender}
    {@html style}
  {/if}</svelte:head
>

<div class={scopeClass} {...$$restProps}>
  <slot {scopeClass} />
</div>
