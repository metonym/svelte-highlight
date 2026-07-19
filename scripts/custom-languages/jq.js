const JQ_KEYWORDS =
  "if then elif else end as def reduce foreach try catch import include label and or not __loc__";

const JQ_LITERALS = "true false null";

const JQ_BUILT_INS =
  "map select map_values keys keys_unsorted values has in length utf8bytelength empty error type " +
  "sort sort_by group_by unique unique_by add any all range to_entries from_entries with_entries " +
  "tostring tonumber tojson fromjson env input inputs debug path getpath setpath delpaths paths " +
  "leaf_paths min max min_by max_by flatten reverse contains inside startswith endswith ltrimstr " +
  "rtrimstr explode implode split splits join ascii_downcase ascii_upcase test match capture scan " +
  "sub gsub recurse recurse_down walk transpose limit first last nth until while repeat isnan " +
  "isinfinite infinite nan now todate fromdate strftime strptime mktime gmtime localtime " +
  "input_line_number modulemeta combinations halt halt_error break";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineJq(hljs) {
  const FORMAT = {
    // Format strings: @base64, @csv, @tsv, @json, @html, @uri, @sh, @base32, @base64d, @base32d, @text
    className: "meta",
    begin: /@[a-zA-Z0-9]+/,
    relevance: 0,
  };

  // Balances a plain `(...)` call nested inside an interpolation, e.g.
  // `\(.tags | join(","))`. Without this, INTERPOLATION's own `end: /\)/`
  // would match the nested call's closing paren instead of the
  // interpolation's.
  const NESTED_PARENS = {
    begin: /\(/,
    end: /\)/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\\\(/,
    end: /\)/,
    keywords: {
      keyword: JQ_KEYWORDS,
      literal: JQ_LITERALS,
      built_in: JQ_BUILT_INS,
    },
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      NESTED_PARENS,
    ]),
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    // INTERPOLATION must come first: its begin (`\(`) is a strict subset of
    // BACKSLASH_ESCAPE's generic `\<anything>`, so listing the escape mode
    // first would always win the tie and interpolation would never fire.
    contains: [INTERPOLATION, hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const VARIABLE = {
    // Variable bindings and references: $foo, $__loc__, $ENV
    className: "variable",
    begin: /\$[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const FIELD = {
    // Dotted field access: .foo, .foo.bar, .foo_bar
    className: "property",
    begin: /\.[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const BRACKET_FIELD = {
    // Bracketed/quoted field access and array slicing: .["key"], .[], .[0], .[1:3]
    className: "property",
    begin: /\.\[(?=(?:[^[\]]|\[[^[\]]*\])*\])/,
    end: /\]/,
    contains: [STRING, NUMBER],
    relevance: 0,
  };

  const RECURSIVE_DESCENT = {
    className: "property",
    begin: /\.\./,
    relevance: 10,
  };

  const PIPE = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  const FUNCTION_DEF = {
    // def name(params):
    begin: [/def\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 2: "title.function" },
    relevance: 0,
  };

  return {
    name: "jq",
    aliases: ["jq"],
    keywords: {
      keyword: JQ_KEYWORDS,
      literal: JQ_LITERALS,
      built_in: JQ_BUILT_INS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      FORMAT,
      FUNCTION_DEF,
      RECURSIVE_DESCENT,
      BRACKET_FIELD,
      FIELD,
      VARIABLE,
      PIPE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineJq(hljs);
}

export const jq = { name: "jq", register };
export default jq;
