const UIUA_ASCII_PRIMITIVES =
  "dup flip over pop fold reduce rows each table keep first reverse range shape len join couple select pick take drop rotate transpose sort box unbox match fill repeat do try assert under fork bracket both on by with off above below dip gap identity";

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

  // Stack/array combinator glyphs: a single character class of the common
  // non-ASCII primitives.
  const STACK_GLYPH = {
    className: "built_in",
    begin:
      /[.,:;∘◌⟜⊸⋅˜°⍜⊙⊃⊓⊜⊕⊗⊛⊞⊠⧻⋯⊢⊣⇌⍏⍖⊚⊂⊏⊡↯↙↘♭¤⬚≡∵/\\⧅⌕∊⍆⍥⟨⍢⟩≍⌟⋕⍤⚂ℂ⁅⁆∿⍉↻⇡⍩⌵√○⌊⌈◿ⁿₙ∠±¬×÷+−≠<≤>≥∧∨?]/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?\b/,
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
      CONSTANT,
      NUMBER,
      STRAND,
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
