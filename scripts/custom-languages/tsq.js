/** @param {import("highlight.js").HLJSApi} hljs */
function defineTsq(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // `(node_name` and supertype-qualified `(supertype/subtype`; a lone `_`
  // is the wildcard, not a node name.
  const NODE = {
    begin: [
      /\(/,
      /\s*/,
      /(?!ERROR\b|MISSING\b|_(?!\w))[a-zA-Z_][\w]*(?:\/[a-zA-Z_][\w]*)?/,
    ],
    beginScope: { 3: "title.class" },
    relevance: 0,
  };

  const CAPTURE = {
    className: "variable",
    begin: /@[a-zA-Z_][\w.]*/,
    relevance: 5,
  };

  const PREDICATE = {
    className: "built_in",
    begin: /#[a-zA-Z][\w-]*[?!]?/,
    relevance: 5,
  };

  const FIELD_NAME = {
    className: "attr",
    begin: /[a-zA-Z_][\w]*(?=:)/,
    relevance: 0,
  };

  const NEGATED_FIELD = {
    className: "attr",
    begin: /!\s*[a-zA-Z_][\w]*/,
    relevance: 0,
  };

  const ERROR_MISSING = {
    className: "literal",
    begin: /\b(?:ERROR|MISSING)\b/,
    relevance: 0,
  };

  const WILDCARD = {
    className: "literal",
    begin: /_(?![\w])/,
    relevance: 0,
  };

  // Quantifiers and the `.` anchor. The anchor stands alone, so a `.`
  // inside a dotted directive argument (`injection.language`) is not one.
  const OPERATOR = {
    className: "operator",
    begin: /[?*+]|\.(?!\w)/,
    relevance: 0,
  };

  // Numeric arguments to directives such as `(#offset! @node 0 1 0 -1)`.
  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  return {
    name: "Tree-sitter query",
    aliases: ["tree-sitter-query", "treesitter-query", "query"],
    contains: [
      hljs.COMMENT(/;/, /$/),
      STRING,
      CAPTURE,
      PREDICATE,
      NODE,
      FIELD_NAME,
      NEGATED_FIELD,
      ERROR_MISSING,
      WILDCARD,
      OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineTsq(hljs);
}

export const tsq = { name: "tsq", register };
export default tsq;
