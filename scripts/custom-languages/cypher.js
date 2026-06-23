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
      LABEL,
      PARAMETER,
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
