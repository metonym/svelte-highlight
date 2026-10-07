// AnsiOutput color math: SGR color to CSS and WCAG auto-contrast.

/** @typedef {import("./ansi.d.ts").AnsiColor} AnsiColor */
/** @typedef {import("./ansi.d.ts").AnsiSegment} AnsiSegment */

export const FOREGROUND_FALLBACK = "#d4d4d4";
export const CONTRAST_TARGET = 4.5;
/** @type {[number, number, number]} */
const BLACK = [0, 0, 0];
/** @type {[number, number, number]} */
const WHITE = [255, 255, 255];

/**
 * xterm defaults, each overridable via `--ansi-<name>`.
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

// 6x6x6 cube steps.
const CUBE = [0, 95, 135, 175, 215, 255];

/**
 * @param {number} index
 * @returns {[number, number, number]}
 */
function indexedRgb(index) {
  if (index >= 232) {
    const value = (index - 232) * 10 + 8;
    return [value, value, value];
  }
  const n = index - 16;
  return [
    /** @type {number} */ (CUBE[Math.floor(n / 36) % 6]),
    /** @type {number} */ (CUBE[Math.floor(n / 6) % 6]),
    /** @type {number} */ (CUBE[n % 6]),
  ];
}

// Lazily filled; logs repeat a few indices.
/** @type {string[]} */
const INDEXED_HEX = [];

/**
 * @param {number} index
 * @returns {string}
 */
export function indexedHex(index) {
  const cached = INDEXED_HEX[index];
  if (cached !== undefined) return cached;
  const [r, g, b] = indexedRgb(index);
  const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  // Only cache real palette slots so bad indices can't grow the table.
  if (Number.isInteger(index) && index >= 16 && index <= 255) {
    INDEXED_HEX[index] = hex;
  }
  return hex;
}

/** @type {Map<string, string>} */
const NAMED_CSS = new Map(
  Object.entries(ANSI_COLOR_DEFAULTS).map(([name, hex]) => [
    name,
    `var(--ansi-${name}, ${hex})`,
  ]),
);

/**
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
 * @param {number} c
 * @returns {number}
 */
function linearChannel(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

// Lookup table avoids `**` in the per-segment contrast check.
const LINEAR = Array.from({ length: 256 }, (_, c) => linearChannel(c));

/**
 * WCAG relative luminance.
 * @param {[number, number, number]} rgb
 * @returns {number}
 */
export function luminance(rgb) {
  // Out-of-range truecolor channels fall back to direct computation.
  const r = LINEAR[rgb[0]] ?? linearChannel(rgb[0]);
  const g = LINEAR[rgb[1]] ?? linearChannel(rgb[1]);
  const b = LINEAR[rgb[2]] ?? linearChannel(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * @param {number} la
 * @param {number} lb
 * @returns {number}
 */
function luminanceRatio(la, lb) {
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
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

// Precomputed: re-parsing hex per segment dominated the contrast check.
/** @type {Map<string, number>} */
const NAMED_LUMINANCE = new Map(
  Object.entries(ANSI_COLOR_DEFAULTS).map(([name, hex]) => [
    name,
    luminance(hexToRgb(hex)),
  ]),
);
const FALLBACK_LUMINANCE = luminance(hexToRgb(FOREGROUND_FALLBACK));

/**
 * @param {AnsiColor} color
 * @returns {number}
 */
function colorLuminance(color) {
  const named = "name" in color ? NAMED_LUMINANCE.get(color.name) : undefined;
  return named ?? luminance(colorToRgb(color));
}

/**
 * @param {AnsiSegment} segment
 * @param {boolean} autoContrast
 * @returns {string | undefined}
 */
export function foregroundCss(segment, autoContrast) {
  // Transparent keeps layout and copy text.
  if (segment.conceal) return "transparent";
  if (autoContrast && segment.bg) {
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
