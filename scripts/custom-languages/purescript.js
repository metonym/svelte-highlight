// `derive` (not Haskell's `deriving`), `ado` (applicative do), `hiding` and
// `as` (import lists) are all PureScript keywords.
const PURESCRIPT_KEYWORDS =
  "module where import class instance data newtype type foreign forall do ado case of if then else let in derive hiding as infixl infixr infix";

// PureScript booleans are lowercase; `True`/`False` would be ordinary
// constructors.
const PURESCRIPT_LITERALS = "true false";

const PURESCRIPT_BUILTINS =
  "map filter show print pure bind id const flip compose otherwise";

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

  // Hex literals and `_` digit separators (`1_000_000`, PureScript 0.13).
  const NUMBER = {
    className: "number",
    begin: /\b(?:0x[\da-fA-F_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)\b/,
    relevance: 0,
  };

  const TYPE = {
    className: "type",
    begin: /\b[A-Z][\w']*/,
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
