const UIUA_ASCII_PRIMITIVES =
  "dup flip over pop fold reduce rows each table keep first reverse range shape len join couple select pick take drop rotate transpose sort box unbox match fill repeat do try assert under fork bracket both on by with off above below dip gap identity " +
  "un anti obverse switch stencil tuples inventory backward self mask";

const UIUA_CONSTANTS = "η π τ ∞";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineUiua(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /\$"/, end: /"/ },
      { begin: /"/, end: /"/ },
    ],
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const FORMAT_STRING = {
    className: "string",
    begin: /\$\s/,
    end: /$/,
  };

  const CHAR_LITERAL = {
    className: "string",
    begin: /@\\?./,
    relevance: 0,
  };

  const COMMENT = {
    className: "comment",
    begin: /#/,
    end: /$/,
  };

  const BIND_ARROW = {
    className: "operator",
    begin: /←/,
    relevance: 10,
  };

  const OTHER_ARROW = {
    className: "operator",
    begin: /↚|=/,
    relevance: 0,
  };

  const FUNCTION_NAME = {
    className: "title.function",
    begin: /\b[A-Z][A-Za-z0-9]*(?=\s*(?:←|=))/,
    relevance: 5,
  };

  const STRAND = {
    className: "operator",
    begin: /_/,
    relevance: 0,
  };

  // Stack/array combinator glyphs: a single character class of the
  // non-ASCII primitives, plus `-` (subtract) and a bare `¯` (negate). A
  // numeric subscript (`⊟₃`) stays part of its glyph.
  const STACK_GLYPH = {
    className: "built_in",
    begin:
      /[.,:;∘◌⟜⊸⋅˜˙°⌝⌅⍜⊙⊃⊓∩⤙⤚◠◡⊜⊕⊗⊛⊞⊠⧻△⋯⊢⊣⇌⍏⍖⊚⊂⊟⊏⊡↯☇↙↘▽♭¤⬚≡⍚∵/\\⧅⧈◫⌕⦷∊◴◰□◇⍆⍥⟨⍢⟩⨬≍⌟⋕⍤⍣⚂ℂ⁅⁆∿⍉⤸↻⇡⍩⌵√○⌊⌈◿ⁿₙ∠⊥±¬¯×÷+\-−≠<≤>≥↥↧∧∨?⸮⧋ₑ⚇⧆⨪][₀-₉]*/,
    relevance: 0,
  };

  // `¯` is the negative sign; `-` is always subtract. No `\b`, so both
  // halves of a `1_2` strand match.
  const NUMBER = {
    className: "number",
    begin: /¯?\d+(?:\.\d+)?(?:e¯?\d+)?/,
    relevance: 0,
  };

  // A `---` line opens or closes a test scope. Without this rule its dashes
  // would read as three subtract glyphs.
  const TEST_SCOPE = {
    className: "meta",
    begin: /^---[ \t]*$/,
    relevance: 0,
  };

  // System functions: `&p`, `&fras`, `&sl`.
  const SYSTEM_FUNCTION = {
    className: "built_in",
    begin: /&[a-z]+/,
    relevance: 0,
  };

  const CONSTANT = {
    className: "literal",
    begin: new RegExp(UIUA_CONSTANTS.split(" ").join("|")),
    relevance: 0,
  };

  return {
    name: "Uiua",
    aliases: ["uiua"],
    unicodeRegex: true,
    keywords: {
      built_in: UIUA_ASCII_PRIMITIVES,
    },
    contains: [
      COMMENT,
      STRING,
      FORMAT_STRING,
      CHAR_LITERAL,
      FUNCTION_NAME,
      BIND_ARROW,
      OTHER_ARROW,
      TEST_SCOPE,
      CONSTANT,
      NUMBER,
      STRAND,
      SYSTEM_FUNCTION,
      STACK_GLYPH,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineUiua(hljs);
}

export const uiua = { name: "uiua", register };
export default uiua;
