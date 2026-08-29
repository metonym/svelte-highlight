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

  const NEGATION = {
    className: "keyword",
    begin: /!|\bnot\b/,
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
    begin: /\b\d+(?:\.\d+)?\b/,
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
      DIRECTIVE,
      RULE_OPERATOR,
      QUERY_OPERATOR,
      NEGATION,
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
