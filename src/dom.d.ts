import type { LanguageType } from "./languages";
import type { ThemePalette } from "./theme";

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

export interface PaintHighlightsOptions {
  /** Grammar to use. */
  language: LanguageType<string>;
  /** Code to highlight. Defaults to the element's initial text. */
  code?: string;
  /**
   * Theme CSS or a `ThemePalette`. Needed for the CSS Custom Highlight API:
   * `::highlight()` rules can't come from the page's theme CSS. Without it,
   * the element gets `<span>`s for that CSS to color.
   */
  theme?: string | ThemePalette;
}

export interface PaintHighlightsHandle {
  /**
   * `"css-highlights"` when the browser paints the tokens, or `"dom"` for
   * `<span>` markup (no `theme`, or no `CSS.highlights`).
   */
  readonly engine: "dom" | "css-highlights";
  /** Highlights again with changed options. */
  update(options: Partial<PaintHighlightsOptions>): void;
  /** Removes the highlights and their `<style>`, and restores the text. */
  destroy(): void;
}

/**
 * Highlights an element's code with the CSS Custom Highlight API, the
 * `"css-highlights"` engine without a component: the text stays one text
 * node, with no `<span>` per token. Adds its `::highlight()` rules in a
 * `<style>`. Falls back to `<span>` markup without a `theme` or where
 * `CSS.highlights` is missing.
 */
export function paintHighlights(
  element: HTMLElement,
  options: PaintHighlightsOptions,
): PaintHighlightsHandle;
