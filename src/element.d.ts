export interface HighlightElement extends HTMLElement {
  /** The code to highlight. Defaults to the element's text. */
  code: string;
  /** The language name, as in `language-xxx` classes. */
  language: string;
}

/**
 * Defines the `<shl-code>` custom element (or `name`), once, and returns
 * its class. It highlights its text, or its `code` property, in the
 * language its `language` attribute names. It renders
 * `<pre><code class="hljs">` inside itself, so theme CSS applies, and
 * dispatches `highlighted` (`{ html, language }`) or `error` (`{ error }`).
 *
 * @example
 * ```html
 * <shl-code language="typescript">const add = (a, b) => a + b;</shl-code>
 * <script type="module">
 *   import { defineHighlightElement } from "svelte-highlight/element";
 *   defineHighlightElement();
 * </script>
 * ```
 */
export function defineHighlightElement(
  name?: string,
): new () => HighlightElement;

declare global {
  interface HTMLElementTagNameMap {
    "shl-code": HighlightElement;
  }
}
