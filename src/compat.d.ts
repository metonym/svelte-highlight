import type { LanguageType } from "./languages/index.d.ts";

/**
 * Converts a user-authored hljs grammar (`(hljs) => modeObject`) into a
 * `LanguageType` at runtime. Requires `highlight.js` as your own dependency.
 *
 * @param source raw source of the grammar's file (e.g. a `?raw` import);
 *   recovers Set-membership `on:begin` guards the compiled callback can't expose.
 * @returns `warnings` lists hljs features with no IR equivalent.
 */
export function fromHighlightJs(
  name: string,
  languageFn: (hljs: unknown) => object,
  source?: string,
): Promise<LanguageType<string> & { warnings: string[] }>;
