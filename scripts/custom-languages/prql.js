const PRQL_KEYWORDS =
  "let into case func module import prql type enum as from join group aggregate derive filter select sort take window append remove intersect union loop switch this that";

const PRQL_LITERALS = "true false null";

const PRQL_FUNCTIONS =
  "count sum average min max stddev every any all concat_array lag lead first last rank rank_dense row_number round math abs floor ceil";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePrql(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { begin: /\b0[bB][01][01_]*\b/ },
      { begin: /\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const DATE = {
    className: "meta",
    begin: /@\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?/,
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    contains: [
      /** @type {import("highlight.js").Mode} */ ({
        className: "variable",
        begin: /[a-zA-Z_]\w*/,
        relevance: 0,
      }),
    ],
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /f"/, end: /"/, contains: [INTERPOLATION] },
      { begin: /s"/, end: /"/, contains: [INTERPOLATION] },
      { begin: /"""/, end: /"""/ },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const COLUMN_ASSIGN = {
    className: "attr",
    begin: /[a-zA-Z_]\w*(?=\s*=[^=])/,
    relevance: 0,
  };

  const RANGE = {
    className: "operator",
    begin: /\.\./,
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /==|!=|>=|<=|~=|&&|\|\||\?\?|->|=>|[+\-*/%!]/,
    relevance: 0,
  };

  const PIPE = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  return {
    name: "PRQL",
    aliases: ["prql"],
    keywords: {
      keyword: PRQL_KEYWORDS,
      literal: PRQL_LITERALS,
      built_in: PRQL_FUNCTIONS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      DATE,
      COLUMN_ASSIGN,
      RANGE,
      OPERATOR,
      PIPE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePrql(hljs);
}

export const prql = { name: "prql", register };
export default prql;
