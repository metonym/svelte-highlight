import { ensureRegistered, registry } from "./registry.js";

/**
 * Highlight an element in place with highlight.js.
 * Omits `code` to highlight existing `textContent`.
 *
 * Dispatches `highlighted` ({ html, language }) on the node after a
 * successful highlight, and `error` ({ error }) after a failed one.
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
      // Deferred: Svelte wraps `on:` listeners on this node in an effect
      // that flushes after this action's own (synchronous) mount/update
      // runs, so dispatching synchronously here would fire before a
      // listener declared via `on:error` is attached.
      queueMicrotask(() =>
        node.dispatchEvent(new CustomEvent("error", { detail: { error } })),
      );
      return;
    }

    node.innerHTML = value;
    node.classList.add("hljs");
    // See the `error` dispatch above for why this is deferred.
    queueMicrotask(() =>
      node.dispatchEvent(
        new CustomEvent("highlighted", {
          detail: { html: value, language: language.name },
        }),
      ),
    );
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
