const ROC_KEYWORDS = [
  "app",
  "module",
  "platform",
  "package",
  "import",
  "expose",
  "exposes",
  "imports",
  "provides",
  "to",
  "if",
  "then",
  "else",
  "when",
  "is",
  "as",
  "return",
  "try",
  "where",
  "implements",
  "crash",
];

const ROC_BUILT_INS = "dbg expect";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRoc(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: ["self"],
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"""/, end: /"""/ },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  const COMMENT = {
    className: "comment",
    variants: [
      { begin: /##/, end: /$/ },
      { begin: /#/, end: /$/ },
    ],
  };

  const APP_HEADER = {
    className: "meta",
    begin: /\bapp\s*\[[^\]]*\]/,
    relevance: 10,
  };

  const TAG = {
    className: "title.class",
    begin: /\b[A-Z]\w*/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b(?:0x[0-9a-fA-F_]+|\d[\d_]*(?:\.[\d_]+)?)\b/,
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /<-|->|\|>/,
    relevance: 0,
  };

  return {
    name: "Roc",
    aliases: ["roc"],
    keywords: {
      keyword: ROC_KEYWORDS,
      built_in: ROC_BUILT_INS,
    },
    contains: [COMMENT, APP_HEADER, STRING, TAG, OPERATOR, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRoc(hljs);
}

export const roc = { name: "roc", register };
export default roc;
