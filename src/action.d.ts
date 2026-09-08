import type { Action } from "svelte/action";
import type { LanguageType } from "./languages";

export type HighlightActionParameters = {
  /**
   * Language used to highlight the element's contents. When omitted, the
   * action reads a `language-xxx` class off the node itself (the
   * Prism/highlight.js Markdown convention) and resolves it via
   * `loadLanguage`. No `language` prop and no matching class dispatches
   * `error` and leaves the content untouched.
   */
  language?: LanguageType<string>;

  /**
   * Code to highlight. When omitted, the element's
   * current `textContent` is highlighted.
   */
  code?: string;
};

/**
 * Highlight element contents in place with highlight.js.
 *
 * Should be placed on the `<code>` element inside a `<pre>`, matching the
 * theme CSS's `.hljs code` selector -- elsewhere (directly on `<pre>`, or a
 * non-`<pre><code>` element) it still highlights but may not be visually
 * targeted by the active theme.
 *
 * Dispatches two events on the node:
 * - `highlighted`: `detail: { html: string; language: string }`, after a
 *   successful highlight.
 * - `error`: `detail: { error: unknown }`, after a failed highlight.
 */
export declare const highlight: Action<HTMLElement, HighlightActionParameters>;
