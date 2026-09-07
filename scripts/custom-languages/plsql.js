import sqlRegister from "highlight.js/lib/languages/sql";

const PLSQL_EXTRA_KEYWORDS = [
  "DECLARE",
  "BEGIN",
  "END",
  "EXCEPTION",
  "WHEN",
  "THEN",
  "OTHERS",
  "RAISE",
  "RAISE_APPLICATION_ERROR",
  "LOOP",
  "EXIT",
  "WHILE",
  "FOR",
  "IN",
  "REVERSE",
  "IF",
  "ELSIF",
  "ELSE",
  "CASE",
  "RETURN",
  "RETURNING",
  "INTO",
  "FORALL",
  "CURSOR",
  "OPEN",
  "FETCH",
  "CLOSE",
  "PROCEDURE",
  "FUNCTION",
  "PACKAGE",
  "BODY",
  "TYPE",
  "SUBTYPE",
  "RECORD",
  "VARRAY",
  "PRAGMA",
  "AUTONOMOUS_TRANSACTION",
  "EXCEPTION_INIT",
  "IS",
  "AS",
  "NOCOPY",
  "OUT",
  "DEFAULT",
  "CONSTANT",
  "USING",
  "MERGE",
  "COMMIT",
  "ROLLBACK",
  "SAVEPOINT",
  "PRIOR",
  "LEVEL",
  "ROWNUM",
  "SYSDATE",
  "SYSTIMESTAMP",
  "DUAL",
];

const PLSQL_EXTRA_TYPES = [
  "NUMBER",
  "VARCHAR2",
  "NVARCHAR2",
  "CLOB",
  "BLOB",
  "NCLOB",
  "PLS_INTEGER",
  "BINARY_INTEGER",
  "BOOLEAN",
  "DATE",
  "TIMESTAMP",
  "INTERVAL",
  "ROWID",
  "UROWID",
  "RAW",
  "LONG",
];

const PLSQL_EXTRA_BUILTINS = [
  "DBMS_OUTPUT",
  "PUT_LINE",
  "DBMS_SQL",
  "DBMS_LOB",
  "UTL_FILE",
  "UTL_HTTP",
  "NVL",
  "NVL2",
  "DECODE",
  "TO_CHAR",
  "TO_DATE",
  "TO_NUMBER",
  "SQLCODE",
  "SQLERRM",
  "NO_DATA_FOUND",
  "TOO_MANY_ROWS",
  "ZERO_DIVIDE",
  "DUP_VAL_ON_INDEX",
  "INVALID_NUMBER",
  "VALUE_ERROR",
];

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  const base = /** @type {any} */ (sqlRegister(hljs));

  const MULTI_WORD_KEYWORD = {
    className: "keyword",
    begin:
      /\b(?:END\s+LOOP|BULK\s+COLLECT|TABLE\s+OF|INDEX\s+BY|REF\s+CURSOR|IN\s+OUT|END\s+IF|CONNECT\s+BY|START\s+WITH|CREATE\s+OR\s+REPLACE|EXECUTE\s+IMMEDIATE)\b/,
    relevance: 0,
  };

  const ATTR_HIGH = {
    className: "built_in",
    begin: /%(?:TYPE|ROWTYPE)\b/,
    relevance: 10,
  };

  const ATTR_OTHER = {
    className: "built_in",
    begin: /%(?:FOUND|NOTFOUND|ROWCOUNT|ISOPEN)\b/,
    relevance: 0,
  };

  const ASSIGN_OP = {
    className: "operator",
    begin: /:=/,
    relevance: 5,
  };

  const BIND_VARIABLE = {
    className: "variable",
    begin: /:[A-Za-z_]\w*/,
    relevance: 0,
  };

  const QUOTED_STRING = {
    className: "string",
    variants: [
      { begin: /q'\[/, end: /\]'/ },
      { begin: /q'\{/, end: /\}'/ },
      { begin: /q'\(/, end: /\)'/ },
      { begin: /q'</, end: />'/ },
    ],
  };

  const SLASH_ON_OWN_LINE = {
    className: "meta",
    begin: /^\s*\/\s*$/,
    relevance: 0,
  };

  const LABEL = {
    className: "symbol",
    begin: /<<[A-Za-z_]\w*>>/,
    relevance: 0,
  };

  return {
    ...base,
    name: "PL/SQL",
    aliases: ["oracle", "plsql"],
    case_insensitive: true,
    keywords: {
      ...base.keywords,
      keyword: [...base.keywords.keyword, ...PLSQL_EXTRA_KEYWORDS],
      type: [...base.keywords.type, ...PLSQL_EXTRA_TYPES],
      built_in: [...base.keywords.built_in, ...PLSQL_EXTRA_BUILTINS],
    },
    contains: [
      SLASH_ON_OWN_LINE,
      LABEL,
      MULTI_WORD_KEYWORD,
      ATTR_HIGH,
      ATTR_OTHER,
      ASSIGN_OP,
      QUOTED_STRING,
      BIND_VARIABLE,
      ...base.contains,
    ],
  };
}

export const plsql = { name: "plsql", register };
export default plsql;
