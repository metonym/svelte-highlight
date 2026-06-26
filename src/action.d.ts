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
 * Svelte action that highlights an element's contents in place using
 * highlight.js. Useful for progressively enhancing existing `<pre><code>`
 * markup (e.g. server-rendered markdown).
 */
export declare const highlight: Action<HTMLElement, HighlightActionParameters>;
