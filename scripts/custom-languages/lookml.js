import sqlRegister from "highlight.js/lib/languages/sql";

const LOOKML_BLOCK_KEYWORDS =
  "view|explore|dimension|measure|join|dimension_group|parameter|filter|set|datagroup|access_grant|aggregate_table|named_value_format|map_layer|test";

const LOOKML_LITERALS =
  "yes no string number sum count count_distinct average max min time date datetime many_to_one one_to_many one_to_one many_to_many left_outer inner full_outer cross";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLookml(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const TEMPLATE_VARIABLE = {
    className: "template-variable",
    variants: [
      { begin: /\$\{[^}\n]*\}/ },
      { begin: /\{%[^%\n]*%\}/ },
      { begin: /\{\{[^}\n]*\}\}/ },
    ],
    relevance: 0,
  };

  // `sql_table_name` is a table identifier, not a SQL clause, and often has no
  // terminating `;;`. Matching it here would open a SQL region that ran to the
  // next `;;` in the file (usually a later `sql:` field).
  const SQL_VALUE = {
    begin: /\bsql(?!_table_name)(?:_\w+)?:/,
    beginScope: "attr",
    end: /;;/,
    subLanguage: "sql",
    contains: [TEMPLATE_VARIABLE],
  };

  const BLOCK_HEADER = {
    begin: [
      new RegExp(`\\b(?:${LOOKML_BLOCK_KEYWORDS})\\b`),
      /:\s*/,
      /\+?[\w.]+/,
    ],
    beginScope: { 1: "keyword", 3: "title.class" },
    relevance: 5,
  };

  const ATTR_KEY = {
    className: "attr",
    begin: /\b[a-z_]+(?=\s*:)/,
    relevance: 0,
  };

  return {
    name: "LookML",
    aliases: ["lkml"],
    keywords: {
      literal: LOOKML_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      SQL_VALUE,
      BLOCK_HEADER,
      TEMPLATE_VARIABLE,
      ATTR_KEY,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("sql", sqlRegister);
  return defineLookml(hljs);
}

export const lookml = { name: "lookml", register };
export default lookml;
