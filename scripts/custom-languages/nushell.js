const NU_KEYWORDS =
  "def def-env export use let mut const if else match for in while loop " +
  "break continue return do try catch alias module overlay source hide " +
  "where extern register";

const NU_BUILTINS =
  "echo print ls cd pwd open save get select reject where each reduce " +
  "filter sort-by group-by uniq first last length reverse append prepend " +
  "insert update upsert str split join lines parse from to into format " +
  "math random http find skip take flatten wrap rename drop";

const NU_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineNushell(hljs) {
  const VARIABLE = {
    className: "variable",
    begin: /\$[A-Za-z_][\w]*/,
    relevance: 0,
  };

  const FLAG = {
    className: "symbol",
    begin: /(?:^|\s)--?[A-Za-z][\w-]*/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/ },
      { begin: /`/, end: /`/ },
    ],
  };

  const INTERP_EXPR = {
    className: "subst",
    begin: /\(/,
    end: /\)/,
    // "self" balances nested parens, e.g. `$"Sum: (1 + (2 * 3))"` — without
    // it, `end: /\)/` would match the inner call's closing paren instead of
    // the interpolation's.
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      VARIABLE,
      "self",
    ]),
  };

  const INTERP_STRING = {
    className: "string",
    begin: /\$"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERP_EXPR],
  };

  const RAW_STRING = {
    className: "string",
    begin: /r#'/,
    end: /'#/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin:
      /\b\d[\d_]*(?:\.\d[\d_]*)?(?:ns|us|ms|sec|min|hr|day|wk|b|kb|mb|gb|tb|pb|kib|mib|gib)?\b/,
    relevance: 0,
  };

  const FUNCTION = {
    // "def-env" must precede "def" in this list: regex alternation tries
    // alternatives in order and isn't longest-match, so "def" would win the
    // tie first and leave "-env" to be swallowed by the nested title regex
    // below (which allows hyphens) as if it were part of the function name.
    beginKeywords: "def-env def extern",
    end: /[[{(]/,
    excludeEnd: true,
    contains: [{ className: "title function_", begin: /[\w-]+/ }],
  };

  return {
    name: "Nushell",
    aliases: ["nu"],
    keywords: {
      $pattern: "[A-Za-z][\\w-]*",
      keyword: NU_KEYWORDS,
      built_in: NU_BUILTINS,
      literal: NU_LITERALS,
    },
    contains: [
      RAW_STRING,
      hljs.HASH_COMMENT_MODE,
      FUNCTION,
      INTERP_STRING,
      STRING,
      VARIABLE,
      FLAG,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineNushell(hljs);
}

export const nushell = { name: "nushell", register };
export default nushell;
