// Statement, clause, and word-operator keywords through SurrealDB 2.x
// (`DEFINE ACCESS`, `UPSERT`, `REBUILD`, `ALTER`, `CONTAINSANY`, ...).
const SURREALQL_KEYWORDS =
  "DEFINE SELECT CREATE RELATE WHERE FROM SET TABLE SCHEMAFULL SCHEMALESS " +
  "UPDATE DELETE INSERT UPSERT LIVE LET RETURN INFO REMOVE FUNCTION FIELD " +
  "INDEX EVENT IF ELSE THEN END AND OR NOT IN AS GROUP ORDER BY LIMIT START " +
  "FETCH CONTENT MERGE ONLY TYPE VALUE ASSERT PERMISSIONS UNIQUE ON FOR " +
  "BEGIN CANCEL COMMIT TRANSACTION INTO DIFF AFTER BEFORE TIMEOUT " +
  "PARALLEL EXPLAIN SPLIT WHEN REBUILD USE NAMESPACE DATABASE ACCESS " +
  "ANALYZER PARAM SCOPE SIGNUP SIGNIN DEFAULT READONLY FLEXIBLE " +
  "COLUMNS FIELDS SEARCH KILL SLEEP SHOW CHANGES SINCE THROW BREAK " +
  "CONTINUE OVERWRITE EXISTS DROP CHANGEFEED RELATION OMIT WITH NOINDEX " +
  "ALTER ALL ASC DESC COLLATE NUMERIC IS CONTAINS CONTAINSNOT CONTAINSALL " +
  "CONTAINSANY CONTAINSNONE INSIDE NOTINSIDE ALLINSIDE ANYINSIDE " +
  "NONEINSIDE OUTSIDE INTERSECTS";

// Namespaces of the built-in function library (`time::now()`,
// `string::is::email()`); `fn::` is the prefix of user-defined functions.
const SURREALQL_FUNCTION_NAMESPACES =
  "array bytes count crypto duration encoding geo http math meta object " +
  "parse rand record search session sleep string time type vector fn";

const SURREALQL_LITERALS = "true false NONE NULL";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSurrealql(hljs) {
  // SurrealDB 2.0 prefixes typed strings: `d"..."` datetime, `r"..."`
  // record id, `u"..."` uuid, `s"..."` plain string.
  const STRING = {
    className: "string",
    variants: [
      { begin: /(?:\b[drsu])?"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /(?:\b[drsu])?'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // Durations (`1h30m`, `5s`) come before plain numbers so `1h` is not split
  // into a number and an identifier; `dec` and `f` are the decimal and float
  // suffixes, and `_` is the digit separator.
  const NUMBER = {
    className: "number",
    variants: [
      {
        begin:
          /\b\d+(?:ns|us|µs|ms|s|m|h|d|w|y)(?:\d+(?:ns|us|µs|ms|s|m|h|d|w|y))*\b/,
      },
      {
        begin: /-?\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?(?:dec|f)?\b/,
      },
    ],
    relevance: 0,
  };

  // `$auth`, `$value`, `$before`, and user parameters. Without this the
  // keyword table styled the `value` in `$value`.
  const VARIABLE = {
    className: "variable",
    begin: /\$[A-Za-z_]\w*/,
    relevance: 0,
  };

  const BUILT_IN_FUNCTION = {
    className: "built_in",
    begin: new RegExp(
      String.raw`\b(?:${SURREALQL_FUNCTION_NAMESPACES.split(" ").join("|")})::[A-Za-z_][\w:]*`,
    ),
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
      hljs.COMMENT(/--/, /$/),
      hljs.HASH_COMMENT_MODE,
      STRING,
      VARIABLE,
      BUILT_IN_FUNCTION,
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
