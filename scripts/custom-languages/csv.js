function defineCsv() {
  const QUOTED_FIELD = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [{ begin: /""/, relevance: 0 }],
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  const ISO_DATE = {
    className: "meta",
    begin: /\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?\b/,
    relevance: 0,
  };

  const SEPARATOR = {
    className: "punctuation",
    begin: /[,;|\t]/,
    relevance: 0,
  };

  return {
    name: "CSV",
    aliases: ["tsv"],
    case_insensitive: false,
    keywords: {
      literal: ["true|0", "false|0", "null|0", "NULL|0", "NA|0"],
    },
    contains: [QUOTED_FIELD, ISO_DATE, NUMBER, SEPARATOR],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(_hljs) {
  return defineCsv();
}

export const csv = { name: "csv", register };
export default csv;
