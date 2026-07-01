import { highlightLanguage } from "./core.js";

/**
 * Highlight an element in place with highlight.js.
 * Omits `code` to highlight existing `textContent`.
 *
 * @type {import("svelte/action").Action<HTMLElement, { language: import("./languages").LanguageType<string>; code?: string }>}
 */
export function highlight(node, parameters) {
  /** @param {{ language: import("./languages").LanguageType<string>; code?: string }} params */
  function apply({ language, code }) {
    const source = code ?? node.textContent ?? "";
    node.innerHTML = highlightLanguage(language, source);
    node.classList.add("hljs");
  }

  apply(parameters);

  return {
    update: apply,
  };
}
