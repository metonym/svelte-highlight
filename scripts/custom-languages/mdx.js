import cssRegister from "highlight.js/lib/languages/css";
import javascriptRegister from "highlight.js/lib/languages/javascript";
import html from "./html.js";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMdx(hljs) {
  return {
    name: "MDX",
    aliases: ["mdx"],
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      {
        begin: /^(?:import|export)\b/m,
        end: /;?\s*$/m,
        subLanguage: "javascript",
        relevance: 100,
      },
      {
        begin: /^(\s*)(```)([\s\S]*?)(```)/m,
        beginScope: { 2: "string", 3: "code" },
        relevance: 10,
      },
      {
        begin: /^(\s*)(<style[^>]*>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
        relevance: 100,
      },
      {
        begin: /^(\s*)(<script[^>]*>)/gm,
        end: /^(\s*)(<\/script>)/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
        relevance: 100,
      },
      {
        begin: /<(?=[A-Za-z/!])/,
        end: />|\/>/,
        subLanguage: "html",
        relevance: 10,
      },
      {
        begin: /\{/,
        end: /\}/,
        subLanguage: "javascript",
        contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
          "self",
        ]),
        relevance: 10,
      },
      {
        begin: /^#{1,6}\s+/m,
        className: "section",
        relevance: 10,
      },
      {
        begin: /^\s*[-*+]\s+/m,
        className: "bullet",
        relevance: 5,
      },
      {
        begin: /^\s*\d+\.\s+/m,
        className: "number",
        relevance: 5,
      },
      {
        begin: /`[^`\n]+`/,
        className: "string",
        relevance: 5,
      },
      {
        begin: /\*\*[^*\n]+\*\*/,
        className: "strong",
        relevance: 5,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("javascript", javascriptRegister);
  hljs.registerLanguage("css", cssRegister);
  return defineMdx(hljs);
}

export const mdx = { name: "mdx", register };
export default mdx;
