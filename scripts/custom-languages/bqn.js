/** @param {import("highlight.js").HLJSApi} hljs */
function defineBqn(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const CHAR_LITERAL = {
    className: "string",
    begin: /'.'/,
    relevance: 0,
  };

  const COMMENT = {
    className: "comment",
    begin: /#/,
    end: /$/,
  };

  const SYSTEM_VALUE = {
    className: "built_in",
    begin: /•[_A-Za-z][\w.]*/,
    relevance: 5,
  };

  const DEFINE_ARROW = {
    className: "operator",
    begin: /⇐/,
    relevance: 10,
  };

  const ASSIGN_ARROW = {
    className: "operator",
    begin: /←|↩/,
    relevance: 0,
  };

  const TWO_MODIFIER = {
    className: "title.function",
    begin: /_[A-Za-z][\w]*_/,
    relevance: 0,
  };

  const ONE_MODIFIER = {
    className: "title.function",
    begin: /_[A-Za-z][\w]*/,
    relevance: 0,
  };

  const FUNCTION_NAME = {
    className: "title.function",
    begin: /\b[A-Z][A-Za-z0-9]*/,
    relevance: 0,
  };

  const BLOCK_VARIABLE = {
    className: "variable.language",
    begin: /[𝕩𝕨𝕗𝕘𝕤𝕣𝕏𝕎𝔽𝔾𝕊]/u,
    relevance: 0,
  };

  const CONSTANT = {
    className: "literal",
    begin: /∞|π/,
    relevance: 0,
  };

  const NULL_CHAR = {
    className: "literal",
    begin: /@/,
    relevance: 0,
  };

  const NOTHING = {
    className: "literal",
    begin: /·/,
    relevance: 0,
  };

  const STRAND = {
    className: "operator",
    begin: /‿/,
    relevance: 0,
  };

  const GUARD = {
    className: "operator",
    begin: /\?/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /¯?\d+(?:\.\d+)?/,
    relevance: 0,
  };

  // Primitive glyphs: a single character class of the common BQN built-ins.
  const PRIMITIVE = {
    className: "built_in",
    begin: /[-+×÷⋆√⌊⌈∧∨¬|≤<>≥=≠≡≢⊣⊢⥊∾≍⋈↑↓↕«»⌽⍉/⍋⍒⊏⊑⊐⊒∊⍷⊔!˙˜˘¨⌜⁼´˝`∘○⊸⟜⌾⊘◶⎉⚇⍟⎊]/,
    relevance: 0,
  };

  return {
    name: "BQN",
    aliases: ["bqn"],
    unicodeRegex: true,
    contains: [
      COMMENT,
      STRING,
      CHAR_LITERAL,
      SYSTEM_VALUE,
      DEFINE_ARROW,
      ASSIGN_ARROW,
      TWO_MODIFIER,
      ONE_MODIFIER,
      FUNCTION_NAME,
      BLOCK_VARIABLE,
      CONSTANT,
      NULL_CHAR,
      NOTHING,
      STRAND,
      GUARD,
      NUMBER,
      PRIMITIVE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBqn(hljs);
}

export const bqn = { name: "bqn", register };
export default bqn;
