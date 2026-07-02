/** @param {import("highlight.js").HLJSApi} hljs */
function defineDotenv(hljs) {
  const VARIABLE = {
    className: "variable",
    variants: [
      {
        begin: /\$\{[A-Za-z_][A-Za-z0-9_]*/,
        end: /\}/,
        contains: [{ className: "operator", begin: /:[-=+]/ }],
      },
      { begin: /\$[A-Za-z_][A-Za-z0-9_]*/ },
    ],
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE, VARIABLE] },
      { begin: /'/, end: /'/ },
    ],
  };

  return {
    name: "dotenv",
    aliases: ["env"],
    contains: [
      hljs.HASH_COMMENT_MODE,
      { className: "keyword", begin: /^[ \t]*export(?=[ \t])/ },
      {
        className: "attr",
        begin: /[A-Za-z_][A-Za-z0-9_]*(?=[ \t]*=)/,
        relevance: 0,
      },
      { className: "operator", begin: /=/, relevance: 0 },
      STRING,
      VARIABLE,
      { className: "number", begin: /\b\d+(?:\.\d+)?\b/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineDotenv(hljs);
}

export const dotenv = { name: "dotenv", register };
export default dotenv;
