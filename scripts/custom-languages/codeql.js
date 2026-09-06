const CODEQL_KEYWORDS = [
  "import",
  "module",
  "class",
  "extends",
  "instanceof",
  "predicate|5",
  "query|5",
  "from|0",
  "where|0",
  "select|5",
  "as",
  "order",
  "by",
  "asc",
  "desc",
  "exists",
  "forall",
  "forex",
  "not",
  "and",
  "or",
  "implies",
  "if",
  "then",
  "else",
  "in",
  "this",
  "result",
  "super",
  "none",
  "any",
  "count",
  "sum",
  "min",
  "max",
  "avg",
  "concat",
  "strictconcat",
  "rank",
  "unique",
  "newtype",
  "cached",
  "abstract",
  "final",
  "private",
  "override",
  "pragma",
  "bindingset",
  "language",
  "external",
  "transient",
  "library",
  "deprecated",
];

const CODEQL_TYPES = "boolean int float string date";
const CODEQL_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCodeql(hljs) {
  const PLACEHOLDER = {
    className: "meta",
    begin: /\$@/,
    relevance: 5,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, PLACEHOLDER],
  };

  const QLDOC = hljs.COMMENT(/\/\*\*/, /\*\//, {
    contains: [{ className: "doctag", begin: /@[\w.]+/ }],
  });

  const DOUBLE_COLON = {
    className: "operator",
    begin: /::/,
    relevance: 0,
  };

  const DONT_CARE = {
    className: "variable.language",
    begin: /\b_\b/,
    relevance: 0,
  };

  return {
    name: "CodeQL",
    aliases: ["ql"],
    keywords: {
      keyword: CODEQL_KEYWORDS,
      type: CODEQL_TYPES,
      literal: CODEQL_LITERALS,
    },
    contains: [
      QLDOC,
      hljs.C_LINE_COMMENT_MODE,
      STRING,
      PLACEHOLDER,
      DOUBLE_COLON,
      DONT_CARE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCodeql(hljs);
}

export const codeql = { name: "codeql", register };
export default codeql;
