const PKL_KEYWORDS =
  "abstract amends as class const else extends external fixed for function hidden if import in is let local module new open out outer read super this throw trace typealias when";

const PKL_TYPES =
  "String Int Float Boolean Number Listing Mapping List Map Set Collection Pair Dynamic Object Class Module Null Any Duration DataSize";

const PKL_LITERALS = "true false null nothing unknown";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePkl(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F_]+\b/ },
      { begin: /\b0[oO][0-7_]+\b/ },
      { begin: /\b0[bB][01_]+\b/ },
      { begin: /\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\\\(/,
    end: /\)/,
    keywords: { keyword: PKL_KEYWORDS, literal: PKL_LITERALS },
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /"""/,
        end: /"""/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      { begin: /#"/, end: /"#/ },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  const ANNOTATION = {
    className: "meta",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bfunction/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  return {
    name: "Pkl",
    aliases: ["pkl"],
    keywords: {
      keyword: PKL_KEYWORDS,
      type: PKL_TYPES,
      literal: PKL_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ANNOTATION,
      STRING,
      FUNCTION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePkl(hljs);
}

export const pkl = { name: "pkl", register };
export default pkl;
