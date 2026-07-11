import type { LanguageType } from "./languages/index.d.ts";

/**
 * Converts a user-authored hljs-format grammar (`(hljs) => modeObject`) into
 * this package's `LanguageType` at runtime, for use with `Highlight`,
 * `HighlightAuto`, `HighlightEditable`, `HighlightStream`, the `highlight`
 * action, or `loadLanguage`-style dynamic registration. Requires
 * `highlight.js` as your own dependency (not bundled by svelte-highlight).
 */
export function fromHighlightJs(
  name: string,
  languageFn: (hljs: unknown) => object,
): Promise<LanguageType<string>>;
