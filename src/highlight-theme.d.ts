import type { ThemePalette } from "./theme.d.ts";

/**
 * Convert a theme's `.hljs-<scope>` rules into `::highlight(hljs-<scope>)`
 * rules. Only color/background-color on single-class selectors are kept.
 */
export function highlightRules(theme: string): string;

/** `ThemePalette` counterpart to `highlightRules`; same envelope (colors
 * only, single-scope vars only). */
export function highlightRulesFromPalette(palette: ThemePalette): string;
