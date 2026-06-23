const RAZOR_DIRECTIVES =
  "page model using inject inherits implements layout namespace section functions code attribute preservewhitespace addTagHelper removeTagHelper tagHelperPrefix rendermode typeparam";

const RAZOR_CSHARP_KEYWORDS =
  "if else for foreach while do switch case default try catch finally return await async var new using lock";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRazor(hljs) {
  const CSHARP_STRING = {
    className: "string",
    variants: [
      { begin: /@?"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const DIRECTIVE = {
    className: "meta",
    begin:
      /@(?:page|model|using|inject|inherits|implements|layout|namespace|section|functions|code|attribute|preservewhitespace|addTagHelper|removeTagHelper|tagHelperPrefix|rendermode|typeparam)\b/,
  };

  const CODE_BLOCK = {
    begin: /@\{/,
    end: /\}/,
    keywords: { keyword: RAZOR_CSHARP_KEYWORDS },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      CSHARP_STRING,
      { className: "number", begin: /\b\d+(?:\.\d+)?\b/ },
    ],
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
      DIRECTIVE,
      CODE_BLOCK,
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
