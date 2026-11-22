import type { LanguageType } from "./languages";

export interface HighlightParameters {
  /**
   * Grammar to use. When omitted, a `language-xxx` class on the element is
   * loaded via `loadLanguage`; with neither, dispatches `error`.
   */
  language?: LanguageType<string>;
  /** Code to highlight. Defaults to the element's initial `textContent`. */
  code?: string;
}

export interface HighlightHandle {
  /** Re-highlights with new parameters. */
  update(parameters?: HighlightParameters): void;
  /** Restores the element's original text. */
  destroy(): void;
}

/**
 * Highlights an element's contents in place. Use it on the `<code>` inside
 * a `<pre>` so theme CSS applies. Dispatches `highlighted`
 * (`{ html, language }`) or `error` (`{ error }`) on the element.
 */
export function highlight(
  element: HTMLElement,
  parameters?: HighlightParameters,
): HighlightHandle;

export interface HighlightAllOptions {
  /** Elements to highlight. Default `pre code[class*="language-"]`. */
  selector?: string;
  /** Grammar for every element, instead of each one's `language-xxx` class. */
  language?: LanguageType<string>;
}

export interface HighlightAllResult {
  /** The elements being highlighted. */
  elements: HTMLElement[];
  /**
   * Settles once every element is highlighted or has failed. Elements
   * destroyed before their grammar loads count as failed.
   */
  ready: Promise<{ highlighted: number; failed: number }>;
  /** Restores every element's original text. */
  destroy(): void;
}

/**
 * Highlights every `pre code[class*="language-"]` under `root` (default
 * `document`) in place, loading each element's grammar from its
 * `language-xxx` class. Skips elements that already have the `hljs` class.
 */
export function highlightAll(
  root?: ParentNode,
  options?: HighlightAllOptions,
): HighlightAllResult;
