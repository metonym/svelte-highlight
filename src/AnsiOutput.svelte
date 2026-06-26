<script>
  /** @type {string} */
  export let text;

  /**
   * Whether to flip a span's foreground to black or white when it wouldn't read
   * on its background (e.g. white text on a white background). Only spans that
   * set a background are adjusted.
   * @type {boolean}
   */
  export let autoContrast = true;

  import { parseAnsi } from "./ansi.js";

  // The default foreground (matches `--ansi-foreground`) and the minimum
  // contrast ratio a span's text must meet against its background.
  const FOREGROUND_FALLBACK = "#d4d4d4";
  const CONTRAST_TARGET = 4.5;

  // Default hex values for the 16 base colors (xterm palette). Each is exposed
  // as a `--ansi-<name>` CSS variable so the palette is fully themable.
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

  // The six steps used by the 6×6×6 color cube of the 256-color palette.
  const CUBE = [0, 95, 135, 175, 215, 255];

  /**
   * Resolve a 256-color palette index (16-255) to a hex string.
   * @param {number} index
   */
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

  /**
   * Convert a parsed color into a CSS color string. Named colors reference a
   * themable CSS variable with a hex fallback.
   * @param {import("./ansi").AnsiColor} color
   */
  function cssColor(color) {
    if ("name" in color) {
      return `var(--ansi-${color.name}, ${DEFAULTS[color.name]})`;
    }
    if ("rgb" in color) {
      return `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
    }
    return color.index < 16
      ? `var(--ansi-${color.index}, ${indexedHex(color.index)})`
      : indexedHex(color.index);
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

  /**
   * Resolve a parsed color to its RGB value (using the default palette for
   * named colors, since user theme overrides aren't known at this point).
   * @param {import("./ansi").AnsiColor} color
   * @returns {[number, number, number]}
   */
  function colorToRgb(color) {
    if ("name" in color) return hexToRgb(DEFAULTS[color.name] ?? "#000000");
    if ("rgb" in color) return color.rgb;
    return hexToRgb(indexedHex(color.index));
  }

  /**
   * Relative luminance per WCAG.
   * @param {[number, number, number]} rgb
   */
  function luminance([r, g, b]) {
    const channels = [r, g, b].map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  /**
   * WCAG contrast ratio between two colors.
   * @param {[number, number, number]} a
   * @param {[number, number, number]} b
   */
  function contrastRatio(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /**
   * Pick black or white, whichever reads better against `bg`.
   * @param {[number, number, number]} bg
   */
  function readableForeground(bg) {
    const black = /** @type {[number, number, number]} */ ([0, 0, 0]);
    const white = /** @type {[number, number, number]} */ ([255, 255, 255]);
    return contrastRatio(black, bg) >= contrastRatio(white, bg)
      ? "#000000"
      : "#ffffff";
  }

  /**
   * Resolve a segment's foreground CSS, substituting a readable color when
   * auto-contrast is on and the span's text would be hard to read on its
   * background.
   * @param {import("./ansi").AnsiSegment} segment
   */
  function foregroundCss(segment) {
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

  // Resolve each segment to its rendered class/style up front so the helpers
  // are referenced from the script (and the markup stays declarative).
  $: segments = parseAnsi(text).map((segment) => ({
    text: segment.text,
    class: classNames(segment),
    style: inlineStyle(segment),
  }));
</script>

<pre class="ansi" {...$$restProps}><code
    >{#each segments as segment}<span class={segment.class} style={segment.style}
        >{segment.text}</span
      >{/each}</code
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

  .underline {
    text-decoration: underline;
  }
</style>
