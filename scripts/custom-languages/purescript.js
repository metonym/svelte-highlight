const PURESCRIPT_KEYWORDS =
  "module where import class instance data newtype type foreign forall do case of if then else let in deriving infixl infixr infix";

const PURESCRIPT_LITERALS = "True False";

const PURESCRIPT_BUILTINS =
  "map filter show print pure bind then id const flip compose otherwise";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePureScript(hljs) {
  // Nested `{- -}` comments (e.g. a doc comment wrapping an example snippet
  // that itself contains a comment) recurse via "self" - hljs.COMMENT alone
  // does not nest.
  const NESTED_COMMENT = {
    className: "comment",
    begin: /\{-/,
    end: /-\}/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const CHAR = {
    className: "string",
    begin: /'(?:[^'\\]|\\.)'/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  // Excludes True/False: without the lookahead, this mode's unconditional
  // capitalized-word match would intercept them before the keyword table
  // gets a chance to classify them as `literal`.
  const TYPE = {
    className: "type",
    begin: /\b(?!True\b|False\b)[A-Z][\w']*/,
    relevance: 0,
  };

  const MODULE_HEADER = {
    begin: [/\bmodule\s+/, /[A-Z][\w.]*/],
    beginScope: { 2: "title.class" },
    relevance: 0,
  };

  return {
    name: "PureScript",
    aliases: ["purescript", "purs"],
    keywords: {
      keyword: PURESCRIPT_KEYWORDS,
      literal: PURESCRIPT_LITERALS,
      built_in: PURESCRIPT_BUILTINS,
    },
    contains: [
      hljs.COMMENT(/--/, /$/),
      NESTED_COMMENT,
      MODULE_HEADER,
      STRING,
      CHAR,
      TYPE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePureScript(hljs);
}

export const purescript = { name: "purescript", register };
export default purescript;
