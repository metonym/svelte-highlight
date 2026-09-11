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
    begin: [/@[a-zA-Z]+/, /\{/, /\s*/, /[A-Za-z0-9][^\s,}]*/],
    beginScope: { 1: "keyword", 4: "title" },
    relevance: 0,
  };

  // `@preamble` / `@comment` have no citation key; the keyed ENTRY
  // above would otherwise fail to match them (or, with a looser title
  // pattern, swallow a quoted value as the title).
  const BARE_ENTRY = {
    begin: [/@[a-zA-Z]+/, /\{/],
    beginScope: { 1: "keyword" },
    relevance: 0,
  };

  return {
    name: "BibTeX",
    aliases: ["bibtex", "bib"],
    case_insensitive: true,
    contains: [hljs.COMMENT(/%/, /$/), ENTRY, BARE_ENTRY, FIELD, QUOTED_VALUE],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBibtex(hljs);
}

export const bibtex = { name: "bibtex", register };
export default bibtex;
