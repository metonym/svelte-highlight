<script>
  /** @type {string} */
  export let text;

  /**
   * Flip foreground to black/white when contrast on a background span is too low.
   * @type {boolean}
   */
  export let autoContrast = true;

  import { createAnsiSession } from "./ansi.js";
  import { classNames, inlineStyle } from "./ansi-color.js";

  let session = createAnsiSession();
  // Prefix of `text` already fed to `session`. If `text` stops starting
  // with this, treat it as a restart (not an append) and re-parse fresh.
  let fedText = "";
  let parsed = [];

  // Re-parsing the whole string on every change is O(n^2) over a growing
  // (live-tailed or streamed) `text`, so only feed the new suffix when
  // `text` grows by a pure append; anything else gets a fresh session.
  $: {
    if (text.startsWith(fedText)) {
      if (text.length > fedText.length) {
        session.append(text.slice(fedText.length));
        fedText = text;
      }
    } else {
      session = createAnsiSession();
      session.append(text);
      fedText = text;
    }
    parsed = session.segments();
  }
  $: segments = parsed.map((segment) => ({
    text: segment.text,
    class: classNames(segment),
    style: inlineStyle(segment, autoContrast),
    link: segment.link,
  }));
</script>

<pre class="ansi" {...$$restProps}><code
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
