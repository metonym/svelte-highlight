import cRegister from "highlight.js/lib/languages/c";

// Declarations that only Yacc and Bison use. Each one adds detection
// weight. Common ones come first: the detection index keeps the first few
// as the grammar's fingerprint.
const YACC_DIRECTIVES = [
  "token",
  "type",
  "left",
  "right",
  "nonassoc",
  "union",
  "start",
  "define",
  "prec",
  "empty",
  "nterm",
  "precedence",
  "code",
  "param",
  "parse-param",
  "lex-param",
  "expect",
  "expect-rr",
  "require",
  "skeleton",
  "language",
  "locations",
  "pure-parser",
  "defines",
  "header",
  "output",
  "file-prefix",
  "name-prefix",
  "debug",
  "verbose",
  "error-verbose",
  "glr-parser",
  "token-table",
  "initial-action",
  "destructor",
  "printer",
  "no-lines",
  "yacc",
  "dprec",
  "merge",
];

// Names the parser defines for its actions.
const YACC_BUILT_INS = [
  "yyerrok",
  "yyclearin",
  "YYERROR",
  "YYACCEPT",
  "YYABORT",
  "YYRECOVERING",
  "YYBACKUP",
  "yylval",
  "yylloc",
  "yychar",
  "yynerrs",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineYacc(hljs) {
  const COMMENTS = [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE];

  // `'+'`, `'\n'`, `'\x41'`: single-character tokens.
  const CHAR_LITERAL = {
    scope: "string",
    begin: /'(?:\\(?:x[0-9A-Fa-f]+|[0-7]{1,3}|.)|[^'\\\n])'/,
    relevance: 0,
  };

  // `$$`, `$1`, `$-1`, `$<ival>2`, `$name`, `$[name]`, and the `@`
  // location forms of each.
  const SEMANTIC_VALUE = {
    scope: "variable",
    begin:
      /[$@](?:<[A-Za-z_][\w.]*>)?(?:\$|-?\d+|[A-Za-z_][\w.]*|\[[A-Za-z_][\w.-]*\])/,
    relevance: 1,
  };

  // Macros the parser defines for its actions: `yyerrok`, `YYERROR`, ...
  const BUILT_IN = {
    scope: "built_in",
    begin: new RegExp(`\\b(?:${YACC_BUILT_INS.join("|")})\\b`),
    relevance: 1,
  };

  /**
   * Actions hold C. Nested braces are balanced by `self`. Strings, chars,
   * and comments are matched here so a `}` inside them does not close the
   * block.
   * @param {number} relevance 0 keeps the C score out of the Yacc score.
   */
  const action = (relevance) => ({
    begin: /\{/,
    end: /\}/,
    subLanguage: "c",
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      SEMANTIC_VALUE,
      BUILT_IN,
      ...COMMENTS,
      hljs.QUOTE_STRING_MODE,
      CHAR_LITERAL,
    ]),
    relevance,
  });

  // `%{ ... %}` copies C verbatim into the generated parser.
  const PROLOGUE = {
    begin: /^%\{/,
    beginScope: "meta",
    end: /^%\}/,
    endScope: "meta",
    subLanguage: "c",
    relevance: 0,
  };

  const KNOWN_DIRECTIVE = {
    scope: "keyword",
    begin: new RegExp(
      `(?:${YACC_DIRECTIVES.map((name) => `%${name}`).join("|")})(?![\\w-])`,
    ),
    relevance: 2,
  };

  const DIRECTIVE = {
    scope: "keyword",
    begin: /%[A-Za-z][\w-]*/,
    relevance: 0,
  };

  // `%define api.pure full`, `%define parse.error verbose`.
  const DEFINE = {
    begin: [/%define\b/, /[ \t]+/, /[A-Za-z_][\w.:-]*/],
    beginScope: { 1: "keyword", 3: "attr" },
    relevance: 2,
  };

  // `%code requires { ... }`, `%code top { ... }`.
  const CODE_QUALIFIER = {
    begin: [/%code\b/, /[ \t]+/, /(?:requires|provides|top|imports)\b/],
    beginScope: { 1: "keyword", 3: "keyword" },
    relevance: 2,
  };

  // `<ival>`, `<struct node *>`, `<*>`, `<>`.
  const TYPE_TAG = {
    scope: "type",
    begin: /<(?:\*|[A-Za-z_][\w.:]*(?:[ \t]*\*+)?)?>/,
    relevance: 0,
  };

  // `expr:`, `stmt_list :`, `exp[result]:`. The colon may sit on the next
  // line. Rule names start a line in the rules section only.
  const RULE_NAME = {
    begin: [/^[A-Za-z_][\w.]*/, /(?:[ \t]*\[[A-Za-z_][\w.-]*\])?/, /(?=\s*:)/],
    beginScope: { 1: "title.function" },
    relevance: 2,
  };

  const OPERATOR = { scope: "operator", begin: /\|/, relevance: 0 };

  const PUNCTUATION = { scope: "punctuation", begin: /[:;]/, relevance: 0 };

  // Everything after the second `%%` is C, to the end of the file.
  const EPILOGUE = {
    begin: /^%%(?=[ \t]*$)/,
    beginScope: "meta",
    end: hljs.MATCH_NOTHING_RE,
    subLanguage: "c",
    relevance: 0,
  };

  // The first `%%` ends the declarations and starts the grammar rules.
  // Rule actions add their C score: a `%%` section of rules is strong
  // evidence of Yacc.
  const RULES = {
    begin: /^%%(?=[ \t]*$)/,
    beginScope: "meta",
    end: hljs.MATCH_NOTHING_RE,
    keywords: { built_in: "error|0" },
    contains: [
      ...COMMENTS,
      EPILOGUE,
      RULE_NAME,
      KNOWN_DIRECTIVE,
      DIRECTIVE,
      TYPE_TAG,
      action(1),
      hljs.QUOTE_STRING_MODE,
      CHAR_LITERAL,
      OPERATOR,
      PUNCTUATION,
    ],
    relevance: 0,
  };

  return {
    name: "Yacc",
    aliases: ["bison", "y", "yy"],
    contains: [
      ...COMMENTS,
      PROLOGUE,
      RULES,
      DEFINE,
      CODE_QUALIFIER,
      KNOWN_DIRECTIVE,
      DIRECTIVE,
      TYPE_TAG,
      action(0),
      hljs.QUOTE_STRING_MODE,
      CHAR_LITERAL,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("c", cRegister);
  return defineYacc(hljs);
}

export const yacc = { name: "yacc", register };
export default yacc;
