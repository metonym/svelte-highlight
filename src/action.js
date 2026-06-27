import hljs from "highlight.js/lib/core";

/**
 * Svelte action that highlights an element's contents in place using
 * highlight.js. Useful for progressively enhancing existing `<pre><code>`
 * markup (e.g. server-rendered markdown) without swapping in a component.
 *
 * When `code` is omitted, the element's current `textContent` is highlighted.
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
