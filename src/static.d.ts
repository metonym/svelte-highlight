import type { PreprocessorGroup } from "svelte/compiler";

export interface HighlightStaticOptions {
  /**
   * Called when a usage looks static but fails to resolve or highlight (missing language
   * module, `highlight.js` throw, etc.). It still falls back to runtime `Highlight`; this
   * hook is for logging those failures.
   *
   * Defaults to `console.warn`.
   */
  onWarn?: (
    message: string,
    details: { filename?: string; line: number; cause: unknown },
  ) => void;

  /**
   * Called once per file with at least one shape-matched `<Highlight>` usage,
   * after all of that file's usages have been resolved - the escape hatch for
   * "how many usages actually went static," with aggregation across files
   * left to the caller. A file with no `<Highlight>`-shaped usages doesn't
   * trigger this at all.
   */
  onSummary?: (summary: {
    filename?: string;
    matched: number;
    succeeded: number;
    failed: number;
  }) => void;
}

/**
 * Build-time preprocessor: replaces `<Highlight code="..." language={lang} />` with
 * pre-rendered highlight.js HTML when `code` and `language` are known at compile time.
 * Dynamic `code`/`language`, slot content, spread props, directives, and `langtag` keep
 * the runtime `Highlight` component.
 *
 * @example
 * ```js
 * // vite.config.js / svelte.config.js
 * import { svelte } from "@sveltejs/vite-plugin-svelte";
 * import { highlightStatic } from "svelte-highlight/static";
 *
 * export default {
 *   plugins: [svelte({ preprocess: [highlightStatic()] })],
 * };
 * ```
 */
export function highlightStatic(
  options?: HighlightStaticOptions,
): PreprocessorGroup;
