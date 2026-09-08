import type { Action } from "svelte/action";
import type { LanguageType } from "./languages";

export type HighlightActionParameters = {
  /**
   * Language used to highlight the element's contents.
   */
  language: LanguageType<string>;

  /**
   * Code to highlight. When omitted, the element's
   * current `textContent` is highlighted.
   */
  code?: string;
};

/**
 * Highlight element contents in place with highlight.js.
 *
 * Dispatches two events on the node:
 * - `highlighted`: `detail: { html: string; language: string }`, after a
 *   successful highlight.
 * - `error`: `detail: { error: unknown }`, after a failed highlight.
 */
export declare const highlight: Action<HTMLElement, HighlightActionParameters>;
