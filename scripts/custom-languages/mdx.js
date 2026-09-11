import cssRegister from "highlight.js/lib/languages/css";
import javascriptRegister from "highlight.js/lib/languages/javascript";
import typescriptRegister from "highlight.js/lib/languages/typescript";
import yamlRegister from "highlight.js/lib/languages/yaml";
import html from "./html.js";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMdx(hljs) {
  return {
    name: "MDX",
    aliases: ["mdx"],
    contains: [
      {
        // YAML frontmatter (remark-frontmatter), only at the very start of
        // the document. Same shape as astro's frontmatter: `returnEnd` hands
        // the closing fence to the sibling "meta" rule below.
        begin: /^---[ \t]*\n/,
        end: /^---[ \t]*$/m,
        subLanguage: "yaml",
        beginScope: "meta",
        returnEnd: true,
        relevance: 50,
        /** @type {import("highlight.js").ModeCallback} */
        "on:begin": (match, response) => {
          if (match.index !== 0) {
            response.ignoreMatch();
          }
        },
      },
      {
        begin: /^---[ \t]*$/m,
        className: "meta",
        relevance: 0,
      },
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      {
        // ESM import/export statements often omit the trailing semicolon
        // (ASI). Close on a semicolon at EOL, or on an EOL that isn't a JS
        // continuation (`{`, `,`, `(`, `[`, `\`, `.`). Use `[ \t]` rather
        // than `\s` so a streaming batch that ends on the next blank line
        // cannot let `$` eat that newline (`\s` includes `\n`).
        begin: /^(?:import|export)\b/m,
        end: /;[ \t]*$|[^ \t,{([\\.\n][ \t]*$/m,
        subLanguage: "javascript",
        relevance: 100,
      },
      {
        begin: /^(\s*)```(javascript|js|jsx)\s*$/m,
        end: /^(\s*)```\s*$/m,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: "javascript",
        relevance: 10,
      },
      {
        begin: /^(\s*)```(typescript|ts|tsx)\s*$/m,
        end: /^(\s*)```\s*$/m,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: "typescript",
        relevance: 10,
      },
      {
        begin: /^(\s*)```(css)\s*$/m,
        end: /^(\s*)```\s*$/m,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: "css",
        relevance: 10,
      },
      {
        begin: /^(\s*)```(html)\s*$/m,
        end: /^(\s*)```\s*$/m,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: "html",
        relevance: 10,
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
        // A `{...}` attribute expression containing a bare `>` (e.g. a JS
        // comparison, `highlight={value > threshold}`) would otherwise
        // match `end` first, closing the tag mid-attribute. Only intervene
        // for that specific case (matching the whole `{...}` in one shot,
        // no separate `end`) -- the common case (`data={data}`, no `>`
        // inside) needs no special handling and keeps its normal
        // continuous HTML styling untouched.
        begin: /<(?=[A-Za-z/!])/,
        end: />|\/>/,
        subLanguage: "html",
        contains: [{ begin: /\{[^{}]*>[^{}]*\}/, subLanguage: "html" }],
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
  hljs.registerLanguage("typescript", typescriptRegister);
  hljs.registerLanguage("css", cssRegister);
  hljs.registerLanguage("yaml", yamlRegister);
  return defineMdx(hljs);
}

export const mdx = { name: "mdx", register };
export default mdx;
