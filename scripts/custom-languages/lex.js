import cRegister from "highlight.js/lib/languages/c";

// Names the scanner defines for its actions: `yytext`, `BEGIN(STATE)`,
// `ECHO`, ...
const LEX_BUILT_INS = [
  "yytext",
  "yyleng",
  "yylineno",
  "yyin",
  "yyout",
  "yylval",
  "yylloc",
  "yymore",
  "yyless",
  "yyterminate",
  "yywrap",
  "yyrestart",
  "yy_push_state",
  "yy_pop_state",
  "yy_top_state",
  "unput",
  "BEGIN",
  "ECHO",
  "REJECT",
  "INITIAL",
  "YY_START",
  "YYSTATE",
  "YY_USER_ACTION",
  "YY_BREAK",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLex(hljs) {
  const BUILT_IN = {
    scope: "built_in",
    begin: new RegExp(`\\b(?:${LEX_BUILT_INS.join("|")})\\b`),
    relevance: 1,
  };

  const CHAR_LITERAL = {
    scope: "string",
    begin: /'(?:\\(?:x[0-9A-Fa-f]+|[0-7]{1,3}|.)|[^'\\\n])'/,
    relevance: 0,
  };

  // Actions hold C. Nested braces are balanced by `self`. Strings, chars,
  // and comments are matched here so a `}` inside them does not close the
  // block.
  const ACTION_BLOCK = {
    begin: /\{/,
    end: /\}/,
    subLanguage: "c",
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      BUILT_IN,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      CHAR_LITERAL,
    ]),
    relevance: 1,
  };

  // The action runs to the end of the line, or to the `}` that closes a
  // block. A lone `|` reuses the action of the next rule.
  const ACTION = {
    end: /$/,
    subLanguage: "c",
    contains: [
      ACTION_BLOCK,
      BUILT_IN,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      CHAR_LITERAL,
      { scope: "operator", begin: /\|(?=[ \t]*$)/, relevance: 0 },
    ],
    relevance: 1,
  };

  // `{DIGIT}`: a reference to a named definition.
  const NAME_REF = {
    scope: "variable",
    begin: /\{[A-Za-z_][\w-]*\}/,
    relevance: 1,
  };

  // `[a-z]`, `[^"\n]`, `[[:alpha:]_]`, `[]x]`. Whitespace inside does not
  // end the pattern.
  const CHAR_CLASS = {
    begin: /\[\^?\]?/,
    end: /\]/,
    contains: [hljs.BACKSLASH_ESCAPE, { begin: /\[:[a-z]+:\]/ }],
    relevance: 0,
  };

  const REGEX_PARTS = [
    hljs.BACKSLASH_ESCAPE,
    {
      scope: "string",
      begin: /"/,
      end: /"/,
      contains: [hljs.BACKSLASH_ESCAPE],
      relevance: 0,
    },
    CHAR_CLASS,
    NAME_REF,
    { scope: "built_in", begin: /<<EOF>>/, relevance: 2 },
  ];

  // A rule pattern ends at the first whitespace outside quotes and
  // brackets. The action follows.
  const PATTERN_BODY = {
    scope: "regexp",
    end: /(?=\s)|$/,
    contains: REGEX_PARTS,
    starts: ACTION,
    relevance: 0,
  };

  // `<STRING>`, `<INITIAL,COMMENT>`, `<*>`.
  const START_CONDITION_LIST =
    /<(?:\*|[A-Za-z_]\w*(?:[ \t]*,[ \t]*[A-Za-z_]\w*)*)>/;

  /**
   * Rules in the rules section start a line. Rules inside a `<STATE>{ }`
   * scope may be indented.
   * @param {string} indent
   */
  const rules = (indent) => [
    {
      begin: [new RegExp(indent), START_CONDITION_LIST],
      beginScope: { 2: "symbol" },
      starts: PATTERN_BODY,
      relevance: 1,
    },
    {
      ...PATTERN_BODY,
      begin: new RegExp(`${indent}(?=[^\\s}])`),
      excludeBegin: true,
    },
  ];

  // `<STRING>{` opens a block of rules that all share the start condition.
  const START_CONDITION_SCOPE = {
    begin: [/^[ \t]*/, START_CONDITION_LIST, /\{/, /(?=[ \t]*$)/],
    beginScope: { 2: "symbol", 3: "punctuation" },
    end: /^[ \t]*\}/,
    endScope: "punctuation",
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      hljs.C_BLOCK_COMMENT_MODE,
      "self",
      ...rules("^[ \\t]*"),
    ]),
    relevance: 2,
  };

  // `%{ ... %}` copies C verbatim into the generated scanner.
  const CODE_BLOCK = {
    begin: /^[ \t]*%\{/,
    beginScope: "meta",
    end: /^[ \t]*%\}/,
    endScope: "meta",
    subLanguage: "c",
    relevance: 0,
  };

  // `%top{ ... }` places C at the very top of the scanner.
  const TOP_BLOCK = {
    begin: [/^%top/, /[ \t]*/, /\{/],
    beginScope: { 1: "keyword" },
    end: /^\}/,
    subLanguage: "c",
    relevance: 2,
  };

  // `%option noyywrap yylineno prefix="calc"`.
  const OPTION = {
    begin: /^%option\b/,
    beginScope: "keyword",
    end: /$/,
    contains: [
      hljs.QUOTE_STRING_MODE,
      { scope: "attr", begin: /[A-Za-z_][\w-]*/, relevance: 0 },
      { scope: "operator", begin: /=/, relevance: 0 },
    ],
    relevance: 3,
  };

  // `%x COMMENT STRING` (exclusive), `%s QUOTED` (inclusive).
  const START_CONDITION_DECL = {
    begin: /^%[xs](?=[ \t])/,
    beginScope: "keyword",
    end: /$/,
    contains: [{ scope: "symbol", begin: /[A-Za-z_]\w*/, relevance: 0 }],
    relevance: 2,
  };

  const DIRECTIVE = {
    scope: "keyword",
    begin: /^%(?:array|pointer|[A-Za-z][\w-]*)\b/,
    relevance: 0,
  };

  // `DIGIT    [0-9]`: a name, then a pattern to the end of the line.
  const DEFINITION = {
    begin: [/^[A-Za-z_][\w-]*/, /[ \t]+/],
    beginScope: { 1: "variable" },
    starts: {
      scope: "regexp",
      end: /$/,
      contains: REGEX_PARTS,
      relevance: 0,
    },
    relevance: 0,
  };

  // Everything after the second `%%` is C, to the end of the file.
  const USER_CODE = {
    begin: /^%%(?=[ \t]*$)/,
    beginScope: "meta",
    end: hljs.MATCH_NOTHING_RE,
    subLanguage: "c",
    relevance: 0,
  };

  const RULES = {
    begin: /^%%(?=[ \t]*$)/,
    beginScope: "meta",
    end: hljs.MATCH_NOTHING_RE,
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      USER_CODE,
      CODE_BLOCK,
      START_CONDITION_SCOPE,
      ...rules("^"),
    ],
    relevance: 0,
  };

  return {
    name: "Lex",
    aliases: ["flex", "l"],
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      CODE_BLOCK,
      TOP_BLOCK,
      RULES,
      OPTION,
      START_CONDITION_DECL,
      DIRECTIVE,
      DEFINITION,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("c", cRegister);
  return defineLex(hljs);
}

export const lex = { name: "lex", register };
export default lex;
