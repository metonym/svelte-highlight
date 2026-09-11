const SLINT_KEYWORDS = [
  "export",
  "component",
  "inherits",
  "import",
  "from",
  "global",
  "struct",
  "enum",
  "property",
  "callback",
  "in-out|5",
  "in",
  "out",
  "private",
  "pure",
  "function",
  "if",
  "else",
  "for",
  "animate",
  "states",
  "transitions",
  "when",
];

const SLINT_LITERALS = "root self parent true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSlint(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /\\\{/,
    end: /\}/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    // Interpolation (`\{expr}`) must precede BACKSLASH_ESCAPE, which would
    // otherwise consume `\{` as a single escaped character.
    contains: [INTERPOLATION, hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?(?:px|phx|ms|s|deg|%)?\b/,
    relevance: 0,
  };

  // Bare hex colors are common far outside Slint (CSS, HTML, config
  // formats); a high relevance here let auto-detect misclassify ordinary
  // CSS ("body { background: #000; }") as Slint on this token alone.
  const COLOR = {
    className: "number",
    begin: /#[0-9a-fA-F]{3,8}\b/,
    relevance: 0,
  };

  const TWO_WAY_BINDING = {
    className: "operator",
    begin: /<=>/,
    relevance: 5,
  };

  const NAMING_OP = {
    className: "operator",
    begin: /:=/,
    relevance: 0,
  };

  const META_CALL = {
    className: "meta",
    begin: /@(?:image-url|tr)\(/,
    end: /\)/,
    contains: [STRING],
    relevance: 5,
  };

  // Element instantiation: `Name := Element {` or bare `Element {`.
  const ELEMENT_NAME = {
    className: "title.class",
    begin: /\b[A-Z]\w*(?=\s*(?::=|\{))/,
    relevance: 0,
  };

  const PROPERTY_ASSIGNMENT = {
    className: "attr",
    begin: /\b[a-z][\w-]*(?=\s*:(?!=))/,
    relevance: 0,
  };

  return {
    name: "Slint",
    aliases: ["slint"],
    keywords: {
      // Hyphenated modifiers (`in-out`) and easing names (`ease-in-out`)
      // must tokenize as one word so `in`/`out` don't fire inside the latter.
      $pattern: "[a-zA-Z][\\w-]*",
      keyword: SLINT_KEYWORDS,
      literal: SLINT_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      META_CALL,
      TWO_WAY_BINDING,
      NAMING_OP,
      COLOR,
      NUMBER,
      ELEMENT_NAME,
      PROPERTY_ASSIGNMENT,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSlint(hljs);
}

export const slint = { name: "slint", register };
export default slint;
