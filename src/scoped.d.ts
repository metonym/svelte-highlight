/** Prefix theme selectors with `.<scope> `. Keeps a `<style>` wrapper when
 * present; `nonce` is attached to it (ignored when there's no wrapper). */
export declare function scopeStyle(
  style: string,
  scope: string,
  nonce?: string,
): string;

/** Walk CSS and rewrite each selector with `transform`. */
export declare function scopeSelectors(
  css: string,
  transform: (selector: string) => string,
): string;

/**
 * Build a combined light/dark stylesheet scoped under `.scope`. `mode` is
 * `"auto"` (prefers-color-scheme media queries), `"light"`/`"dark"` (single
 * theme), or any CSS selector that gates the dark block. `nonce` is attached
 * to the emitted `<style>` tag.
 */
export declare function dualStyle(
  light: string,
  dark: string,
  scope: string,
  mode?: string,
  nonce?: string,
): string;

/** Hash of the theme string. Same theme gives the same class (SSR-safe). */
export declare function scopeClassFor(theme: string, prefix?: string): string;
