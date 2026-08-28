const RACKET_KEYWORDS =
  "define define/contract define-syntax syntax-rules lambda let let* letrec letrec* if cond case when unless begin begin0 set! and or not quote quasiquote unquote unquote-splicing require provide module module+ struct match for for/list for/vector for/fold for/sum class new send with-handlers parameterize call/cc call-with-values dynamic-wind delay force";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRacket(hljs) {
  const LANG_LINE = {
    className: "meta",
    begin: /^#lang\s+\S+/,
    relevance: 10,
  };

  // `#| |#` block comments nest via "self" - hljs.COMMENT alone does not
  // nest.
  const NESTED_COMMENT = {
    className: "comment",
    begin: /#\|/,
    end: /\|#/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const DATUM_COMMENT = {
    className: "comment",
    begin: /#;/,
    relevance: 0,
  };

  const BOOLEAN = {
    className: "literal",
    begin: /#(?:true|false|[tf])\b/,
    relevance: 0,
  };

  const CHAR = {
    className: "string",
    begin: /#\\(?:[a-zA-Z][a-zA-Z0-9-]*|.)/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /#[xX][0-9a-fA-F]+/ },
      { begin: /#[oO][0-7]+/ },
      { begin: /#[bB][01]+/ },
      { begin: /\b\d+\/\d+\b/ },
      { begin: /[+-]?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  return {
    name: "Racket",
    aliases: ["racket", "rkt"],
    keywords: {
      // Racket identifiers routinely include `/`, `!`, `?`, `*`, `-`
      // (`define/contract`, `set!`, `call/cc`) - anything not whitespace or
      // a delimiter is a candidate identifier.
      $pattern: "[^\\s()\\[\\]{}\"'`,;#]+",
      keyword: RACKET_KEYWORDS,
    },
    contains: [
      LANG_LINE,
      hljs.COMMENT(/;/, /$/),
      NESTED_COMMENT,
      DATUM_COMMENT,
      BOOLEAN,
      CHAR,
      STRING,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRacket(hljs);
}

export const racket = { name: "racket", register };
export default racket;
