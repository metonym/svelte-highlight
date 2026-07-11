import type { ThemePalette } from "./theme.d.ts";

/**
 * Convert a theme's `.hljs-<scope>` color/background-color rules into
 * `::highlight(hljs-<scope>)` rules. Font-style, font-weight, and any
 * property other than color/background-color are dropped (the API's
 * cross-browser envelope), as are compound and descendant selectors.
 */
export function highlightRules(theme: string): string;

/** `ThemePalette` counterpart to `highlightRules`; same envelope (colors
 * only, single-scope vars only). */
export function highlightRulesFromPalette(palette: ThemePalette): string;
