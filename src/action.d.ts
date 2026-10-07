import type { Action } from "svelte/action";
import type { LanguageType } from "./languages";

export type HighlightActionParameters = {
  /**
   * Grammar to use. When omitted, a `language-xxx` class on the node is
   * loaded via `loadLanguage`; with neither, dispatches `error`.
   */
  language?: LanguageType<string>;

  /** Code to highlight. Defaults to the element's initial `textContent`. */
  code?: string;
};

/**
 * Highlights an element's contents in place. Use on the `<code>` inside a
 * `<pre>` so theme CSS applies.
 *
 * Dispatches `highlighted` (`{ html, language }`) or `error` (`{ error }`).
 */
export declare const highlight: Action<HTMLElement, HighlightActionParameters>;
