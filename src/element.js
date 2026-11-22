// `<shl-code>`: a custom element that highlights its code, for plain pages
// and other frameworks.

import { loadLanguage } from "./load-language.js";
import { ensureRegistered, registry } from "./registry.js";

/**
 * Text the element was written with, minus the line break after the
 * opening tag and the indentation line before the closing one.
 * @param {string} text
 */
function authoredCode(text) {
  return text.replace(LEADING_NEWLINE, "").replace(TRAILING_BLANK_LINE, "");
}

const LEADING_NEWLINE = /^\r?\n/;
const TRAILING_BLANK_LINE = /\r?\n[ \t]*$/;

/**
 * Defines `<shl-code>` (or `name`), once. Call it in the browser, before or
 * after the elements are parsed.
 * @param {string} [name]
 * @returns {CustomElementConstructor}
 */
export function defineHighlightElement(name = "shl-code") {
  const existing = customElements.get(name);
  if (existing) return existing;

  class HighlightElement extends HTMLElement {
    static observedAttributes = ["language"];

    /** @type {string | undefined} */
    #code;
    /** @type {HTMLElement | undefined} */
    #codeElement;
    #generation = 0;

    /** The code to highlight. Defaults to the element's text. */
    get code() {
      return this.#code ?? authoredCode(this.textContent ?? "");
    }

    set code(value) {
      this.#code = String(value ?? "");
      this.#render();
    }

    /** The language name, as in `language-xxx` classes. */
    get language() {
      return this.getAttribute("language") ?? "";
    }

    set language(value) {
      this.setAttribute("language", value);
    }

    connectedCallback() {
      this.#render();
    }

    attributeChangedCallback() {
      this.#render();
    }

    #render() {
      if (!this.isConnected) return;
      if (
        this.#codeElement === undefined &&
        this.#code === undefined &&
        document.readyState === "loading"
      ) {
        // Defined before the parser reached this element's text: wait for
        // it, or the text would be read as empty.
        document.addEventListener("DOMContentLoaded", () => this.#render(), {
          once: true,
        });
        return;
      }
      if (this.#codeElement === undefined) {
        this.#code ??= authoredCode(this.textContent ?? "");
        const pre = document.createElement("pre");
        this.#codeElement = document.createElement("code");
        pre.append(this.#codeElement);
        this.replaceChildren(pre);
      }
      const code = /** @type {HTMLElement} */ (this.#codeElement);
      const source = this.code;
      const name = this.language;
      const generation = ++this.#generation;

      code.className = name ? `language-${name}` : "";
      code.textContent = source;
      if (!name) return;

      loadLanguage(/** @type {import("./languages").LanguageName} */ (name))
        .then((language) => {
          if (generation !== this.#generation) return;
          ensureRegistered(language);
          const { value } = registry.highlight(source, {
            language: language.name,
          });
          code.innerHTML = value;
          code.classList.add("hljs");
          this.dispatchEvent(
            new CustomEvent("highlighted", {
              detail: { html: value, language: language.name },
            }),
          );
        })
        .catch((error) => {
          if (generation !== this.#generation) return;
          this.dispatchEvent(new CustomEvent("error", { detail: { error } }));
        });
    }
  }

  customElements.define(name, HighlightElement);
  return HighlightElement;
}
