const IDRIS_KEYWORDS =
  "module import data record interface implementation namespace where do let in case of if then else class instance mutual parameters using postulate proof rewrite with public export total covering partial infixl infixr infix auto default constructor forall as";

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

  // `"\{expr}"` interpolation (Idris 2 0.5). Listed before BACKSLASH_ESCAPE,
  // which would otherwise eat the `\{` as a plain escape.
  const INTERPOLATION = {
    className: "subst",
    begin: /\\\{/,
    end: /\}/,
  };

  // `"""` multi-line strings (Idris 2 0.4) must be tried before the plain
  // string, which would otherwise see `""` + `"...`.
  const TRIPLE_STRING = {
    className: "string",
    begin: /"""/,
    end: /"""/,
    contains: [INTERPOLATION, hljs.BACKSLASH_ESCAPE],
  };

  const RAW_STRING = {
    className: "string",
    begin: /#"/,
    end: /"#/,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [INTERPOLATION, hljs.BACKSLASH_ESCAPE],
  };

  // `%default total`, `%name`, `%hide`, `%runElab`, `%foreign`, ...
  const PRAGMA = {
    className: "meta",
    begin: /%[a-zA-Z_]+\b/,
    relevance: 0,
  };

  // `0x`/`0b`/`0o` prefixes and `_` digit separators.
  const NUMBER = {
    className: "number",
    begin:
      /\b(?:0x[\da-fA-F_]+|0b[01_]+|0o[0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)\b/,
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
      hljs.COMMENT(/\|\|\|/, /$/),
      hljs.COMMENT(/--/, /$/),
      NESTED_COMMENT,
      PRAGMA,
      TRIPLE_STRING,
      RAW_STRING,
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
