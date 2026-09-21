const TLAPLUS_KEYWORDS =
  "MODULE EXTENDS VARIABLE VARIABLES CONSTANT CONSTANTS ASSUME ASSUMPTION THEOREM LEMMA " +
  "INSTANCE WITH LOCAL RECURSIVE CHOOSE LET IN IF THEN ELSE CASE OTHER " +
  "UNCHANGED SUBSET UNION DOMAIN ENABLED EXCEPT";

// Unicode identifiers/operators (∀ → λ ℕ ...) need the compiled regex to use
// the `u` flag, same as lean.js/agda.js's unicodeRegex.
const IDENT_RE = /[A-Za-z_][A-Za-z0-9_]*/u;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineTlaplus(hljs) {
  // TLA+ block comments do nest, unlike Lean/Agda's `--`-only line form
  // sitting alongside them; recurse via "self".
  const NESTED_COMMENT = {
    className: "comment",
    begin: /\(\*/,
    end: /\*\)/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // The `---- MODULE Name ----` banner and the closing `====` line. The
  // module name is the language's title.class-equivalent anchor.
  const MODULE_HEADER = {
    className: "meta",
    begin: [/-{4,}\s*MODULE\s+/, IDENT_RE, /\s*-{4,}/],
    beginScope: { 2: "title.class" },
    relevance: 10,
  };

  const MODULE_FOOTER = {
    className: "meta",
    begin: /={4,}/,
    relevance: 0,
  };

  // Longest first: `<=>` before `=>`; `::=`/`==` before a bare `=`; `|->`
  // before `->`.
  const OPERATOR = {
    className: "operator",
    begin:
      /<=>|::=|\|->|=>|==|->|#|=|\/\\|\\\/|~|\\in\b|\\notin\b|\\subseteq\b|\\union\b|\\cup\b|\\intersect\b|\\cap\b|\\X\b|\\o\b|\\div\b|\.\./,
    relevance: 0,
  };

  const UNICODE_OPERATOR = {
    className: "operator",
    begin: /[∧∨¬∀∃∈∉⊆→]/u,
    relevance: 5,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+\b/,
    relevance: 0,
  };

  return {
    name: "TLA+",
    aliases: ["tla"],
    // Keywords are ALL CAPS by language convention; `in`/`let` etc. used as
    // ordinary lowercase words elsewhere must not match.
    case_insensitive: false,
    unicodeRegex: true,
    keywords: TLAPLUS_KEYWORDS,
    contains: [
      hljs.COMMENT(/\\\*/, /$/),
      NESTED_COMMENT,
      MODULE_HEADER,
      MODULE_FOOTER,
      STRING,
      OPERATOR,
      UNICODE_OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineTlaplus(hljs);
}

export const tlaplus = { name: "tlaplus", register };
export default tlaplus;
