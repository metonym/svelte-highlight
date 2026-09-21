const LIKEC4_KEYWORDS =
  "specification model views global element extend view include exclude deployment relationship metadata description";

const LIKEC4_ATTRS =
  "style shape color icon opacity multiple group title link of";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLikec4(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // specification/element are the anchors that separate LikeC4 from
  // Structurizr, which also uses model and views.
  const ANCHOR = {
    className: "keyword",
    begin: /\b(?:specification|element)\b/,
    relevance: 5,
  };

  const ARROW = {
    className: "operator",
    begin: /<->|->|<-/,
    relevance: 0,
  };

  const KIND = {
    begin: [/=(?!=)/, /\s*/, /[A-Za-z_][\w-]*/],
    beginScope: { 3: "type" },
    relevance: 0,
  };

  const ATTR = {
    className: "keyword",
    begin: new RegExp(String.raw`\b(?:${LIKEC4_ATTRS.split(" ").join("|")})\b`),
    relevance: 0,
  };

  const TAG = {
    className: "meta",
    begin: /#[A-Za-z_][\w-]*/,
    relevance: 0,
  };

  return {
    name: "LikeC4",
    aliases: ["likec4"],
    keywords: {
      keyword: LIKEC4_KEYWORDS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ANCHOR,
      STRING,
      ARROW,
      KIND,
      ATTR,
      TAG,
      { className: "literal", begin: /\*/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineLikec4(hljs);
}

export const likec4 = { name: "likec4", register };
export default likec4;
