/** @param {import("highlight.js").HLJSApi} hljs */
function defineBibtex(hljs) {
  // Only braces/quotes that follow `field =` are values; the outer entry
  // braces stay plain so the body's fields can still be highlighted.
  // Brace-delimited values can nest, so this mode references itself.
  /** @type {import("highlight.js").Mode} */
  const BRACED_VALUE = { className: "string", begin: /\{/, end: /\}/ };
  BRACED_VALUE.contains = [BRACED_VALUE];

  const QUOTED_VALUE = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = { className: "number", begin: /\b\d+\b/ };

  const FIELD = {
    begin: [/\b[a-zA-Z][a-zA-Z0-9_-]*/, /\s*/, /=/],
    beginScope: { 1: "attr", 3: "operator" },
    end: /(?=,|\}|\n)/,
    contains: [BRACED_VALUE, QUOTED_VALUE, NUMBER],
    relevance: 0,
  };

  const ENTRY = {
    className: "keyword",
    begin: /@[a-zA-Z]+/,
    relevance: 0,
  };

  return {
    name: "BibTeX",
    aliases: ["bibtex", "bib"],
    case_insensitive: true,
    contains: [hljs.COMMENT(/%/, /$/), ENTRY, FIELD],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBibtex(hljs);
}

export const bibtex = { name: "bibtex", register };
export default bibtex;
