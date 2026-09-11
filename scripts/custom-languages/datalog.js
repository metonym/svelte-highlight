/** @param {import("highlight.js").HLJSApi} hljs */
function defineDatalog(hljs) {
  // Souffle-style directives: .decl, .input, .output, .type, .functor
  const DIRECTIVE = {
    className: "meta",
    begin: /^\s*\.[a-z_]+\b/,
    relevance: 10,
  };

  const RULE_OPERATOR = {
    className: "operator",
    begin: /:-/,
    relevance: 10,
  };

  const QUERY_OPERATOR = {
    className: "operator",
    begin: /\?-/,
    relevance: 10,
  };

  // `!path(x, y)` and `not q(Y)`; the lookahead keeps `!=` a comparison.
  const NEGATION = {
    className: "keyword",
    begin: /!(?!=)|\bnot\b/,
    relevance: 0,
  };

  // Soufflé aggregates: `n = count : { edge(x, _) }`, `s = sum w : { ... }`.
  // Only the head position is styled so `count(x, n)` stays a predicate.
  const AGGREGATE = {
    className: "built_in",
    begin: /\b(?:count|sum|min|max|mean)\b(?=\s*(?::|[a-z_]\w*\s*:))/,
    relevance: 0,
  };

  // Soufflé runs the C preprocessor over its input.
  const PREPROCESSOR = {
    className: "meta",
    begin:
      /^\s*#(?:include|define|undef|ifdef|ifndef|if|elif|else|endif|line|pragma)\b/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // Decimal, float with exponent, and Soufflé's `0x`/`0b` integer forms.
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b0[bB][01]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  // Datalog variables are capitalized by convention, same as Prolog.
  const VARIABLE = {
    className: "variable",
    begin: /\b[A-Z][A-Za-z0-9_]*\b/,
    relevance: 0,
  };

  // A lowercase identifier immediately followed by `(` is a predicate/atom
  // name: edge(x, y).
  const PREDICATE = {
    className: "title.function",
    begin: /\b[a-z][A-Za-z0-9_]*(?=\()/,
    relevance: 0,
  };

  return {
    name: "Datalog",
    aliases: ["datalog", "dl"],
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      // `%` is the line comment of Prolog-derived dialects (DLV, XSB,
      // clingo); before this its capitalised words were styled as variables.
      hljs.COMMENT(/%/, /$/),
      PREPROCESSOR,
      DIRECTIVE,
      RULE_OPERATOR,
      QUERY_OPERATOR,
      NEGATION,
      AGGREGATE,
      STRING,
      PREDICATE,
      VARIABLE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineDatalog(hljs);
}

export const datalog = { name: "datalog", register };
export default datalog;
