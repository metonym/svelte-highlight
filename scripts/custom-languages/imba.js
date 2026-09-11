import cssRegister from "highlight.js/lib/languages/css";
import javascriptRegister from "highlight.js/lib/languages/javascript";

const IMBA_KEYWORDS =
  "def tag prop attr get set let const if elif else unless for of in do self " +
  "import export from class extend global declare rescue return switch while until " +
  "try catch finally throw break continue static async await super new is and " +
  "or not";

const IMBA_LITERALS = "yes no true false null undefined";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineImba(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    subLanguage: "javascript",
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
  };

  const TAG_CLASS = {
    className: "selector-class",
    begin: /\.[A-Za-z_-][\w-]*/,
    relevance: 0,
  };

  const TAG_ID = {
    className: "selector-id",
    begin: /#[A-Za-z_-][\w-]*/,
    relevance: 0,
  };

  const TAG_EVENT = {
    className: "attr",
    begin: /@[A-Za-z_][\w-]*/,
    relevance: 5,
  };

  const TAG_REF = {
    className: "variable",
    begin: /\$[A-Za-z_][\w-]*/,
    relevance: 0,
  };

  const TAG_ATTR = {
    className: "attr",
    begin: /\[[A-Za-z_-][\w-]*/,
    end: /\]/,
    contains: [STRING],
    relevance: 0,
  };

  // Inline DOM tag literal, e.g. `<div.card>` or `<self>`.
  const TAG_LITERAL = {
    className: "tag",
    begin: /<(?:self\b|[A-Za-z][\w-]*)/,
    end: />/,
    relevance: 10,
    contains: [TAG_CLASS, TAG_ID, TAG_EVENT, TAG_REF, TAG_ATTR, STRING],
  };

  // `css` / `global css` open an indented style block. Ending at `/^(?=\S)/`
  // never closed a nested block (`tag Card` / `css .card` / `def render`),
  // so the CSS sublanguage ran to the next column-0 line and unstyled the
  // rest of the tag. Stop at the next Imba declaration or tag literal
  // instead, and don't open on `css = x`.
  const CSS_BLOCK = {
    className: "keyword",
    begin: /\bcss\b(?!\s*=)/,
    starts: {
      end: /^(?=\s*(?:def|tag|prop|attr|get|set|let|const|class|extend|export|import|css|global|declare|if|elif|else|unless|for|switch|try|catch|finally|while|until)\b|\s*<)/,
      subLanguage: "css",
    },
  };

  return {
    name: "Imba",
    aliases: ["imba"],
    keywords: {
      keyword: IMBA_KEYWORDS,
      literal: IMBA_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      CSS_BLOCK,
      TAG_LITERAL,
      STRING,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("css", cssRegister);
  hljs.registerLanguage("javascript", javascriptRegister);
  return defineImba(hljs);
}

export const imba = { name: "imba", register };
export default imba;
