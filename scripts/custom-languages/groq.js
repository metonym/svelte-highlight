const GROQ_KEYWORDS = "in match asc desc";

const GROQ_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineGroq(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const PARAMETER = {
    className: "variable",
    begin: /\$[A-Za-z_]\w*/,
    relevance: 0,
  };

  const METADATA = {
    // Document metadata attributes: _type, _id, _ref, _createdAt, ...
    className: "meta",
    begin: /\b_[A-Za-z]\w*/,
    relevance: 0,
  };

  const DEREFERENCE = {
    className: "operator",
    begin: /->/,
    relevance: 10,
  };

  const FUNCTION = {
    // Plain and namespaced calls: count(), order(), pt::text(), math::sum()
    className: "built_in",
    begin: /\b(?:[A-Za-z_]\w*::)?[A-Za-z_]\w*(?=\s*\()/,
    relevance: 0,
  };

  return {
    name: "GROQ",
    aliases: ["groq"],
    keywords: { keyword: GROQ_KEYWORDS, literal: GROQ_LITERALS },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      STRING,
      DEREFERENCE,
      METADATA,
      FUNCTION,
      PARAMETER,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineGroq(hljs);
}

export const groq = { name: "groq", register };
export default groq;
