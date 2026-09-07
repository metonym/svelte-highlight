import type { LanguageType } from "./languages/index.d.ts";

/**
 * Converts a user-authored hljs-format grammar (`(hljs) => modeObject`) into
 * this package's `LanguageType` at runtime, for use with `Highlight`,
 * `HighlightAuto`, `HighlightEditable`, `HighlightStream`, the `highlight`
 * action, or `loadLanguage`-style dynamic registration. Requires
 * `highlight.js` as your own dependency (not bundled by svelte-highlight).
 *
 * @param source raw source text of the grammar's own file (e.g. via a
 *   bundler's `?raw` import); recovers array-membership `on:begin` guards
 *   that the compiled callback alone can't expose.
 * @returns `warnings` lists hljs features with no IR equivalent; empty when
 *   the conversion is clean.
 */
export function fromHighlightJs(
  name: string,
  languageFn: (hljs: unknown) => object,
  source?: string,
): Promise<LanguageType<string> & { warnings: string[] }>;
