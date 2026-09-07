/** @param {import("highlight.js").HLJSApi} hljs */
function defineHocon(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/ },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const KEY = {
    className: "attr",
    begin: /\b[A-Za-z_][\w.-]*(?=\s*[:=]|\s*\{)/,
    relevance: 0,
  };

  const APPEND_OP = {
    className: "operator",
    begin: /\+=/,
    relevance: 5,
  };

  const SUBST_OPTIONAL = {
    className: "variable",
    begin: /\$\{\?/,
    end: /\}/,
    relevance: 10,
  };

  const SUBST = {
    className: "variable",
    begin: /\$\{/,
    end: /\}/,
    relevance: 0,
  };

  const INCLUDE_KEYWORD = {
    className: "keyword",
    begin: /\binclude\b/,
    relevance: 5,
  };

  const INCLUDE_BUILTIN = {
    className: "built_in",
    begin: /\b(?:required|classpath|file|url)(?=\s*\()/,
    relevance: 5,
  };

  const DURATION_OR_SIZE = {
    className: "number",
    begin:
      /\b\d+(?:\.\d+)?\s?(?:ns|us|ms|seconds?|minutes?|hours?|days?|[smhdBb]|[kKMGT]i?B?)\b/,
    relevance: 0,
  };

  return {
    name: "HOCON",
    aliases: ["conf"],
    keywords: {
      literal: "true false null on off yes no",
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE,
      STRING,
      SUBST_OPTIONAL,
      SUBST,
      INCLUDE_KEYWORD,
      INCLUDE_BUILTIN,
      APPEND_OP,
      KEY,
      DURATION_OR_SIZE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineHocon(hljs);
}

export const hocon = { name: "hocon", register };
export default hocon;
