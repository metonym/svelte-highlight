<script>
  /** @type {string} */
  export let text;

  /**
   * Flip foreground to black/white when contrast on a background span is too low.
   * @type {boolean}
   */
  export let autoContrast = true;

  /** @type {string} */
  export let label = "Terminal output";

  // WCAG 2.1.1 scrollable-region-focusable: a static tabindex + region role
  // on the scrollable pre. Spread sidesteps Biome a11y rules that assume
  // tabindex/role only ever belong on interactive elements.
  $: regionAttrs = { tabindex: "0", role: "region", "aria-label": label };

  import { parseAnsi } from "./ansi.js";

  // Default foreground and minimum WCAG contrast ratio against backgrounds.
  const FOREGROUND_FALLBACK = "#d4d4d4";
  const CONTRAST_TARGET = 4.5;
  /** @type {[number, number, number]} */
  const BLACK = [0, 0, 0];
  /** @type {[number, number, number]} */
  const WHITE = [255, 255, 255];

  // 16-color xterm defaults, each overridable via `--ansi-<name>`.
  const DEFAULTS = {
    black: "#000000",
    red: "#cd0000",
    green: "#00cd00",
    yellow: "#cdcd00",
    blue: "#0000ee",
    magenta: "#cd00cd",
    cyan: "#00cdcd",
    white: "#e5e5e5",
    "bright-black": "#7f7f7f",
    "bright-red": "#ff0000",
    "bright-green": "#00ff00",
    "bright-yellow": "#ffff00",
    "bright-blue": "#5c5cff",
    "bright-magenta": "#ff00ff",
    "bright-cyan": "#00ffff",
    "bright-white": "#ffffff",
  };

  // 256-color cube steps (6×6×6).
  const CUBE = [0, 95, 135, 175, 215, 255];

  /** 256-color index → hex. */
  function indexedHex(index) {
    if (index >= 232) {
      const value = (index - 232) * 10 + 8;
      const hex = value.toString(16).padStart(2, "0");
      return `#${hex}${hex}${hex}`;
    }
    const n = index - 16;
    const r = CUBE[Math.floor(n / 36) % 6];
    const g = CUBE[Math.floor(n / 6) % 6];
    const b = CUBE[n % 6];
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }

  /** Parsed color → CSS (named colors use `--ansi-*` vars). */
  function cssColor(color) {
    if ("name" in color) {
      return `var(--ansi-${color.name}, ${DEFAULTS[color.name]})`;
    }
    if ("rgb" in color) {
      return `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
    }
    return indexedHex(color.index);
  }

  /**
   * @param {string} hex A `#rrggbb` string.
   * @returns {[number, number, number]}
   */
  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    ];
  }

  /** Named colors use the default palette (theme overrides aren't known here). */
  function colorToRgb(color) {
    if ("name" in color) return hexToRgb(DEFAULTS[color.name] ?? "#000000");
    if ("rgb" in color) return color.rgb;
    return hexToRgb(indexedHex(color.index));
  }

  /** WCAG relative luminance. */
  function luminance([r, g, b]) {
    const channels = [r, g, b].map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  /** WCAG contrast ratio. */
  function contrastRatio(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /** Black or white, whichever contrasts more with `bg`. */
  function readableForeground(bg) {
    return contrastRatio(BLACK, bg) >= contrastRatio(WHITE, bg)
      ? "#000000"
      : "#ffffff";
  }

  /** Foreground CSS, with auto-contrast override when needed. */
  function foregroundCss(segment) {
    // Concealed text is rendered transparent (layout and copy text stay).
    if (segment.conceal) return "transparent";
    if (autoContrast && segment.bg) {
      const bg = colorToRgb(segment.bg);
      const fg = segment.fg
        ? colorToRgb(segment.fg)
        : hexToRgb(FOREGROUND_FALLBACK);
      if (contrastRatio(fg, bg) < CONTRAST_TARGET)
        return readableForeground(bg);
    }
    return segment.fg ? cssColor(segment.fg) : undefined;
  }

  /** @param {import("./ansi").AnsiSegment} segment */
  function classNames(segment) {
    const names = [];
    if (segment.bold) names.push("bold");
    if (segment.dim) names.push("dim");
    if (segment.italic) names.push("italic");
    if (segment.underline) names.push("underline");
    if (segment.strikethrough) names.push("strikethrough");
    return names.length ? names.join(" ") : undefined;
  }

  /** @param {import("./ansi").AnsiSegment} segment */
  function inlineStyle(segment) {
    let style = "";
    if (segment.bg) style += `background-color:${cssColor(segment.bg)};`;
    const fg = foregroundCss(segment);
    if (fg) style += `color:${fg};`;
    return style || undefined;
  }

  // Precompute class/style per segment. Parse only when `text` changes.
  $: parsed = parseAnsi(text);
  $: segments = parsed.map((segment) => ({
    text: segment.text,
    class: classNames(segment),
    style: inlineStyle(segment),
    link: segment.link,
  }));
</script>

<pre class="ansi" {...regionAttrs} {...$$restProps}><code
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
