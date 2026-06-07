import cssRegister from "highlight.js/lib/languages/css";
import javascriptRegister from "highlight.js/lib/languages/javascript";
import typescriptRegister from "highlight.js/lib/languages/typescript";
import html from "./html.js";

const TS_LANG = "(?:ts|typescript)";
const SCRIPT_TS_BEGIN = new RegExp(
  String.raw`<script(?=[^>]*\slang=["']${TS_LANG}["'])[^>]*>`,
  "gm",
);
const SCRIPT_JS_BEGIN = new RegExp(
  String.raw`<script(?![^>]*\slang=["']${TS_LANG}["'])[^>]*>`,
  "gm",
);

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMarko(hljs) {
  const markoControlFlow = {
    begin: /^\s*(?:if|else if|else|for|while)\b/m,
    className: "keyword",
    relevance: 10,
  };

  const markoEventAttribute = {
    begin: /\bon-(?:[\w.-]+|\[[\w.-]+\])(?=[=(\s/>])/,
    className: "variable",
    relevance: 5,
  };

  return {
    name: "Marko",
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      markoControlFlow,
      markoEventAttribute,
      {
        begin: SCRIPT_TS_BEGIN,
        end: /<\/script>/gm,
        subLanguage: "typescript",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: SCRIPT_JS_BEGIN,
        end: /<\/script>/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /^(\s*)(<style[^>]*>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /\$\{/,
        end: /\}/,
        subLanguage: "javascript",
        relevance: 10,
      },
      {
        begin: /^class\s*\{/m,
        end: /^\}/m,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
        relevance: 100,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("typescript", typescriptRegister);
  hljs.registerLanguage("javascript", javascriptRegister);
  hljs.registerLanguage("css", cssRegister);
  return defineMarko(hljs);
}

export const marko = { name: "marko", register };
export default marko;
