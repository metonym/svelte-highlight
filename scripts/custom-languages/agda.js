const AGDA_KEYWORDS =
  "module where import data record field constructor postulate open using renaming hiding public private variable mutual instance abstract macro pattern rewrite with in let do case of infix infixl infixr";

// Type and constructor names are frequently a single Unicode symbol (`ℕ`,
// `⊤`, `⊥`) rather than an ASCII word, so the capture used for `data`/`record`
// headers must accept `\p{L}` - unicodeRegex makes the grammar's compiled
// regex use the `u` flag so that works.
const TYPE_NAME_RE = /[\p{L}\p{N}_][\p{L}\p{N}_'?!-]*/u;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineAgda(hljs) {
  const PRAGMA = {
    className: "meta",
    begin: /\{-#/,
    end: /#-\}/,
    relevance: 10,
  };

  // Nested `{- -}` comments recurse via "self" - hljs.COMMENT alone does not
  // nest. Listed after PRAGMA: both begin with `{-`, and hljs's mode chooser
  // picks the first alternative that matches at a position rather than the
  // longest, so the more specific `{-#` must be tried first.
  const NESTED_COMMENT = {
    className: "comment",
    begin: /\{-/,
    end: /-\}/,
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

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  const UNICODE_OPERATOR = {
    className: "operator",
    begin: /[∀∃→←↔λΛℕℤℚℝℂ⟨⟩∈∉∧∨¬≤≥≠≡∘×⊢⊎⊤⊥∷↦]/u,
    relevance: 5,
  };

  const DEF_HEADER = {
    begin: [/\b(?:data|record)\s+/, TYPE_NAME_RE],
    beginScope: { 2: "title.class" },
    relevance: 0,
  };

  return {
    name: "Agda",
    aliases: ["agda"],
    unicodeRegex: true,
    keywords: {
      keyword: AGDA_KEYWORDS,
    },
    contains: [
      hljs.COMMENT(/--/, /$/),
      PRAGMA,
      NESTED_COMMENT,
      DEF_HEADER,
      STRING,
      UNICODE_OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineAgda(hljs);
}

export const agda = { name: "agda", register };
export default agda;
