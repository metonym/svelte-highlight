import { loadLanguage } from "./load-language.js";
import { ensureRegistered, registry } from "./registry.js";

const LANGUAGE_CLASS = /(?:^|\s)language-([\w#+-]+)(?:\s|$)/;

/**
 * Highlight an element in place with highlight.js.
 * Omits `code` to highlight existing `textContent`.
 *
 * Omits `language` to resolve it from a `class="language-xxx"` token on the
 * node itself (the Prism/highlight.js Markdown convention), loaded via
 * `loadLanguage`. No matching class dispatches `error` and leaves the
 * content untouched.
 *
 * Dispatches `highlighted` ({ html, language }) on the node after a
 * successful highlight, and `error` ({ error }) after a failed one.
 *
 * @param {HTMLElement} node
 * @param {{ language?: import("./languages").LanguageType<string>; code?: string }} [parameters]
 * @returns {ReturnType<import("svelte/action").Action<HTMLElement, { language?: import("./languages").LanguageType<string>; code?: string }>>}
 */
export function highlight(node, parameters = {}) {
  // Snapshot the pre-action source once: updates that omit `code` fall back
  // to this instead of `node.textContent`, which after the first highlight
  // pass holds the already-highlighted (and DOM-normalized) output.
  const originalText = node.textContent ?? "";

  // Guards a `loadLanguage` continuation from applying stale results if a
  // newer `apply()` call (from `update` or a fresh `destroy`) has since
  // superseded it.
  let generation = 0;
  let destroyed = false;

  /**
   * @param {import("./languages").LanguageType<string>} language
   * @param {string | undefined} code
   * @param {number} gen
   */
  function highlightWith(language, code, gen) {
    if (destroyed || gen !== generation) {
      return;
    }

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

  /** @param {{ language?: import("./languages").LanguageType<string>; code?: string }} params */
  function apply({ language, code } = {}) {
    generation += 1;
    const gen = generation;

    if (language) {
      highlightWith(language, code, gen);
      return;
    }

    const match = node.getAttribute("class")?.match(LANGUAGE_CLASS);

    if (!match) {
      const error = new Error(
        'no "language" parameter and no "language-xxx" class found',
      );
      if (import.meta.env?.DEV) {
        console.warn(`[svelte-highlight] ${error.message}.`);
      }
      queueMicrotask(() =>
        node.dispatchEvent(new CustomEvent("error", { detail: { error } })),
      );
      return;
    }

    const name = /** @type {string} */ (match[1]);

    loadLanguage(/** @type {import("./languages").LanguageName} */ (name)).then(
      (language) => highlightWith(language, code, gen),
      (error) => {
        if (destroyed || gen !== generation) {
          return;
        }
        if (import.meta.env?.DEV) {
          console.warn(
            `[svelte-highlight] failed to load language "${name}" from class="language-${name}"; leaving content unchanged.`,
            error,
          );
        }
        queueMicrotask(() =>
          node.dispatchEvent(new CustomEvent("error", { detail: { error } })),
        );
      },
    );
  }

  apply(parameters);

  return {
    update: apply,
    destroy() {
      destroyed = true;
      node.classList.remove("hljs");
      node.textContent = originalText;
    },
  };
}
