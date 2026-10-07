import type { PreprocessorGroup } from "svelte/compiler";

export interface HighlightStaticOptions {
  /**
   * Called when a static-looking usage fails to resolve or highlight and
   * falls back to the runtime `Highlight`. Defaults to `console.warn`.
   */
  onWarn?: (
    message: string,
    details: { filename?: string; line: number; cause: unknown },
  ) => void;

  /**
   * Called once per file that has matching `<Highlight>` usages, with how
   * many were rendered statically.
   */
  onSummary?: (summary: {
    filename?: string;
    matched: number;
    succeeded: number;
    failed: number;
  }) => void;
}

/**
 * Build-time preprocessor: replaces `<Highlight code="..." language={lang} />`
 * with pre-rendered HTML when `code` and `language` are static. Other usages
 * keep the runtime component.
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
