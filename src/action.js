import { loadLanguage } from "./load-language.js";
import { ensureRegistered, registry } from "./registry.js";

const LANGUAGE_CLASS = /(?:^|\s)language-([\w#+-]+)(?:\s|$)/;

/**
 * @param {HTMLElement} node
 * @param {{ language?: import("./languages").LanguageType<string>; code?: string }} [parameters]
 * @returns {ReturnType<import("svelte/action").Action<HTMLElement, { language?: import("./languages").LanguageType<string>; code?: string }>>}
 */
export function highlight(node, parameters = {}) {
  // Snapshot: after the first pass `textContent` is the highlighted output.
  const originalText = node.textContent ?? "";

  // Discards stale `loadLanguage` results.
  let generation = 0;
  let destroyed = false;

  /**
   * Deferred: Svelte attaches `on:` listeners after the action's synchronous mount.
   * @param {"highlighted" | "error"} type
   * @param {unknown} detail
   */
  function dispatch(type, detail) {
    queueMicrotask(() => node.dispatchEvent(new CustomEvent(type, { detail })));
  }

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
      dispatch("error", { error });
      return;
    }

    node.innerHTML = value;
    node.classList.add("hljs");
    dispatch("highlighted", { html: value, language: language.name });
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
      dispatch("error", { error });
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
        dispatch("error", { error });
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
