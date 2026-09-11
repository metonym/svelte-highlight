// Clause keywords through Neo4j 5.x / Cypher 25: `USE` (4.0), `IN
// TRANSACTIONS` (4.4), `INSERT`/`NODETACH` (5.x GQL conformance), `FINISH`
// (5.20), `LET`/`FILTER`/`NEXT` (Cypher 25), `SHORTEST` path selectors,
// `CREATE INDEX ... FOR`, `LOAD CSV WITH HEADERS`, and the `CYPHER` query
// option prefix.
const CYPHER_KEYWORDS =
  "MATCH OPTIONAL WHERE RETURN WITH CREATE MERGE DELETE DETACH SET REMOVE ORDER BY SKIP LIMIT UNION UNWIND CALL YIELD FOREACH USING INDEX CONSTRAINT ON DROP LOAD CSV FROM AS DISTINCT ASC DESC ASCENDING DESCENDING CASE WHEN THEN ELSE END " +
  "USE SHOW INSERT NODETACH FINISH LET FILTER NEXT ALL SHORTEST FOR HEADERS TRANSACTIONS CYPHER";

const CYPHER_OPERATORS = "AND OR XOR NOT IN STARTS ENDS CONTAINS IS";

const CYPHER_LITERALS = "true false null TRUE FALSE NULL";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCypher(hljs) {
  // Decimal, plus the `0x` hex and `0o` octal forms (Cypher 4.x+).
  const NUMBER = {
    className: "number",
    begin: /\b(?:0x[0-9a-fA-F]+|0o[0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/,
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
      /\b(?:id|labels|type|properties|coalesce|toInteger|toString|size|collect|nodes|relationships|exists|count|all|any|none|single)(?=\s*\()/,
    relevance: 0,
  };

  // `EXISTS { ... }`, `COUNT { ... }`, `COLLECT { ... }` subquery
  // expressions (Neo4j 5.x). The brace lookahead is what separates the
  // clause-like use from the `count(...)` function (FUNCTION above) and
  // from `count` used as a plain variable name (`WITH count(n) AS count`).
  const SUBQUERY_EXPRESSION = {
    className: "keyword",
    begin: /\b(?:exists|count|collect)(?=\s*\{)/,
    relevance: 0,
  };

  // `n.prop` property access: consumed so a property that shares a keyword
  // or operator name (`n.desc`, `n.limit`, `n.in`) isn't styled as one.
  const PROPERTY = {
    begin: /\.[A-Za-z_]\w*/,
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
  //
  // The lookahead requires a map's real shape: `{}` or a (possibly
  // backtick-quoted) key followed by `:`. Without it the mode also opened on
  // the `{` of `CALL { ... }` / `CALL (x) { ... }` / `EXISTS { ... }`
  // subqueries and quantifiers like `{1,3}`, so an entire subquery body was
  // scanned as map content and lost its keywords, labels, and functions.
  const MAP_LITERAL = {
    begin: /\{(?=\s*(?:\}|(?:[A-Za-z_]\w*|`[^`]*`)\s*:))/,
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
      SUBQUERY_EXPRESSION,
      PROPERTY,
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
