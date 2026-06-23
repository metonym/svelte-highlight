const CUE_KEYWORDS = "package import if for in let";

const CUE_TYPES =
  "string bytes bool int float number uint uint8 uint16 uint32 uint64 uint128 int8 int16 int32 int64 int128 float32 float64 rune";

const CUE_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCue(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F_]+\b/ },
      { begin: /\b0[oO][0-7_]+\b/ },
      { begin: /\b0[bB][01_]+\b/ },
      { begin: /\b\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?(?:[KMGTPE]i?)?\b/ },
    ],
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\\\(/,
    end: /\)/,
    keywords: { keyword: CUE_KEYWORDS, literal: CUE_LITERALS },
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /"""/,
        end: /"""/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      { begin: /#"/, end: /"#/ },
    ],
  };

  const DEFINITION = {
    className: "title.class",
    begin: /#[A-Za-z_]\w*/,
    relevance: 0,
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /@[a-zA-Z_]\w*\(/,
    end: /\)/,
    relevance: 0,
  };

  return {
    name: "CUE",
    aliases: ["cue"],
    keywords: {
      keyword: CUE_KEYWORDS,
      type: CUE_TYPES,
      literal: CUE_LITERALS,
    },
    contains: [hljs.C_LINE_COMMENT_MODE, ATTRIBUTE, STRING, DEFINITION, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCue(hljs);
}

export const cue = { name: "cue", register };
export default cue;
