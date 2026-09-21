const OPENFGA_KEYWORDS =
  "model schema type relations define module extend condition from and or self";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineOpenfga(hljs) {
  // `type document` -- the strongest structural anchor in the DSL.
  const TYPE_DECLARATION = {
    begin: [/\btype\b/, /\s+/, /[a-zA-Z_][\w-]*/],
    beginScope: { 1: "keyword", 3: "title.class" },
    relevance: 10,
  };

  // `define viewer:` and `define can_share:`.
  const DEFINE_DECLARATION = {
    begin: [/\bdefine\b/, /\s+/, /[a-zA-Z_][\w-]*/, /(?=\s*:)/],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 10,
  };

  // The two-word exclusion operator. Must be its own mode since neither
  // "but" nor bare "not" exist elsewhere in the DSL.
  const BUT_NOT = {
    className: "keyword",
    begin: /\bbut\s+not\b/,
    relevance: 0,
  };

  // Typed-restriction lists: `[user, user:*, team#member]`.
  const TYPE_RESTRICTION = {
    begin: /\[/,
    end: /\]/,
    contains: [
      {
        className: "operator",
        begin: /:\*|#/,
        relevance: 0,
      },
      {
        className: "title.class",
        begin: /[a-zA-Z_][\w-]*/,
        relevance: 0,
      },
    ],
  };

  // The `schema 1.1` version line.
  const SCHEMA_VERSION = {
    begin: [/\bschema\b/, /\s+/, /\d+\.\d+/],
    beginScope: { 1: "keyword", 3: "number" },
    relevance: 0,
  };

  return {
    name: "OpenFGA",
    aliases: ["fga"],
    keywords: {
      keyword: OPENFGA_KEYWORDS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      BUT_NOT,
      TYPE_DECLARATION,
      DEFINE_DECLARATION,
      TYPE_RESTRICTION,
      SCHEMA_VERSION,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineOpenfga(hljs);
}

export const openfga = { name: "openfga", register };
export default openfga;
