const ESQL_KEYWORDS =
  "FROM WHERE EVAL STATS KEEP DROP RENAME SORT LIMIT DISSECT GROK ENRICH " +
  "MV_EXPAND LOOKUP JOIN ON BY AS DESC ASC AND OR NOT IN LIKE RLIKE IS " +
  "NULL WITH METADATA";

const ESQL_FUNCTIONS =
  "COUNT COUNT_DISTINCT AVG SUM MIN MAX MEDIAN QSTR DATE_TRUNC DATE_PARSE " +
  "DATE_FORMAT DATE_DIFF NOW TO_STRING TO_INTEGER TO_LONG TO_DOUBLE " +
  "TO_BOOLEAN TO_DATETIME COALESCE CASE CONCAT SUBSTRING REPLACE TRIM " +
  "TO_LOWER TO_UPPER STARTS_WITH ENDS_WITH LENGTH ROUND FLOOR CEIL ABS " +
  "MV_CONCAT MV_COUNT MV_AVG ROUND_TO";

const ESQL_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineEsql(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [{ begin: /""/, relevance: 0 }, hljs.BACKSLASH_ESCAPE],
  };

  const COMMENT = {
    className: "comment",
    variants: [
      { begin: /\/\//, end: /$/ },
      { begin: /\/\*/, end: /\*\// },
    ],
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const PIPE = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  const FIELD = {
    className: "attr",
    begin: /[a-zA-Z_][\w.]*(?=\s*(?:=|==|!=|>=|<=|>|<))/,
    relevance: 0,
  };

  return {
    name: "ES|QL",
    aliases: ["esql"],
    case_insensitive: true,
    keywords: {
      keyword: ESQL_KEYWORDS,
      built_in: ESQL_FUNCTIONS,
      literal: ESQL_LITERALS,
    },
    contains: [COMMENT, STRING, PIPE, FIELD, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineEsql(hljs);
}

export const esql = { name: "esql", register };
export default esql;
