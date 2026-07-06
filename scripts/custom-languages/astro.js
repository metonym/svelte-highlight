import cssRegister from "highlight.js/lib/languages/css";
import javascriptRegister from "highlight.js/lib/languages/javascript";
import typescriptRegister from "highlight.js/lib/languages/typescript";
import html from "./html.js";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineAstro(hljs) {
  return {
    name: "Astro",
    subLanguage: "html",
    contains: [
      {
        begin: /^---\s*\n/,
        end: /^---\s*$|^\.\.\.\s*$/m,
        subLanguage: "typescript",
        excludeBegin: true,
        excludeEnd: true,
        relevance: 100,
        /** @type {import("highlight.js").ModeCallback} */
        "on:begin": (match, response) => {
          if (match.index !== 0) {
            response.ignoreMatch();
          }
        },
      },
      {
        begin: /^---\s*$/m,
        className: "meta",
        relevance: 50,
      },
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      {
        begin: /^(\s*)(<style[^>]*>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
        relevance: 100,
      },
      {
        begin: /\{/,
        end: /\}/,
        contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
          "self",
        ]),
        subLanguage: "javascript",
        relevance: 10,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("typescript", typescriptRegister);
  hljs.registerLanguage("css", cssRegister);
  hljs.registerLanguage("javascript", javascriptRegister);
  return defineAstro(hljs);
}

export const astro = { name: "astro", register };
export default astro;
