import xmlRegister from "highlight.js/lib/languages/xml";

// Every built-in directive name. Only these open a `<#name` tag, so a stray
// `<#` in plain markup is left to the XML grammar.
const DIRECTIVE_NAMES =
  "if|elseif|else|switch|case|on|default|break|continue|list|items|sep|" +
  "foreach|assign|global|local|include|import|macro|nested|return|function|" +
  "attempt|recover|compress|noparse|escape|noescape|autoesc|noautoesc|" +
  "outputformat|ftl|setting|stop|flush|visit|recurse|fallback|t|lt|rt|nt";

// Inside a directive or `${ }` only the operator words are reserved. A
// directive name like `items` or `list` is a fine variable name
// (`<#list items as item>`), so it is styled by the tag rule, not here.
const FREEMARKER_KEYWORDS = {
  keyword: "as using gt gte lt lte",
  literal: "true false",
};

/** @param {import("highlight.js").HLJSApi} hljs */
function defineFreemarker(hljs) {
  const NAME = /[a-zA-Z_$][\w$]*/;

  // `"Hello ${user.name}"`: a non-raw string can interpolate. Its
  // `contains` is set once the expression rules exist.
  /** @type {import("highlight.js").Mode} */
  const INTERPOLATION = {
    scope: "subst",
    begin: /\$\{/,
    end: /\}/,
    keywords: FREEMARKER_KEYWORDS,
    relevance: 0,
  };

  const STRING = {
    scope: "string",
    variants: [
      // Raw strings: `r"C:\temp"` has no escapes.
      { begin: /r"/, end: /"/ },
      { begin: /r'/, end: /'/ },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      {
        begin: /'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
    relevance: 0,
  };

  const NUMBER = {
    scope: "number",
    begin: /\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  // `x??` tests for a value, and `x!"guest"` or `x!` gives a default. Both
  // must win over the built-in rule below, which also starts at `?`.
  // `>` and `/` are left out: in angle-bracket syntax they close the tag.
  const OPERATOR = {
    scope: "operator",
    match: /\?\?|!=|==|&&|\|\||->|\.\.[<!*]?|!/,
    relevance: 0,
  };

  // A `.name` after a name, a built-in or a closing bracket is a member
  // access. These rules eat it, so only a leading `.name` reaches the
  // special-variable rule below.
  const MEMBERS = /(?:\.[a-zA-Z_$][\w$]*)*/;

  // `user.address.city`: no scope, the chain only shields its dots.
  const MEMBER_CHAIN = {
    match: /[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)+/,
    relevance: 0,
  };

  // `name?upper_case`, `seq?join(", ")`, `price?string.currency`.
  const BUILT_IN = {
    match: [/\?/, NAME, MEMBERS],
    scope: { 1: "operator", 2: "built_in" },
    relevance: 0,
  };

  // `.now`, `.vars`, `.locale`: special variables.
  const SPECIAL_VARIABLE = {
    scope: "variable.language",
    match: /\.[a-z_]\w*/,
    relevance: 0,
  };

  // Nested groups keep a `>` or `]` inside them from closing the tag:
  // `<#if (count > 0)>`, `[#if seq[0]??]`, `${ {"a": 1}.a }`.
  const PARENS = {
    begin: /\(/,
    end: new RegExp(`\\)${MEMBERS.source}`),
    relevance: 0,
  };
  const BRACKETS = {
    begin: /\[/,
    end: new RegExp(`\\]${MEMBERS.source}`),
    relevance: 0,
  };
  const BRACES = {
    begin: /\{/,
    end: new RegExp(`\\}${MEMBERS.source}`),
    relevance: 0,
  };

  const EXPRESSION = [
    STRING,
    NUMBER,
    OPERATOR,
    MEMBER_CHAIN,
    BUILT_IN,
    SPECIAL_VARIABLE,
    PARENS,
    BRACKETS,
    BRACES,
  ];
  INTERPOLATION.contains = EXPRESSION;
  for (const group of [PARENS, BRACKETS, BRACES]) {
    Object.assign(group, {
      keywords: FREEMARKER_KEYWORDS,
      contains: EXPRESSION,
    });
  }

  // `<@greet person="Fred"/>`: argument names read as attributes.
  const ARGUMENT_NAME = {
    scope: "attr",
    match: /\b[a-zA-Z_$][\w$]*(?=\s*=(?!=))/,
    relevance: 0,
  };

  /**
   * The tag rules for one syntax: `<#if>` or `[#if]`.
   * @param {string} open  regex source for the opening bracket
   * @param {RegExp} close  end of a tag
   * @param {number} relevance
   */
  function tags(open, close, relevance) {
    const directiveName = new RegExp(`(?:${DIRECTIVE_NAMES})(?![\\w$])`);
    return [
      // `<#noparse>...</#noparse>`: FreeMarker leaves the body alone, so
      // `${x}` in it is plain markup, not an interpolation.
      // The closing tag falls to the directive rule below.
      {
        scope: "template-tag",
        begin: [new RegExp(`${open}#`), /noparse(?![\w$])/],
        beginScope: { 2: "keyword" },
        end: close,
        relevance,
        starts: {
          end: new RegExp(`(?=${open}/#noparse(?![\\w$]))`),
          subLanguage: "xml",
          relevance: 0,
        },
      },
      // `<#macro name params>` and `<#function name params>`.
      {
        scope: "template-tag",
        begin: [new RegExp(`${open}#`), /(?:macro|function)\b/, /\s+/, NAME],
        beginScope: { 2: "keyword", 4: "title.function" },
        end: close,
        keywords: FREEMARKER_KEYWORDS,
        contains: EXPRESSION,
        relevance,
      },
      {
        scope: "template-tag",
        begin: [new RegExp(`${open}/?#`), directiveName],
        beginScope: { 2: "keyword" },
        end: close,
        keywords: FREEMARKER_KEYWORDS,
        contains: EXPRESSION,
        relevance,
      },
      // User-defined directives: `<@card title="Hi">`, `</@card>`,
      // `<@layout.page/>`.
      {
        scope: "template-tag",
        begin: [new RegExp(`${open}/?@`), /[a-zA-Z_$][\w$.]*/],
        beginScope: { 2: "title.function" },
        end: close,
        keywords: FREEMARKER_KEYWORDS,
        contains: [ARGUMENT_NAME, ...EXPRESSION],
        relevance: relevance - 1,
      },
    ];
  }

  return {
    name: "FreeMarker",
    aliases: ["ftlh", "ftlx"],
    subLanguage: "xml",
    contains: [
      hljs.COMMENT(/<#--/, /-->/, { relevance: 3 }),
      hljs.COMMENT(/\[#--/, /--\]/, { relevance: 3 }),
      ...tags("<", /\/?>/, 3),
      ...tags("\\[", /\/?\]/, 2),
      {
        scope: "template-variable",
        begin: /\$\{/,
        end: /\}/,
        keywords: FREEMARKER_KEYWORDS,
        contains: EXPRESSION,
        relevance: 0,
      },
      // `#{x; m2}`: the old numeric interpolation.
      {
        scope: "template-variable",
        begin: /#\{/,
        end: /\}/,
        keywords: FREEMARKER_KEYWORDS,
        contains: EXPRESSION,
        relevance: 0,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("xml", xmlRegister);
  return defineFreemarker(hljs);
}

export const freemarker = { name: "freemarker", register };
export default freemarker;
