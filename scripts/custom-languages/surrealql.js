const SURREALQL_KEYWORDS =
  "DEFINE SELECT CREATE RELATE WHERE FROM SET TABLE SCHEMAFULL SCHEMALESS " +
  "UPDATE DELETE INSERT UPSERT LIVE LET RETURN INFO REMOVE FUNCTION FIELD " +
  "INDEX EVENT IF ELSE THEN END AND OR NOT IN AS GROUP ORDER BY LIMIT START " +
  "FETCH CONTENT MERGE ONLY TYPE VALUE ASSERT PERMISSIONS UNIQUE ON FOR";

const SURREALQL_LITERALS = "true false NONE NULL";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSurrealql(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const RECORD_ID = {
    className: "symbol",
    begin: /\b[A-Za-z_][\w]*:[A-Za-z_][\w-]*\b/,
    relevance: 10,
  };

  const EDGE = {
    className: "operator",
    begin: /<-|->/,
    relevance: 10,
  };

  return {
    name: "SurrealQL",
    aliases: ["surrealql", "surql"],
    case_insensitive: true,
    keywords: {
      keyword: SURREALQL_KEYWORDS,
      literal: SURREALQL_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      RECORD_ID,
      EDGE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSurrealql(hljs);
}

export const surrealql = { name: "surrealql", register };
export default surrealql;
