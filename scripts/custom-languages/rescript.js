import javascriptRegister from "highlight.js/lib/languages/javascript";

const RESCRIPT_KEYWORDS =
  "and as assert async await catch constraint downto else exception external false for if in include lazy let module mutable of open private rec switch then to true try type when while with";

const RESCRIPT_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineReScript(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { begin: /\b0[oO][0-7][0-7_]*\b/ },
      { begin: /\b0[bB][01][01_]*\b/ },
      { begin: /\b\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const POLY_VARIANT = {
    className: "symbol",
    begin: /#[A-Za-z_]\w*/,
    relevance: 0,
  };

  const CONSTRUCTOR = {
    className: "type",
    begin: /\b[A-Z]\w*/,
    relevance: 0,
  };

  const FUNCTION = {
    variants: [
      {
        begin: [/\blet\b/, /\s+(?:rec\s+)?/, /[a-z_]\w*/, /\s*=\s*/, /\(/],
        beginScope: { 1: "keyword", 3: "title.function" },
      },
      {
        begin: [
          /\blet\b/,
          /\s+(?:rec\s+)?/,
          /[a-z_]\w*/,
          /\s*=\s*/,
          /[a-z_]\w*/,
          /\s*=>/,
        ],
        beginScope: { 1: "keyword", 3: "title.function" },
      },
    ],
  };

  const DECORATOR = {
    className: "meta",
    begin: /@@?[a-zA-Z_][\w.]*/,
    relevance: 0,
  };

  // JSX expression braces, e.g. `{text}` or `{someFn(x)}`. Embeds JavaScript
  // for the expression body.
  const JSX_EXPRESSION = {
    begin: /\{/,
    end: /\}/,
    subLanguage: "javascript",
    relevance: 0,
  };

  const JSX_ATTR_STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const JSX_ATTR_NAME = {
    className: "attr",
    begin: /[a-zA-Z_][\w-]*(?=\s*=)/,
    relevance: 0,
  };

  const JSX_ATTRS = {
    endsWithParent: true,
    relevance: 0,
    contains: [JSX_ATTR_NAME, JSX_ATTR_STRING, JSX_EXPRESSION],
  };

  const JSX_TAG = {
    className: "tag",
    // `</` unambiguously starts a JSX closing tag. A bare `<` immediately
    // preceded by a word character (e.g. `array<int>`, `option<string>`,
    // `text<div>`) is generic-type application syntax instead, so that case
    // is excluded with a negative lookbehind.
    begin: /<\/(?=[A-Za-z])|(?<![\w])<(?=[A-Za-z])/,
    end: /\/?>/,
    relevance: 0,
    contains: [
      {
        className: "name",
        begin: /[A-Za-z][\w.-]*/,
        relevance: 0,
        starts: JSX_ATTRS,
      },
    ],
  };

  return {
    name: "ReScript",
    aliases: ["rescript", "res"],
    keywords: { keyword: RESCRIPT_KEYWORDS, literal: RESCRIPT_LITERALS },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: "string",
        begin: /`/,
        end: /`/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      DECORATOR,
      POLY_VARIANT,
      FUNCTION,
      JSX_TAG,
      JSX_EXPRESSION,
      CONSTRUCTOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("javascript", javascriptRegister);
  return defineReScript(hljs);
}

export const rescript = { name: "rescript", register };
export default rescript;
