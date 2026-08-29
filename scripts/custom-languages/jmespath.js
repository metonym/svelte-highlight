const JMESPATH_BUILT_INS =
  "abs avg ceil contains ends_with floor join keys length map max max_by merge min min_by not_null " +
  "reverse sort sort_by starts_with sum to_array to_number to_string type values";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineJmespath(hljs) {
  // Raw strings: 'text', escaping only `\'` and `\\`.
  const RAW_STRING = {
    className: "string",
    begin: /'/,
    end: /'/,
    contains: [{ begin: /\\['\\]/ }],
  };

  // Double-quoted identifiers act as field names for keys with special
  // characters: "first name".
  const QUOTED_IDENTIFIER = {
    className: "property",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // Backtick JSON literals embed a raw JSON value: `{"a": 1}`, `true`, `42`.
  const JSON_LITERAL = {
    className: "string",
    begin: /`/,
    end: /`/,
    contains: [{ begin: /\\`/ }],
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+\b/,
    relevance: 0,
  };

  const CURRENT_NODE = {
    className: "variable",
    begin: /@/,
    relevance: 0,
  };

  const EXPRESSION_REF = {
    // Function-expression argument reference: sort_by(people, &age)
    className: "operator",
    begin: /&/,
    relevance: 0,
  };

  const FIELD = {
    className: "property",
    begin: /\.[A-Za-z_]\w*/,
    relevance: 0,
  };

  const BRACKET_FIELD = {
    // Index, slice, flatten, filter, and multi-select-list expressions:
    // [0], [1:3], [], [?age > `30`]
    className: "property",
    begin: /\[/,
    end: /\]/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      RAW_STRING,
      QUOTED_IDENTIFIER,
      JSON_LITERAL,
      NUMBER,
      "self",
    ]),
    relevance: 0,
  };

  const PIPE = {
    className: "operator",
    begin: /\|\|?/,
    relevance: 0,
  };

  return {
    name: "JMESPath",
    aliases: ["jmespath"],
    keywords: {
      built_in: JMESPATH_BUILT_INS,
    },
    contains: [
      RAW_STRING,
      QUOTED_IDENTIFIER,
      JSON_LITERAL,
      CURRENT_NODE,
      EXPRESSION_REF,
      BRACKET_FIELD,
      FIELD,
      PIPE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineJmespath(hljs);
}

export const jmespath = { name: "jmespath", register };
export default jmespath;
