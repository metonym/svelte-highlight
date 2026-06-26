/** Prefix theme selectors with `.<scope> `. Keeps a `<style>` wrapper when present. */
export declare function scopeStyle(style: string, scope: string): string;

/** Walk CSS and rewrite each selector with `transform`. */
export declare function scopeSelectors(
  css: string,
  transform: (selector: string) => string,
): string;

/**
 * Build a combined light/dark stylesheet scoped under `.scope`. `mode` is
 * `"auto"` (prefers-color-scheme media queries), `"light"`/`"dark"` (single
 * theme), or any CSS selector that gates the dark block.
 */
export declare function dualStyle(
  light: string,
  dark: string,
  scope: string,
  mode?: string,
): string;

/** Hash of the theme string. Same theme gives the same class (SSR-safe). */
export declare function scopeClassFor(theme: string, prefix?: string): string;
