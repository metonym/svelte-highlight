const STARLARK_KEYWORDS =
  "and break continue def elif else for if in lambda load not or pass return while";

const STARLARK_LITERALS = "True False None";

const STARLARK_BUILTINS =
  "glob select package licenses exports_files depset struct provider rule attr aspect fail print len range enumerate reversed sorted zip dict list tuple type hasattr getattr dir repr str int bool hash all any min max";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineStarlark(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b0[oO][0-7]+\b/ },
      { begin: /\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /[rb]?"""/, end: /"""/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /[rb]?'''/, end: /'''/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /[rb]?"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /[rb]?'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const FUNCTION = {
    begin: [/\bdef/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  return {
    name: "Starlark",
    aliases: ["starlark", "bazel", "bzl"],
    keywords: {
      keyword: STARLARK_KEYWORDS,
      literal: STARLARK_LITERALS,
      built_in: STARLARK_BUILTINS,
    },
    contains: [hljs.HASH_COMMENT_MODE, STRING, FUNCTION, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineStarlark(hljs);
}

export const starlark = { name: "starlark", register };
export default starlark;
