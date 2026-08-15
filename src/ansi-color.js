/**
 * Pure color math for AnsiOutput: SGR color to CSS, and WCAG contrast-based
 * auto-foreground selection. Split out of the component (rather than left
 * inline in its `<script>`) so it's directly testable and benchable without
 * a DOM - .svelte files aren't type-checked by `tsgo`/covered by `bun test`.
 */

/** @typedef {import("./ansi.d.ts").AnsiColor} AnsiColor */
/** @typedef {import("./ansi.d.ts").AnsiSegment} AnsiSegment */

export const FOREGROUND_FALLBACK = "#d4d4d4";
export const CONTRAST_TARGET = 4.5;
/** @type {[number, number, number]} */
const BLACK = [0, 0, 0];
/** @type {[number, number, number]} */
const WHITE = [255, 255, 255];

/**
 * 16-color xterm defaults, each overridable via `--ansi-<name>`.
 * @type {Record<string, string>}
 */
export const ANSI_COLOR_DEFAULTS = {
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

// 256-color cube steps (6x6x6).
const CUBE = [0, 95, 135, 175, 215, 255];

/**
 * 256-color index to an RGB triple. Shared by `indexedHex` (stringifies it
 * for CSS) and `colorToRgb` (used as-is) so the latter doesn't have to
 * round-trip through a hex string just to parse the numbers back out.
 * @param {number} index
 * @returns {[number, number, number]}
 */
function indexedRgb(index) {
  if (index >= 232) {
    const value = (index - 232) * 10 + 8;
    return [value, value, value];
  }
  const n = index - 16;
  // n is always in [0, 215] for index in [16, 231], so these three indices
  // are always in CUBE's bounds ([0, 5]).
  return [
    /** @type {number} */ (CUBE[Math.floor(n / 36) % 6]),
    /** @type {number} */ (CUBE[Math.floor(n / 6) % 6]),
    /** @type {number} */ (CUBE[n % 6]),
  ];
}

/**
 * 256-color index to hex.
 * @param {number} index
 * @returns {string}
 */
export function indexedHex(index) {
  const [r, g, b] = indexedRgb(index);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Parsed color to CSS (named colors use `--ansi-*` vars).
 * @param {AnsiColor} color
 * @returns {string}
 */
export function cssColor(color) {
  if ("name" in color) {
    return `var(--ansi-${color.name}, ${ANSI_COLOR_DEFAULTS[color.name]})`;
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
export function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

/**
 * Named colors use the default palette (theme overrides aren't known here).
 * @param {AnsiColor} color
 * @returns {[number, number, number]}
 */
export function colorToRgb(color) {
  if ("name" in color) {
    return hexToRgb(ANSI_COLOR_DEFAULTS[color.name] ?? "#000000");
  }
  if ("rgb" in color) return color.rgb;
  return indexedRgb(color.index);
}

/**
 * WCAG relative luminance.
 * @param {[number, number, number]} rgb
 * @returns {number}
 */
export function luminance(rgb) {
  const toLinear = (/** @type {number} */ c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * toLinear(rgb[0]) +
    0.7152 * toLinear(rgb[1]) +
    0.0722 * toLinear(rgb[2])
  );
}

/**
 * WCAG contrast ratio.
 * @param {[number, number, number]} a
 * @param {[number, number, number]} b
 * @returns {number}
 */
export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Black or white, whichever contrasts more with `bg`.
 * @param {[number, number, number]} bg
 * @returns {string}
 */
export function readableForeground(bg) {
  return contrastRatio(BLACK, bg) >= contrastRatio(WHITE, bg)
    ? "#000000"
    : "#ffffff";
}

/**
 * Foreground CSS, with auto-contrast override when needed.
 * @param {AnsiSegment} segment
 * @param {boolean} autoContrast
 * @returns {string | undefined}
 */
export function foregroundCss(segment, autoContrast) {
  // Concealed text is rendered transparent (layout and copy text stay).
  if (segment.conceal) return "transparent";
  if (autoContrast && segment.bg) {
    const bg = colorToRgb(segment.bg);
    const fg = segment.fg
      ? colorToRgb(segment.fg)
      : hexToRgb(FOREGROUND_FALLBACK);
    if (contrastRatio(fg, bg) < CONTRAST_TARGET) return readableForeground(bg);
  }
  return segment.fg ? cssColor(segment.fg) : undefined;
}

/**
 * @param {AnsiSegment} segment
 * @returns {string | undefined}
 */
export function classNames(segment) {
  const names = [];
  if (segment.bold) names.push("bold");
  if (segment.dim) names.push("dim");
  if (segment.italic) names.push("italic");
  if (segment.underline) names.push("underline");
  if (segment.strikethrough) names.push("strikethrough");
  return names.length ? names.join(" ") : undefined;
}

/**
 * @param {AnsiSegment} segment
 * @param {boolean} autoContrast
 * @returns {string | undefined}
 */
export function inlineStyle(segment, autoContrast) {
  let style = "";
  if (segment.bg) style += `background-color:${cssColor(segment.bg)};`;
  const fg = foregroundCss(segment, autoContrast);
  if (fg) style += `color:${fg};`;
  return style || undefined;
}
