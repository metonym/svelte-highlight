const NICKEL_KEYWORDS =
  "let in if then else fun match import default doc optional priority force rec forall not";

const NICKEL_TYPES = "Number String Bool Array Dyn";

const NICKEL_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineNickel(hljs) {
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /%\{/,
    end: /\}/,
    keywords: { keyword: NICKEL_KEYWORDS, literal: NICKEL_LITERALS },
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /m%%%"/, end: /"%%%/, contains: [INTERPOLATION] },
      { begin: /m%%"/, end: /"%%/, contains: [INTERPOLATION] },
      { begin: /m%"/, end: /"%/, contains: [INTERPOLATION] },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  const ENUM_TAG = {
    className: "symbol",
    begin: /'[A-Za-z_]\w*/,
    relevance: 0,
  };

  const META = {
    className: "meta",
    begin: /\b(?:std|builtin)\b/,
    relevance: 0,
  };

  const RECORD_FIELD = {
    begin: [/[A-Za-z_][\w-]*/, /\s*/, /=(?!=)/],
    beginScope: { 1: "attr", 3: "operator" },
    relevance: 0,
  };

  return {
    name: "Nickel",
    aliases: ["nickel", "ncl"],
    keywords: {
      keyword: NICKEL_KEYWORDS,
      type: NICKEL_TYPES,
      literal: NICKEL_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      RECORD_FIELD,
      STRING,
      ENUM_TAG,
      META,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineNickel(hljs);
}

export const nickel = { name: "nickel", register };
export default nickel;
