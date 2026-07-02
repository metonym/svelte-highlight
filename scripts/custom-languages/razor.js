const RAZOR_DIRECTIVES =
  "page model using inject inherits implements layout namespace section functions code attribute preservewhitespace addTagHelper removeTagHelper tagHelperPrefix rendermode typeparam";

const RAZOR_CSHARP_KEYWORDS =
  "if else for foreach while do switch case default try catch finally return await async var new using lock";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRazor(hljs) {
  // `{expr}` interpolation hole inside an interpolated string
  const INTERPOLATION = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    relevance: 0,
  };

  const CSHARP_STRING = {
    className: "string",
    variants: [
      // interpolated: $"..." / $@"..." / @$"...", with {expr} holes
      { begin: /\$@"|@\$"/, end: /"/, contains: [INTERPOLATION] },
      { begin: /\$"/, end: /"/, contains: [INTERPOLATION] },
      { begin: /@"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const DIRECTIVE = {
    className: "meta",
    begin:
      /@(?:page|model|using|inject|inherits|implements|layout|namespace|section|functions|code|attribute|preservewhitespace|addTagHelper|removeTagHelper|tagHelperPrefix|rendermode|typeparam)\b/,
  };

  // brace-depth-aware C# body, shared by `@{ }`, `@code { }`, `@functions { }`.
  // Nested `{...}` pairs (e.g. `if (x) { ... }`) recurse via "self" instead of
  // terminating the outer block at the first `}`.
  const CSHARP_BODY_CONTAINS = [
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    CSHARP_STRING,
    { className: "number", begin: /\b\d+(?:\.\d+)?\b/ },
  ];

  const NESTED_BRACES = {
    begin: /\{/,
    end: /\}/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: { keyword: RAZOR_CSHARP_KEYWORDS },
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      ...CSHARP_BODY_CONTAINS,
      "self",
    ]),
    relevance: 0,
  };
  CSHARP_BODY_CONTAINS.push(NESTED_BRACES);

  const CODE_BLOCK = {
    begin: /@\{/,
    end: /\}/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: { keyword: RAZOR_CSHARP_KEYWORDS },
    contains: CSHARP_BODY_CONTAINS,
    relevance: 0,
  };

  // `@code { ... }` / `@functions { ... }` (Blazor)
  const NAMED_CODE_BLOCK = {
    begin: /@(?:code|functions)\s*\{/,
    end: /\}/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: { keyword: RAZOR_CSHARP_KEYWORDS },
    contains: CSHARP_BODY_CONTAINS,
    relevance: 0,
  };

  // `@(model.Value + 1)` explicit expression
  const EXPLICIT_EXPRESSION = {
    className: "template-variable",
    begin: /@\(/,
    end: /\)/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      CSHARP_STRING,
      { className: "number", begin: /\b\d+(?:\.\d+)?\b/ },
      "self",
    ]),
    relevance: 0,
  };

  const EXPRESSION = {
    className: "template-variable",
    begin: /@[A-Za-z_][\w.]*/,
    relevance: 0,
  };

  const TAG = {
    className: "tag",
    begin: /<\/?[a-zA-Z][\w-]*/,
    end: />/,
    relevance: 0,
  };

  return {
    name: "Razor",
    aliases: ["razor", "cshtml"],
    keywords: { keyword: RAZOR_DIRECTIVES },
    contains: [
      hljs.COMMENT(/@\*/, /\*@/),
      NAMED_CODE_BLOCK,
      DIRECTIVE,
      CODE_BLOCK,
      EXPLICIT_EXPRESSION,
      EXPRESSION,
      TAG,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRazor(hljs);
}

export const razor = { name: "razor", register };
export default razor;
