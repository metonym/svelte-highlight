// Lean 4 commands and term-level keywords: `opaque` (the successor of
// `constant`), `do`-notation (`mut`, `for`/`in`, `return`, `unless`,
// `break`/`continue`, `try`/`catch`/`finally`/`throw`), well-founded
// recursion (`termination_by`/`decreasing_by`), section-variable control
// (`include`/`omit`, Lean 4.11), and the metaprogramming commands
// (`macro_rules`, `elab`, `universe`, `set_option`, `initialize`).
const LEAN_KEYWORDS =
  "theorem lemma def example structure inductive class instance namespace section end open import variable variables where by do fun let have show from with match deriving mutual macro syntax notation attribute noncomputable partial unsafe private protected axiom constant abbrev if then else calc suffices exact " +
  "opaque universe macro_rules elab set_option initialize extends export local scoped nonrec include omit hiding renaming " +
  "mut for in return unless break continue try catch finally throw at termination_by decreasing_by nomatch nofun";

const LEAN_LITERALS = "true false sorry";

const LEAN_BUILT_INS = "Type Prop Sort";

// Identifiers may contain non-ASCII letters and subscripts (e.g. `x₁`),
// which ordinary source uses freely alongside `∀ → λ ℕ` - unicodeRegex
// makes the grammar's compiled regex use the `u` flag so `\p{L}` works.
// A declared name may also be `«guillemet»`-quoted.
const IDENT_RE = /«[^»\n]*»|[\p{L}_][\p{L}\p{N}_'!?]*/u;

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

  // Decimal with optional fraction/exponent (`2.5e1`), plus the `0x`/`0b`/
  // `0o` prefixed forms.
  const NUMBER = {
    className: "number",
    begin:
      /\b(?:0x[\da-fA-F]+|0b[01]+|0o[0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/,
    relevance: 0,
  };

  // `'a'`, `'\n'`, `'\x41'`, `'\u{3B1}'`. Exactly one character (or escape)
  // between the quotes, so the prime in `add_zero'` never opens one.
  const CHAR = {
    className: "string",
    begin: /'(?:[^'\\\n]|\\(?:x[\da-fA-F]{2}|u\{[\da-fA-F]+\}|.))'/,
    relevance: 0,
  };

  // `#eval`, `#check`, `#print`, `#reduce`, `#guard`, `#synth`, ...
  const COMMAND = {
    className: "meta",
    begin: /#[a-z_]+\b/,
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
    begin: [/\b(?:theorem|lemma|def|example|abbrev|opaque)\s+/, IDENT_RE],
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
      built_in: LEAN_BUILT_INS,
    },
    contains: [
      hljs.COMMENT(/--/, /$/),
      NESTED_COMMENT,
      ATTRIBUTE,
      COMMAND,
      DEF,
      STRING,
      CHAR,
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
