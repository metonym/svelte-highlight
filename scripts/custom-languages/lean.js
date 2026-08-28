const LEAN_KEYWORDS =
  "theorem lemma def example structure inductive class instance namespace section end open import variable variables where by do fun let have show from with match deriving mutual macro syntax notation attribute noncomputable partial unsafe private protected axiom constant abbrev if then else calc suffices exact";

const LEAN_LITERALS = "true false sorry";

// Identifiers may contain non-ASCII letters and subscripts (e.g. `x₁`),
// which ordinary source uses freely alongside `∀ → λ ℕ` - unicodeRegex
// makes the grammar's compiled regex use the `u` flag so `\p{L}` works.
const IDENT_RE = /[\p{L}_][\p{L}\p{N}_'!?]*/u;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLean(hljs) {
  // Nested `/- -/` comments (doc comments routinely wrap a snippet that
  // itself contains a comment) recurse via "self" - hljs.COMMENT alone does
  // not nest.
  const NESTED_COMMENT = {
    className: "comment",
    begin: /\/-/,
    end: /-\//,
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

  const ATTRIBUTE = {
    className: "meta",
    begin: /@\[[^\]]*\]/,
    relevance: 0,
  };

  const UNICODE_OPERATOR = {
    className: "operator",
    begin: /[∀∃→←↔λΛℕℤℚℝℂ⟨⟩∈∉∧∨¬≤≥≠≡∘×⊢⊎⊤⊥∷↦]/u,
    relevance: 5,
  };

  const DEF = {
    begin: [/\b(?:theorem|lemma|def|example|abbrev)\s+/, IDENT_RE],
    beginScope: { 2: "title.function" },
    relevance: 0,
  };

  return {
    name: "Lean",
    aliases: ["lean", "lean4"],
    unicodeRegex: true,
    keywords: {
      keyword: LEAN_KEYWORDS,
      literal: LEAN_LITERALS,
    },
    contains: [
      hljs.COMMENT(/--/, /$/),
      NESTED_COMMENT,
      ATTRIBUTE,
      DEF,
      STRING,
      UNICODE_OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineLean(hljs);
}

export const lean = { name: "lean", register };
export default lean;
