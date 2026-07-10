import { ensureRegistered, registry } from "./registry.js";

/**
 * Highlight an element in place with highlight.js.
 * Omits `code` to highlight existing `textContent`.
 *
 * @param {HTMLElement} node
 * @param {{ language: import("./languages").LanguageType<string>; code?: string }} parameters
 * @returns {ReturnType<import("svelte/action").Action<HTMLElement, { language: import("./languages").LanguageType<string>; code?: string }>>}
 */
export function highlight(node, parameters) {
  // Snapshot the pre-action source once: updates that omit `code` fall back
  // to this instead of `node.textContent`, which after the first highlight
  // pass holds the already-highlighted (and DOM-normalized) output.
  const originalText = node.textContent ?? "";

  /** @param {{ language: import("./languages").LanguageType<string>; code?: string }} params */
  function apply({ language, code }) {
    const source = code ?? originalText;
    let value;

    try {
      ensureRegistered(language);
      value = registry.highlight(source, { language: language.name }).value;
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn(
          `[svelte-highlight] failed to highlight with language "${language.name}"; leaving content unchanged.`,
          error,
        );
      }
      return;
    }

    node.innerHTML = value;
    node.classList.add("hljs");
  }

  apply(parameters);

  return {
    update: apply,
    destroy() {
      node.classList.remove("hljs");
      node.textContent = originalText;
    },
  };
}
