const IDRIS_KEYWORDS =
  "module import data record interface implementation namespace where do let in case of if then else class instance mutual parameters using postulate proof rewrite with public export total covering partial infixl infixr infix auto default";

const IDRIS_LITERALS = "True False";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineIdris(hljs) {
  // Nested `{- -}` comments recurse via "self" - hljs.COMMENT alone does not
  // nest.
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

  return {
    name: "Idris",
    aliases: ["idris", "idr"],
    keywords: {
      keyword: IDRIS_KEYWORDS,
      literal: IDRIS_LITERALS,
    },
    contains: [
      hljs.COMMENT(/--/, /$/),
      NESTED_COMMENT,
      STRING,
      CHAR,
      TYPE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineIdris(hljs);
}

export const idris = { name: "idris", register };
export default idris;
