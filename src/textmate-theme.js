/**
 * Import VS Code / TextMate theme JSON (a parsed object — JSONC parsing is
 * the caller's job) into a `ThemePalette`.
 *
 * @typedef {import("./textmate-theme.d.ts").TextMateTheme} TextMateTheme
 * @typedef {import("./textmate-theme.d.ts").TextMateTokenColor} TextMateTokenColor
 * @typedef {import("./textmate-theme.d.ts").FromTextMateOptions} FromTextMateOptions
 * @typedef {import("./theme.d.ts").ThemePalette} ThemePalette
 * @typedef {import("./theme.d.ts").TokenStyle} TokenStyle
 */

import {
  applyTokenStyle,
  colorSchemeFor,
  parseScopeKey,
  varName,
} from "./theme-vars.js";

const DEFAULT_NAME = "custom-theme";
const WHITESPACE_RUN = /\s+/;
const HAS_WHITESPACE = /\s/;

/**
 * TextMate scope prefix -> hljs target scope key (in the same
 * dot/space-separated grammar `defineTheme`'s `scopes` option uses).
 * Starter table — extend if a well-known scope is obviously missing.
 * @type {Array<[string, string]>}
 */
const STARTER_TABLE = [
  ["comment", "comment"],
  ["string", "string"],
  ["string.regexp", "regexp"],
  ["constant.numeric", "number"],
  ["constant.language", "literal"],
  ["constant.character.escape", "string"],
  ["constant.other", "symbol"],
  ["keyword", "keyword"],
  ["keyword.operator", "operator"],
  ["storage.type", "keyword"],
  ["storage.modifier", "keyword"],
  ["entity.name.function", "title.function_"],
  ["support.function", "title.function_"],
  ["entity.name.type", "title.class_"],
  ["entity.name.class", "title.class_"],
  ["support.type", "title.class_"],
  ["support.class", "title.class_"],
  ["entity.name.tag", "tag"],
  ["entity.other.attribute-name", "attr"],
  ["variable", "variable"],
  ["variable.other", "variable"],
  ["variable.parameter", "params"],
  ["variable.language", "variable.language_"],
  ["support.constant", "literal"],
  ["punctuation", "punctuation"],
  ["meta.preprocessor", "meta"],
  ["markup.heading", "section"],
  ["markup.quote", "quote"],
  ["markup.bold", "strong"],
  ["markup.italic", "emphasis"],
  ["markup.underline.link", "link"],
  ["markup.inserted", "addition"],
  ["markup.deleted", "deletion"],
];

const STARTER_ROWS = STARTER_TABLE.map(([prefix, target]) => ({
  segments: prefix.split("."),
  target,
}));

/**
 * The most specific (longest segment-prefix) starter-table row matching
 * `scope`, or `null` if none does.
 * @param {string} scope
 */
function bestMatch(scope) {
  const segments = scope.split(".");
  let best = /** @type {typeof STARTER_ROWS[number] | null} */ (null);

  for (const row of STARTER_ROWS) {
    if (row.segments.length > segments.length) continue;
    let matches = true;
    for (let i = 0; i < row.segments.length; i++) {
      if (row.segments[i] !== segments[i]) {
        matches = false;
        break;
      }
    }
    if (matches && (!best || row.segments.length > best.segments.length)) {
      best = row;
    }
  }

  return best;
}

/**
 * @param {TextMateTokenColor["settings"] | undefined} settings
 * @returns {TokenStyle}
 */
function styleFromSettings(settings) {
  /** @type {TokenStyle} */
  const style = {};
  if (!settings) return style;
  if (settings.foreground !== undefined) style.color = settings.foreground;
  if (settings.background !== undefined) style.background = settings.background;
  if (settings.fontStyle) {
    const tokens = settings.fontStyle.split(WHITESPACE_RUN).filter(Boolean);
    if (tokens.includes("italic")) style.fontStyle = "italic";
    if (tokens.includes("bold")) style.fontWeight = "bold";
    if (tokens.includes("underline")) style.textDecoration = "underline";
  }
  return style;
}

/**
 * @param {TextMateTokenColor | undefined} entry
 */
function isGlobalSettingsEntry(entry) {
  if (!entry) return false;
  const scope = entry.scope;
  if (scope === undefined || scope === null || scope === "") return true;
  return Array.isArray(scope) && scope.length === 0;
}

/**
 * @param {TextMateTheme} theme
 * @param {FromTextMateOptions} [options]
 * @returns {ThemePalette}
 */
export function fromTextMate(theme, options = {}) {
  const onWarn = options.onWarn ?? (() => {});
  const tokenColors = theme.tokenColors ?? [];
  const globalEntry = tokenColors.find(isGlobalSettingsEntry);

  const fg =
    theme.colors?.["editor.foreground"] ?? globalEntry?.settings?.foreground;
  const bg =
    theme.colors?.["editor.background"] ?? globalEntry?.settings?.background;

  if (fg === undefined) {
    throw new Error(
      'fromTextMate(): could not resolve a foreground color — provide colors["editor.foreground"] or a tokenColors entry with no "scope".',
    );
  }
  if (bg === undefined) {
    throw new Error(
      'fromTextMate(): could not resolve a background color — provide colors["editor.background"] or a tokenColors entry with no "scope".',
    );
  }

  /** @type {Record<string, string>} */
  const vars = {};
  vars[/** @type {string} */ (varName([], "color"))] = fg;
  vars[/** @type {string} */ (varName([], "background-color"))] = bg;

  /** @type {Map<string, number>} */
  const winnerSpecificity = new Map();
  /** @type {Map<string, TokenStyle>} */
  const winnerStyle = new Map();

  for (const entry of tokenColors) {
    if (isGlobalSettingsEntry(entry)) continue;

    const rawScopes = Array.isArray(entry.scope)
      ? entry.scope
      : (entry.scope ?? "").split(",");

    for (const rawScope of rawScopes) {
      const scope = rawScope.trim();
      if (!scope) continue;

      if (HAS_WHITESPACE.test(scope)) {
        onWarn(
          `fromTextMate(): skipping descendant selector "${scope}" (TextMate parent scoping isn't supported).`,
        );
        continue;
      }

      const match = bestMatch(scope);
      if (!match) {
        onWarn(`fromTextMate(): no hljs mapping for scope "${scope}".`);
        continue;
      }

      const specificity = match.segments.length;
      const current = winnerSpecificity.get(match.target);
      // Later entries win ties (VS Code order semantics); iterating
      // tokenColors in array order means an equal-specificity match seen
      // later always overwrites the current winner.
      if (current !== undefined && specificity < current) continue;

      winnerSpecificity.set(match.target, specificity);
      winnerStyle.set(match.target, styleFromSettings(entry.settings));
    }
  }

  for (const [target, style] of winnerStyle) {
    applyTokenStyle(vars, parseScopeKey(target), style);
  }

  const colorScheme =
    theme.type === "light" || theme.type === "dark"
      ? theme.type
      : colorSchemeFor(bg);

  return {
    name: theme.name ?? DEFAULT_NAME,
    colorScheme,
    vars,
  };
}
