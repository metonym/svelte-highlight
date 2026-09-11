/** @param {import("highlight.js").HLJSApi} hljs */
function defineJson5(hljs) {
  const LITERALS = "true false null Infinity NaN";

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /[+-]?0[xX][0-9a-fA-F]+\b/ },
      { begin: /[+-]?(?:Infinity|NaN)\b/ },
      // JSON5 allows a leading (`.5`) or trailing (`5.`) decimal point; the
      // negative lookahead (rather than `\b`) lets the trailing form keep
      // its `.`, which `\b` refused before a `,` or `}`.
      { begin: /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?(?![\w.])/ },
    ],
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // JSON5 keys may be quoted (single or double) or bare ECMAScript identifiers.
  const ATTR = {
    className: "attr",
    variants: [
      { begin: /"(?:[^"\\]|\\.)*"(?=\s*:)/ },
      { begin: /'(?:[^'\\]|\\.)*'(?=\s*:)/ },
      { begin: /[A-Za-z_$][A-Za-z0-9_$]*(?=\s*:)/ },
    ],
    relevance: 0,
  };

  return {
    name: "JSON5",
    aliases: ["json5"],
    keywords: { literal: LITERALS },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ATTR,
      STRING,
      NUMBER,
      { match: /[{}[\],:]/, className: "punctuation", relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineJson5(hljs);
}

export const json5 = { name: "json5", register };
export default json5;
