import html from "./html.js";

// `true`/`false`/`none` are accepted in either case (Jinja 2.x+).
const JINJA_LITERALS = "true false none True False None";

const JINJA_KEYWORDS = {
  keyword:
    "if elif else endif for endfor in macro endmacro set endset block " +
    "endblock extends include import from as with endwith call endcall " +
    "filter endfilter autoescape endautoescape raw endraw do break continue " +
    "and or not is recursive scoped required",
  literal: JINJA_LITERALS,
};

// Inside `{{ }}` only the expression operators are reserved: a statement
// keyword like `block` or `set` is a perfectly good variable name there
// (`{{ block.title }}`), so the output tag gets this narrower table.
const JINJA_EXPRESSION_KEYWORDS = {
  keyword: "if else and or not is in",
  literal: JINJA_LITERALS,
};

/** @param {import("highlight.js").HLJSApi} hljs */
function defineJinja(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // Jinja's own literal shapes: `42`, `123_456`, `42.1e2`, `1_000.5`. Digit
  // groups may be `_`-separated (Jinja 3); there are no hex/octal forms.
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?\b/,
    relevance: 0,
  };

  const FILTER = {
    begin: /\|\s*/,
    contains: [{ className: "built_in", begin: /[a-z_]\w*/ }],
    relevance: 0,
  };

  // `x is defined`, `x is not divisibleby 3`: the test name after `is` is
  // a built-in, the same way a filter name after `|` is.
  const TEST = {
    begin: [/\bis\b/, /\s+(?:not\s+)?/, /[a-z_]\w*/],
    beginScope: { 1: "keyword", 3: "built_in" },
    relevance: 0,
  };

  const EXPRESSION_CONTAINS = [STRING, NUMBER, FILTER, TEST];

  return {
    name: "Jinja",
    aliases: ["jinja", "jinja2", "j2"],
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/\{#-?/, /-?#\}/),
      {
        className: "template-tag",
        begin: /\{%-?/,
        end: /-?%\}/,
        keywords: JINJA_KEYWORDS,
        contains: EXPRESSION_CONTAINS,
      },
      {
        className: "template-variable",
        begin: /\{\{-?/,
        end: /-?\}\}/,
        keywords: JINJA_EXPRESSION_KEYWORDS,
        contains: EXPRESSION_CONTAINS,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  return defineJinja(hljs);
}

export const jinja = { name: "jinja", register };
export default jinja;
