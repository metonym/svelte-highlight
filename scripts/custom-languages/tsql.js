import sqlRegister from "highlight.js/lib/languages/sql";

const TSQL_EXTRA_KEYWORDS = [
  "DECLARE",
  "SET",
  "EXEC",
  "EXECUTE",
  "GO",
  "BEGIN",
  "END",
  "TRY",
  "CATCH",
  "THROW",
  "RAISERROR",
  "PRINT",
  "WHILE",
  "BREAK",
  "CONTINUE",
  "IF",
  "ELSE",
  "RETURN",
  "WAITFOR",
  "GOTO",
  "MERGE",
  "OUTPUT",
  "INSERTED",
  "DELETED",
  "TOP",
  "PERCENT",
  "PIVOT",
  "UNPIVOT",
  "APPLY",
  "CROSS",
  "OUTER",
  "IDENTITY",
  "NOLOCK",
  "READPAST",
  "ROWLOCK",
  "TABLOCK",
  "HOLDLOCK",
  "UPDLOCK",
  "TRAN",
  "TRANSACTION",
  "COMMIT",
  "ROLLBACK",
  "SAVE",
  "PROC",
  "PROCEDURE",
  "FUNCTION",
  "TRIGGER",
  "CURSOR",
  "FETCH",
  "NEXT",
  "OPEN",
  "CLOSE",
  "DEALLOCATE",
  "SCHEMABINDING",
  "OVER",
  "PARTITION",
];

const TSQL_EXTRA_TYPES = [
  "NVARCHAR",
  "VARCHAR",
  "NCHAR",
  "DATETIME2",
  "DATETIMEOFFSET",
  "SMALLDATETIME",
  "UNIQUEIDENTIFIER",
  "MONEY",
  "SMALLMONEY",
  "BIT",
  "TINYINT",
  "XML",
  "SQL_VARIANT",
  "HIERARCHYID",
  "GEOGRAPHY",
  "GEOMETRY",
  "ROWVERSION",
  "TABLE",
];

const TSQL_EXTRA_BUILTINS = [
  "STRING_AGG",
  "STRING_SPLIT",
  "ISNULL",
  "GETDATE",
  "SYSDATETIME",
  "DATEADD",
  "DATEDIFF",
  "DATEPART",
  "DATENAME",
  "CONVERT",
  "TRY_CONVERT",
  "TRY_CAST",
  "TRY_PARSE",
  "IIF",
  "CHOOSE",
  "NEWID",
  "NEWSEQUENTIALID",
  "SCOPE_IDENTITY",
  "OBJECT_ID",
  "ROW_NUMBER",
  "RANK",
  "DENSE_RANK",
  "NTILE",
  "LEAD",
  "LAG",
  "FIRST_VALUE",
  "LAST_VALUE",
  "OPENJSON",
  "JSON_VALUE",
  "JSON_QUERY",
  "JSON_MODIFY",
  "sp_executesql",
  "sp_help",
  "sp_rename",
];

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  const base = /** @type {any} */ (sqlRegister(hljs));

  const GO_BATCH = {
    className: "meta",
    begin: /^\s*GO\b/,
    relevance: 10,
  };

  const VARIABLE = {
    className: "variable",
    begin: /@[A-Za-z_][\w]*/,
    relevance: 5,
  };

  const GLOBAL_VARIABLE = {
    className: "variable language_",
    begin: /@@[A-Za-z_]+/,
    relevance: 5,
  };

  const BRACKETED_IDENTIFIER = {
    className: "title",
    begin: /\[[^\]\n]*\]/,
    relevance: 0,
  };

  const N_STRING = {
    className: "string",
    begin: /N'/,
    end: /'/,
    contains: [{ begin: /''/, relevance: 0 }],
  };

  const TEMP_TABLE = {
    className: "symbol",
    begin: /#{1,2}[A-Za-z_][\w]*/,
    relevance: 0,
  };

  const MULTI_WORD_KEYWORD = {
    className: "keyword",
    begin: /\b(?:WITH\s+TIES|FOR\s+JSON|FOR\s+XML)\b/,
    relevance: 0,
  };

  return {
    ...base,
    name: "T-SQL",
    aliases: ["mssql", "sqlserver"],
    case_insensitive: true,
    keywords: {
      ...base.keywords,
      keyword: [...base.keywords.keyword, ...TSQL_EXTRA_KEYWORDS],
      type: [...base.keywords.type, ...TSQL_EXTRA_TYPES],
      built_in: [...base.keywords.built_in, ...TSQL_EXTRA_BUILTINS],
    },
    contains: [
      GO_BATCH,
      GLOBAL_VARIABLE,
      VARIABLE,
      BRACKETED_IDENTIFIER,
      N_STRING,
      TEMP_TABLE,
      MULTI_WORD_KEYWORD,
      ...base.contains,
    ],
  };
}

export const tsql = { name: "tsql", register };
export default tsql;
