const ANTLR_KEYWORDS =
  "grammar lexer parser fragment import options tokens channels mode " +
  "returns locals throws catch finally";

// Words that can start a line but never name a rule.
const ANTLR_RESERVED = ANTLR_KEYWORDS.split(" ").join("|");

const ANTLR_LEXER_COMMANDS = "skip more popMode pushMode mode type channel";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineAntlr(hljs) {
  const COMMENTS = [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE];

  // ANTLR 4 literals are single-quoted: `'+'`, `'\n'`, `'\t'`.
  const LITERAL = {
    className: "string",
    begin: /'/,
    end: /'/,
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0,
  };

  // `[a-zA-Z_]`, `~[\r\n]`, `[\p{L}]`.
  const CHAR_SET = {
    className: "regexp",
    begin: /\[/,
    end: /\]/,
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0,
  };

  // Actions hold target-language code (Java, Python, ...), so they stay
  // plain. Strings and comments are matched only so a `}` inside them does
  // not close the block; nested braces are balanced by `self`.
  const ACTION_BODY = [
    ...COMMENTS,
    hljs.QUOTE_STRING_MODE,
    hljs.APOS_STRING_MODE,
  ];

  const ACTION = {
    begin: /\{/,
    end: /\}/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      ...ACTION_BODY,
    ]),
    relevance: 0,
  };

  // `@header { ... }`, `@lexer::members { ... }`, `@init { ... }`.
  const NAMED_ACTION = {
    begin: [/@(?:[A-Za-z_]\w*::)?[A-Za-z_]\w*/, /\s*/, /\{/],
    beginScope: { 1: "meta" },
    end: /\}/,
    contains: [ACTION, ...ACTION_BODY],
    relevance: 2,
  };

  // `options { language = Java; }`, `tokens { INDENT, DEDENT }`,
  // `channels { COMMENTS }`.
  const SPEC_BLOCK = {
    begin: [/\b(?:options|tokens|channels)\b/, /\s*/, /\{/],
    beginScope: { 1: "keyword" },
    end: /\}/,
    contains: [
      ...COMMENTS,
      LITERAL,
      { className: "attr", begin: /\b[A-Za-z_]\w*(?=\s*=)/, relevance: 0 },
    ],
  };

  // `grammar Expr;`, `lexer grammar ExprLexer;`, `parser grammar ExprParser;`.
  // Nearly every `.g4` file opens with this line, so it carries most of the
  // auto-detect weight. It must start a line and end with `;`.
  const GRAMMAR_DECL = {
    begin: [
      /^[ \t]*/,
      /(?:(?:lexer|parser)\b)?/,
      /[ \t]*/,
      /grammar\b/,
      /[ \t]+/,
      /[A-Za-z_]\w*/,
      /(?=[ \t]*;)/,
    ],
    beginScope: { 2: "keyword", 4: "keyword", 6: "title.class" },
    relevance: 10,
  };

  const MODE_DECL = {
    begin: [/\bmode\b/, /\s+/, /[A-Za-z_]\w*/, /(?=\s*;)/],
    beginScope: { 1: "keyword", 3: "title" },
  };

  // Lexer rules start with an uppercase letter, parser rules with a
  // lowercase one. The two get different scopes at their definition.
  const LEXER_RULE = {
    begin: [/^[ \t]*/, /(?:\bfragment\b)?/, /[ \t]*/, /[A-Z]\w*/, /(?=\s*:)/],
    beginScope: { 2: "keyword", 4: "title.class" },
    // `NAME :` also looks like a YAML or INI key, so it adds no weight.
    relevance: 0,
  };

  // The colon often sits on the next line, so look past the newline. Rule
  // arguments (`expr[int p]`) and `returns` / `locals` / `@init` may come
  // between the name and the colon.
  const PARSER_RULE = {
    begin: [
      /^[ \t]*/,
      new RegExp(String.raw`(?!(?:${ANTLR_RESERVED})\b)[a-z]\w*`),
      /(?:[ \t]*\[[^\]\n]*\])?/,
      /(?=\s*(?::(?!:)|returns\b|locals\b|throws\b|options\b|@))/,
    ],
    beginScope: { 2: "title.function" },
    relevance: 0,
  };

  // `returns [int value]`, `locals [List<String> names]`: target-language
  // declarations, not a character set.
  const RULE_SIGNATURE = {
    begin: [/\b(?:returns|locals)\b/, /\s*/, /\[/],
    beginScope: { 1: "keyword" },
    end: /\]/,
  };

  // `-> skip`, `-> channel(HIDDEN)`, `-> pushMode(STRING), more`.
  const LEXER_COMMANDS = {
    begin: new RegExp(
      String.raw`->(?=[ \t]+(?:${ANTLR_LEXER_COMMANDS.split(" ").join("|")})\b(?![\w.]))`,
    ),
    beginScope: "operator",
    end: /(?=[;|])/,
    keywords: {
      built_in: ANTLR_LEXER_COMMANDS,
      literal: "HIDDEN DEFAULT_TOKEN_CHANNEL DEFAULT_MODE",
    },
    contains: COMMENTS,
    // `->` is common elsewhere (`$this->type` in PHP), so the match needs
    // a space and a known command after it.
    relevance: 3,
  };

  // `left=expr`, `args+=arg`.
  const LABEL = {
    begin: [/\b[A-Za-z_]\w*/, /[ \t]*/, /\+?=/],
    beginScope: { 1: "variable", 3: "operator" },
    relevance: 0,
  };

  // `# AddExpr` names an alternative for the generated visitor.
  const ALT_LABEL = {
    className: "symbol",
    begin: /#[ \t]*[A-Za-z_]\w*/,
    relevance: 0,
  };

  // `<assoc=right>`, `<fail='message'>`.
  const ELEMENT_OPTION = {
    className: "meta",
    begin: /<[ \t]*[A-Za-z_]\w*[ \t]*=[^>\n]*>/,
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /\.\.|[?*+~|]/,
    relevance: 0,
  };

  const PUNCTUATION = {
    className: "punctuation",
    begin: /[:;]/,
    relevance: 0,
  };

  return {
    name: "ANTLR",
    aliases: ["g4"],
    keywords: {
      keyword: ANTLR_KEYWORDS,
      built_in: "EOF",
    },
    contains: [
      ...COMMENTS,
      GRAMMAR_DECL,
      MODE_DECL,
      SPEC_BLOCK,
      NAMED_ACTION,
      RULE_SIGNATURE,
      LEXER_RULE,
      PARSER_RULE,
      LEXER_COMMANDS,
      LITERAL,
      CHAR_SET,
      ACTION,
      LABEL,
      ALT_LABEL,
      ELEMENT_OPTION,
      OPERATOR,
      PUNCTUATION,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineAntlr(hljs);
}

export const antlr = { name: "antlr", register };
export default antlr;
