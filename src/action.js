import hljs from "highlight.js/lib/core";

/**
 * Highlight an element in place with highlight.js.
 * Omits `code` to highlight existing `textContent`.
 *
 * @type {import("svelte/action").Action<HTMLElement, { language: import("./languages").LanguageType<string>; code?: string }>}
 */
export function highlight(node, parameters) {
  /** @param {{ language: import("./languages").LanguageType<string>; code?: string }} params */
  function apply({ language, code }) {
    if (!hljs.getLanguage(language.name)) {
      hljs.registerLanguage(language.name, language.register);
    }
    const source = code ?? node.textContent ?? "";
    node.innerHTML = hljs.highlight(source, { language: language.name }).value;
    node.classList.add("hljs");
  }

  apply(parameters);

  return {
    update: apply,
  };
}
