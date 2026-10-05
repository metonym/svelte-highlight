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

  import { createAnsiOutput } from "./ansi-output.js";

  const output = createAnsiOutput();
  // `update()` hands back the same array, patched in place. Reassigning it
  // still invalidates `segments`: legacy-mode equality treats any object
  // as changed.
  $: segments = output.update(text, autoContrast);
</script>

<pre class="ansi" class:wrap {...$$restProps}><code
    >{#each segments as segment}{#if segment.link}<a href={segment.link} rel="noopener noreferrer" class={segment.class} style={segment.style}
        >{segment.text}</a
      >{:else}<span class={segment.class} style={segment.style}
        >{segment.text}</span
      >{/if}{/each}</code
  ></pre>

<style>
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
