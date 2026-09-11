// Includes `opaque`/`unfolding` (Agda 2.6.4), `interleaved mutual`
// (2.6.2), the `inductive`/`coinductive` record modifiers, and the
// reflection commands (`quote`, `unquoteDecl`, `tactic`).
const AGDA_KEYWORDS =
  "module where import data record field constructor postulate open using renaming hiding public private variable mutual instance abstract macro pattern rewrite with in let do case of infix infixl infixr " +
  "opaque unfolding interleaved inductive coinductive forall syntax primitive tactic quote quoteTerm unquote unquoteDecl unquoteDef overlap";

// The universes. `Setω` is left out: `ω` is outside hljs's default `\w`
// keyword pattern.
const AGDA_BUILT_INS = "Set Prop";

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

  // Decimal with optional fraction/exponent (`3.5e2`) and hex (`0x2A`).
  const NUMBER = {
    className: "number",
    begin: /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/,
    relevance: 0,
  };

  // `'a'`, `'\n'`, `'\x41'`. Exactly one character (or escape) between the
  // quotes, so the prime in `x'` never opens one.
  const CHAR = {
    className: "string",
    begin: /'(?:[^'\\\n]|\\(?:x[\da-fA-F]+|.))'/,
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
      built_in: AGDA_BUILT_INS,
    },
    contains: [
      hljs.COMMENT(/--/, /$/),
      PRAGMA,
      NESTED_COMMENT,
      DEF_HEADER,
      STRING,
      CHAR,
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
