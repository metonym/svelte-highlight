<script>
  /** @type {string} */
  export let text;

  /**
   * Flip foreground to black/white when contrast on a background span is too low.
   * @type {boolean}
   */
  export let autoContrast = true;

  /**
   * Wrap long lines instead of horizontally scrolling.
   * @type {boolean}
   */
  export let wrap = false;

  /**
   * Accessible name of the scrollable output region. Inside a CodeWindow,
   * the window's `title` or `label` is the default.
   * @type {string | undefined}
   */
  export let label = undefined;

  import { getContext } from "svelte";
  import { createAnsiOutput } from "./ansi-output.js";
  import { CODE_REGION, NO_REGION_LABEL } from "./code-region.js";

  /** @type {import("svelte/store").Readable<string | undefined>} */
  const windowLabel = getContext(CODE_REGION) ?? NO_REGION_LABEL;

  const output = createAnsiOutput();
  // Same array each time; legacy-mode reactivity still treats it as changed.
  $: segments = output.update(text, autoContrast);
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<pre
  class="ansi"
  class:wrap
  tabindex="0"
  role="region"
  aria-label={label ?? $windowLabel ?? "Terminal output"}
  {...$$restProps}><code
    >{#each segments as segment}{#if segment.link}<a
      href={segment.link}
      rel="noopener noreferrer"
      class={segment.class}
      style={segment.style}>{segment.text}</a
    >{:else}<span class={segment.class} style={segment.style}
      >{segment.text}</span
    >{/if}{/each}</code
  ></pre>

<style>
  /* Draw the ring inside, or a clipping parent hides it in Safari. */
  .ansi:focus-visible {
    outline-offset: -2px;
  }

  .ansi {
    margin: 0;
    overflow: auto;
    padding: var(--ansi-padding, 1em);
    background: var(--ansi-background, #1e1e1e);
    color: var(--ansi-foreground, #d4d4d4);
    font-family: var(
      --ansi-font-family,
      ui-monospace,
      "SFMono-Regular",
      "Menlo",
      monospace
    );
    font-size: var(--ansi-font-size, 0.875em);
    line-height: var(--ansi-line-height, 1.5);
    tab-size: var(--ansi-tab-size, 4);
  }

  .ansi.wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .bold {
    font-weight: var(--ansi-bold-weight, 700);
  }

  .dim {
    opacity: var(--ansi-dim-opacity, 0.5);
  }

  .italic {
    font-style: italic;
  }

  .ansi a {
    color: inherit;
    text-decoration: none;
  }

  .ansi .underline {
    text-decoration: underline;
  }

  .ansi .strikethrough {
    text-decoration: line-through;
  }

  .ansi .underline.strikethrough {
    text-decoration: underline line-through;
  }
</style>
