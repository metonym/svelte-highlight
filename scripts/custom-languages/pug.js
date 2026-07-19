import javascriptRegister from "highlight.js/lib/languages/javascript";

const PUG_KEYWORDS =
  "if else unless case when default each for in while block extends include append prepend mixin yield";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePug(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /[#!]\{/,
    end: /\}/,
    relevance: 0,
  };

  const ATTRIBUTES = {
    className: "attr",
    begin: /\(/,
    end: /\)/,
    contains: [hljs.QUOTE_STRING_MODE, hljs.APOS_STRING_MODE, INTERPOLATION],
    relevance: 0,
  };

  // unbuffered code: `- var x = 1`
  const UNBUFFERED_CODE = {
    begin: /^\s*-/,
    end: /$/,
    excludeBegin: true,
    subLanguage: "javascript",
  };

  // buffered/unescaped code: `= x` / `!= x`
  const BUFFERED_CODE = {
    begin: /^\s*!?=/,
    end: /$/,
    excludeBegin: true,
    subLanguage: "javascript",
  };

  return {
    name: "Pug",
    aliases: ["pug", "jade"],
    case_insensitive: true,
    keywords: { keyword: PUG_KEYWORDS },
    contains: [
      hljs.COMMENT(/^\s*\/\/-/, /$/),
      hljs.COMMENT(/^\s*\/\/(?!-)/, /$/),
      { className: "meta", begin: /^\s*doctype\b/, end: /$/ },
      UNBUFFERED_CODE,
      BUFFERED_CODE,
      // Control-flow keywords must be checked before the generic tag rule
      // below: both match a line-initial word, and the tag rule's lookahead
      // has no way to defer to keywords, so it would otherwise render
      // `if`/`else`/`each` etc. as tag names instead of keywords.
      {
        className: "keyword",
        begin: new RegExp(
          String.raw`^\s*(?:${PUG_KEYWORDS.split(" ").join("|")})\b`,
        ),
        relevance: 0,
      },
      // tag with optional id/class shorthand at line start
      {
        begin: /^\s*(?=[a-zA-Z])/,
        contains: [{ className: "selector-tag", begin: /[a-zA-Z][\w:-]*/ }],
        relevance: 0,
      },
      { className: "selector-id", begin: /#[\w-]+/ },
      { className: "selector-class", begin: /\.[\w-]+/ },
      { className: "keyword", begin: /\+[a-zA-Z][\w-]*/ },
      ATTRIBUTES,
      INTERPOLATION,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("javascript", javascriptRegister);
  return definePug(hljs);
}

export const pug = { name: "pug", register };
export default pug;
