// Plain-page entry: highlighting existing markup with no framework.

import { highlight as action } from "./action.js";

/**
 * The `highlight` action, typed as a plain function: `action.d.ts` types it
 * as a Svelte `Action`, whose return value may be `void`.
 * @type {typeof import("./dom.d.ts").highlight}
 */
export const highlight = /** @type {any} */ (action);

const DEFAULT_SELECTOR = 'pre code[class*="language-"]';

/** @typedef {import("./dom.d.ts").HighlightAllOptions} HighlightAllOptions */
/** @typedef {import("./dom.d.ts").HighlightAllResult} HighlightAllResult */

/**
 * Highlights every matching element under `root` in place, loading each
 * `language-xxx` class's grammar. Skips elements that are already
 * highlighted.
 * @param {ParentNode} [root]
 * @param {HighlightAllOptions} [options]
 * @returns {HighlightAllResult}
 */
export function highlightAll(root = document, options = {}) {
  const { selector = DEFAULT_SELECTOR, language } = options;
  /** @type {HTMLElement[]} */
  const elements = [];
  for (const element of root.querySelectorAll(selector)) {
    if (element instanceof HTMLElement && !element.classList.contains("hljs")) {
      elements.push(element);
    }
  }

  /** @type {(() => void)[]} */
  const settlers = [];
  const settled = elements.map(
    (element) =>
      /** @type {Promise<boolean>} */ (
        new Promise((resolve) => {
          /** @param {boolean} ok */
          const settle = (ok) => {
            element.removeEventListener("highlighted", onHighlighted);
            element.removeEventListener("error", onError);
            resolve(ok);
          };
          const onHighlighted = () => settle(true);
          const onError = () => settle(false);
          element.addEventListener("highlighted", onHighlighted);
          element.addEventListener("error", onError);
          settlers.push(() => settle(false));
        })
      ),
  );
  const handles = elements.map((element) =>
    highlight(element, language ? { language } : {}),
  );

  return {
    elements,
    ready: Promise.all(settled).then((results) => ({
      highlighted: results.filter(Boolean).length,
      failed: results.filter((ok) => !ok).length,
    })),
    destroy() {
      for (const handle of handles) handle.destroy();
      for (const settle of settlers) settle();
    },
  };
}
