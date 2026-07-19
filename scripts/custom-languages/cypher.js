const CYPHER_KEYWORDS =
  "MATCH OPTIONAL WHERE RETURN WITH CREATE MERGE DELETE DETACH SET REMOVE ORDER BY SKIP LIMIT UNION UNWIND CALL YIELD FOREACH USING INDEX CONSTRAINT ON DROP LOAD CSV FROM AS DISTINCT ASC DESC ASCENDING DESCENDING CASE WHEN THEN ELSE END";

const CYPHER_OPERATORS = "AND OR XOR NOT IN STARTS ENDS CONTAINS IS";

const CYPHER_LITERALS = "true false null TRUE FALSE NULL";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCypher(hljs) {
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /`/, end: /`/ },
    ],
  };

  const LABEL = {
    className: "type",
    begin: /:[A-Za-z_]\w*/,
    relevance: 0,
  };

  const PARAMETER = {
    className: "variable",
    begin: /\$[A-Za-z_]\w*/,
  };

  const FUNCTION = {
    className: "built_in",
    begin:
      /\b(?:id|labels|type|properties|coalesce|toInteger|toString|size|collect|nodes|relationships|exists|count)(?=\s*\()/,
    relevance: 0,
  };

  const MAP_KEY = {
    className: "attr",
    begin: /[A-Za-z_]\w*(?=\s*:)/,
    relevance: 0,
  };

  // A map literal's `{key: value}` syntax collides with LABEL's bare
  // `:identifier` pattern whenever a value is itself an identifier
  // expression, e.g. `{name: n.name}` -- `:n` would otherwise be
  // misdetected as a node label. Give map-literal content its own scope
  // (keyed by MAP_KEY, not LABEL) so `(n:Person:Employee)`-style label
  // chains elsewhere are unaffected.
  const MAP_LITERAL = {
    begin: /\{/,
    end: /\}/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      MAP_KEY,
      STRING,
      PARAMETER,
      FUNCTION,
      NUMBER,
      "self",
    ]),
    relevance: 0,
  };

  return {
    name: "Cypher",
    aliases: ["cypher"],
    case_insensitive: true,
    keywords: {
      keyword: CYPHER_KEYWORDS,
      operator: CYPHER_OPERATORS,
      literal: CYPHER_LITERALS,
    },
    contains: [
      hljs.COMMENT(/\/\//, /$/),
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      MAP_LITERAL,
      LABEL,
      PARAMETER,
      FUNCTION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCypher(hljs);
}

export const cypher = { name: "cypher", register };
export default cypher;
