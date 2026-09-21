const BLOCKDIAG_STRUCTURAL = "group network lane rack node";

const BLOCKDIAG_ATTRS =
  "label color style shape numbered description address background textcolor";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBlockdiag(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // The diagram opener is the structural anchor. label/color/shape are
  // shared with D2 and Graphviz, so they stay at relevance 0.
  const OPENER = {
    className: "keyword",
    begin: /\b(?:blockdiag|seqdiag|actdiag|nwdiag|packetdiag|rackdiag)\b/,
    relevance: 10,
  };

  const ATTR = {
    className: "attr",
    begin: new RegExp(
      String.raw`\b(?:${BLOCKDIAG_ATTRS.split(" ").join("|")})\b`,
    ),
    relevance: 0,
  };

  const ARROW = {
    className: "operator",
    begin: /->/,
    relevance: 0,
  };

  return {
    name: "blockdiag",
    aliases: ["seqdiag", "actdiag", "nwdiag", "packetdiag", "rackdiag"],
    keywords: {
      keyword: BLOCKDIAG_STRUCTURAL,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      OPENER,
      STRING,
      ATTR,
      ARROW,
      { className: "number", begin: /\b\d+(?:\.\d+)?\b/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBlockdiag(hljs);
}

export const blockdiag = { name: "blockdiag", register };
export default blockdiag;
