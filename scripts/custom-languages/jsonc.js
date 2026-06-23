/** @param {import("highlight.js").HLJSApi} hljs */
function defineJsonc(hljs) {
  const NUMBER = {
    className: "number",
    begin: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const ATTR = {
    className: "attr",
    begin: /"(?:[^"\\]|\\.)*"(?=\s*:)/,
    relevance: 1.01,
  };

  return {
    name: "JSONC",
    aliases: ["jsonc"],
    keywords: { literal: "true false null" },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ATTR,
      { match: /[{}[\],:]/, className: "punctuation", relevance: 0 },
      hljs.QUOTE_STRING_MODE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineJsonc(hljs);
}

export const jsonc = { name: "jsonc", register };
export default jsonc;
