import html from "./html.js";

const JINJA_KEYWORDS =
  "if elif else endif for endfor in macro endmacro set block endblock " +
  "extends include import from as with endwith call endcall filter endfilter " +
  "autoescape endautoescape raw endraw do break continue and or not is " +
  "true false none recursive scoped required";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineJinja(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const FILTER = {
    begin: /\|\s*/,
    contains: [{ className: "built_in", begin: /[a-z_]\w*/ }],
    relevance: 0,
  };

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
        contains: [STRING, hljs.NUMBER_MODE, FILTER],
      },
      {
        className: "template-variable",
        begin: /\{\{-?/,
        end: /-?\}\}/,
        contains: [STRING, hljs.NUMBER_MODE, FILTER],
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
