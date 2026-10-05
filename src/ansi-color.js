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
 * `indexedHex` results by palette index, filled on first use. A colored log
 * repeats the same few indices, and building each string costs a few
 * array allocations (see bench/ansi.bench.ts).
 * @type {string[]}
 */
const INDEXED_HEX = [];

/**
 * 256-color index to hex.
 * @param {number} index
 * @returns {string}
 */
export function indexedHex(index) {
  const cached = INDEXED_HEX[index];
  if (cached !== undefined) return cached;
  const [r, g, b] = indexedRgb(index);
  const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  // Cache only the 240 real palette slots, so an out-of-range index can't
  // grow the table.
  if (Number.isInteger(index) && index >= 16 && index <= 255) {
    INDEXED_HEX[index] = hex;
  }
  return hex;
}

/**
 * `cssColor`'s `var(--ansi-<name>, <default>)` string for each of the 16
 * named colors, built once instead of per segment.
 * @type {Map<string, string>}
 */
const NAMED_CSS = new Map(
  Object.entries(ANSI_COLOR_DEFAULTS).map(([name, hex]) => [
    name,
    `var(--ansi-${name}, ${hex})`,
  ]),
);

/**
 * Parsed color to CSS (named colors use `--ansi-*` vars).
 * @param {AnsiColor} color
 * @returns {string}
 */
export function cssColor(color) {
  if ("name" in color) {
    return (
      NAMED_CSS.get(color.name) ??
      `var(--ansi-${color.name}, ${ANSI_COLOR_DEFAULTS[color.name]})`
    );
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
 * sRGB channel (0-255) to linear light.
 * @param {number} c
 * @returns {number}
 */
function linearChannel(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

// `linearChannel` for every integer channel, so the per-segment contrast
// check reads a table instead of calling `**` (see bench/ansi.bench.ts).
const LINEAR = Array.from({ length: 256 }, (_, c) => linearChannel(c));

/**
 * WCAG relative luminance.
 * @param {[number, number, number]} rgb
 * @returns {number}
 */
export function luminance(rgb) {
  // A channel outside the table (a truecolor value past 255) is computed
  // directly, with the same result the table would hold.
  const r = LINEAR[rgb[0]] ?? linearChannel(rgb[0]);
  const g = LINEAR[rgb[1]] ?? linearChannel(rgb[1]);
  const b = LINEAR[rgb[2]] ?? linearChannel(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG contrast ratio from two relative luminances.
 * @param {number} la
 * @param {number} lb
 * @returns {number}
 */
function luminanceRatio(la, lb) {
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * WCAG contrast ratio.
 * @param {[number, number, number]} a
 * @param {[number, number, number]} b
 * @returns {number}
 */
export function contrastRatio(a, b) {
  return luminanceRatio(luminance(a), luminance(b));
}

const BLACK_LUMINANCE = luminance(BLACK);
const WHITE_LUMINANCE = luminance(WHITE);

/**
 * `readableForeground` for a background whose luminance is already known.
 * @param {number} bgLuminance
 * @returns {string}
 */
function readableForegroundFor(bgLuminance) {
  return luminanceRatio(BLACK_LUMINANCE, bgLuminance) >=
    luminanceRatio(WHITE_LUMINANCE, bgLuminance)
    ? "#000000"
    : "#ffffff";
}

/**
 * Black or white, whichever contrasts more with `bg`.
 * @param {[number, number, number]} bg
 * @returns {string}
 */
export function readableForeground(bg) {
  return readableForegroundFor(luminance(bg));
}

// Luminance of each named color's default and of the fallback foreground,
// computed once: `foregroundCss` needs them for most segments with a
// background, and re-parsing the hex string each time dominated the check.
/** @type {Map<string, number>} */
const NAMED_LUMINANCE = new Map(
  Object.entries(ANSI_COLOR_DEFAULTS).map(([name, hex]) => [
    name,
    luminance(hexToRgb(hex)),
  ]),
);
const FALLBACK_LUMINANCE = luminance(hexToRgb(FOREGROUND_FALLBACK));

/**
 * `luminance(colorToRgb(color))`, without re-parsing a named color's hex.
 * @param {AnsiColor} color
 * @returns {number}
 */
function colorLuminance(color) {
  const named = "name" in color ? NAMED_LUMINANCE.get(color.name) : undefined;
  return named ?? luminance(colorToRgb(color));
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
    // Each luminance is computed once and reused for both the contrast check
    // and the black/white pick (it used to be computed up to three times).
    const bg = colorLuminance(segment.bg);
    const fg = segment.fg ? colorLuminance(segment.fg) : FALLBACK_LUMINANCE;
    if (luminanceRatio(fg, bg) < CONTRAST_TARGET) {
      return readableForegroundFor(bg);
    }
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
