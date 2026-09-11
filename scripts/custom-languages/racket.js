const RACKET_KEYWORDS =
  "define define/contract define-syntax syntax-rules lambda let let* letrec letrec* if cond case when unless begin begin0 set! and or not quote quasiquote unquote unquote-splicing require provide module module+ struct match for for/list for/vector for/fold for/sum class new send with-handlers parameterize call/cc call-with-values dynamic-wind delay force " +
  // Definition and binding forms, `else`, the rest of the `for` family, the
  // `match`/`syntax` macro forms, and the `class` body forms.
  "define-values define-syntax-rule define-syntaxes define-for-syntax begin-for-syntax case-lambda λ else let-values let*-values letrec-values let-syntax letrec-syntax do local " +
  "for* for/and for/or for/first for/last for/hash for/string for*/list for*/vector for*/fold for*/sum for*/and for*/or " +
  "match* match-define match-let match-lambda syntax syntax-case syntax-parse quasisyntax with-syntax define-syntax-parser " +
  "module* define/public define/override define/private super-new init init-field field inherit interface this";

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

  // Plain, byte (`#"..."`), and regexp (`#rx"..."`, `#px#"..."`) strings.
  const STRING = {
    className: "string",
    begin: /(?:#[rp]x#?|#)?"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /#[xX][0-9a-fA-F]+/ },
      { begin: /#[oO][0-7]+/ },
      { begin: /#[bB][01]+/ },
      // `+inf.0`, `-nan.0`, `+inf.f`
      { begin: /[+-](?:inf|nan)\.[0f]/ },
      // `3+4i`, `1.5-2i`
      { begin: /[+-]?\b\d+(?:\.\d+)?[+-]\d*(?:\.\d+)?i\b/ },
      { begin: /\b\d+\/\d+\b/ },
      { begin: /[+-]?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  // `#:when`, `#:transparent` keyword arguments and `'sym` quoted symbols.
  const SYMBOL = {
    className: "symbol",
    variants: [
      { begin: /#:[^\s()[\]{}"'`,;]+/ },
      { begin: /'[^\s()[\]{}"'`,;#]+/ },
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
      SYMBOL,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRacket(hljs);
}

export const racket = { name: "racket", register };
export default racket;
