const DHALL_KEYWORDS =
  "let in if then else merge toMap assert as using with forall Some None";

const DHALL_TYPES =
  "Natural Integer Double Text Bool Bytes Date Time TimeZone List Optional Type Kind Sort";

const DHALL_LITERALS = "True False NaN Infinity";

const DHALL_BUILTINS =
  "Natural/fold Natural/build Natural/isZero Natural/even Natural/odd Natural/toInteger Natural/show Natural/subtract List/build List/fold List/length List/head List/last List/indexed List/reverse Text/show Text/replace Optional/fold Optional/build Integer/show Integer/toDouble Double/show";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineDhall(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /[+-]?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    keywords: { keyword: DHALL_KEYWORDS, literal: DHALL_LITERALS },
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /''/, end: /''/, contains: [INTERPOLATION] },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  const IMPORT = {
    className: "link",
    begin: /(?:https?:\/\/[^\s]+|env:[A-Za-z_]\w*|\.\.?\/[^\s]+)/,
    relevance: 0,
  };

  return {
    name: "Dhall",
    aliases: ["dhall"],
    keywords: {
      $pattern: "[A-Za-z_][A-Za-z0-9_/]*",
      keyword: DHALL_KEYWORDS,
      type: DHALL_TYPES,
      literal: DHALL_LITERALS,
      built_in: DHALL_BUILTINS,
    },
    contains: [
      hljs.COMMENT(/--/, /$/),
      hljs.COMMENT(/\{-/, /-\}/),
      STRING,
      IMPORT,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineDhall(hljs);
}

export const dhall = { name: "dhall", register };
export default dhall;
