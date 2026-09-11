import cssRegister from "highlight.js/lib/languages/css";
import javascriptRegister from "highlight.js/lib/languages/javascript";
import typescriptRegister from "highlight.js/lib/languages/typescript";
import html from "./html.js";

const TS_LANG = "(?:ts|typescript)";
const SCRIPT_TS_BEGIN = new RegExp(
  String.raw`<script(?=[^>]*\slang=["']${TS_LANG}["'])[^>]*>`,
  "gm",
);
const SCRIPT_JS_BEGIN = new RegExp(
  String.raw`<script(?![^>]*\slang=["']${TS_LANG}["'])[^>]*>`,
  "gm",
);

// A concise-tag name, optionally followed by `.class`/`#id` shorthand
// segments (`div.container`, `input#email.required`).
const MARKO_TAG_NAME = String.raw`[a-zA-Z][\w-]*(?:[.#][\w-]+)*`;
const MARKO_CONCISE_TAG_BEGIN = new RegExp(
  String.raw`^[ \t]*(?=${MARKO_TAG_NAME}(?:[ \t]*(?:$|--|\/[ \t]*$)|[ \t]+.*[=(]))`,
  "m",
);

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMarko(hljs) {
  const markoControlFlow = {
    // Marko's tag is `else-if` (hyphen), not `else if` (space). This must be
    // tried before the bare `else` alternative below it, or `else-if(...)`
    // would only match the `else` prefix and leave `-if(...)` uncolored.
    begin: /^\s*(?:if|else-if|else|for|while)\b/m,
    className: "keyword",
    relevance: 10,
  };

  const markoEventAttribute = {
    begin: /\bon-(?:[\w.-]+|\[[\w.-]+\])(?=[=(\s/>])/,
    className: "variable",
    relevance: 5,
  };

  // `input`/`state`/`out` are Marko's implicit template-scope bindings
  // (component input props, component state, and the output stream),
  // provided by the framework rather than user code, so they're classed as
  // "built_in" to keep them visually distinct from control-flow keywords
  // like if/else/for while still standing out from plain identifiers.
  const markoImplicitVariable = {
    className: "built_in",
    begin: /\b(?:input|state|out)\b/,
    relevance: 0,
  };

  // Marko's concise syntax omits angle brackets: a line beginning with an
  // identifier (after indentation) is itself a tag, e.g. `input type="text"`.
  // The underlying "html" subLanguage never sees a `<`, so it never
  // recognizes the tag name or its attributes without help from these rules.
  // A line only counts as a concise tag when it carries some tag-like marker
  // (an attribute, an event handler, a self-close, or a `--` text marker, or
  // nothing else at all) so that plain text content nested inside a
  // full `<tag>...</tag>` block isn't mistaken for one.
  const markoConciseInterpolation = {
    begin: /\$\{/,
    end: /\}/,
    subLanguage: "javascript",
    relevance: 0,
    contains: [markoImplicitVariable],
  };

  const markoConciseAttrValue = {
    begin: /=/,
    end: /(?=[\s/)]|--|$)/,
    excludeBegin: true,
    relevance: 0,
    contains: [
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      markoConciseInterpolation,
      markoImplicitVariable,
    ],
  };

  const markoConciseAttrName = {
    className: "attr",
    begin: /\b[a-zA-Z][\w-]*(?==(?!=))/,
    relevance: 0,
  };

  const markoConciseAttrArgs = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    contains: [
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      markoConciseInterpolation,
    ],
  };

  const markoConciseTag = {
    className: "tag",
    begin: MARKO_CONCISE_TAG_BEGIN,
    end: /(?=--|\/[ \t]*$|$)/m,
    relevance: 0,
    contains: [
      {
        className: "name",
        begin: new RegExp(MARKO_TAG_NAME),
        relevance: 0,
        starts: {
          endsWithParent: true,
          relevance: 0,
          contains: [
            markoEventAttribute,
            markoConciseAttrArgs,
            markoConciseAttrName,
            markoConciseAttrValue,
          ],
        },
      },
    ],
  };

  // Top-level `import` / `export` / `static` statements and the `$ ` inline
  // form are JavaScript lines. Without this the concise-tag rule read
  // `export const limit = 1;` as a tag named `export` (the line carries an
  // `=`) and left `import ...` as plain text.
  const markoTopLevelStatement = {
    begin: /^(?=(?:import|export|static)\b|\$\s)/m,
    end: /$/,
    subLanguage: "javascript",
    relevance: 0,
  };

  // Everything after a tag name is the same grammar in HTML and concise
  // mode, so the HTML-mode tag below reuses the concise attribute rules.
  // The one difference is that an unquoted value ends at the tag's own `>`
  // as well (`<if=count>`); in concise mode `>` is never a terminator.
  // Fresh objects per use: hljs bakes `endsWithParent` into the first parent
  // a mode is compiled under.
  const markoHtmlAttrValue = {
    ...markoConciseAttrValue,
    end: /(?=[\s/>)]|--|$)/,
  };

  const createTagBody = () => ({
    endsWithParent: true,
    relevance: 0,
    contains: [
      // `<let/count=0/>` tag variable (Marko 6), `<div/ref>`.
      { className: "variable", begin: /\/[a-zA-Z_$][\w$]*/ },
      // `<for|item, i| of=items>` tag parameters.
      { className: "params", begin: /\|/, end: /\|/ },
      markoEventAttribute,
      markoConciseAttrArgs,
      markoConciseAttrName,
      markoHtmlAttrValue,
    ],
  });

  // Marko-only tag heads the html sublanguage cannot parse, so they used to
  // render as plain text: `<if=cond>`, `<for|item| of=items>`, tag
  // variables `<let/count=0/>`, attribute tags `<@then|user|>` and
  // `<div.card#main>` shorthand. Ordinary `<div class="x">` tags never
  // match the lookahead and stay with the html sublanguage.
  const markoHtmlTag = {
    className: "tag",
    // biome-ignore lint/complexity/useRegexLiterals: `(?=` and `[|=(]` in this lookahead confuse biome's regex-literal rewriter
    begin: new RegExp(
      String.raw`<\/?(?=@|(?:if|else-if|else|for|while)\b|[a-zA-Z][\w-]*(?:[.#][\w-]+|\/[a-zA-Z_$]|[|=(]))`,
    ),
    end: /\/?>/,
    relevance: 5,
    contains: [
      {
        className: "keyword",
        begin: /(?:if|else-if|else|for|while)\b/,
        starts: createTagBody(),
      },
      {
        className: "name",
        begin: new RegExp(`@?${MARKO_TAG_NAME}`),
        relevance: 0,
        starts: createTagBody(),
      },
    ],
  };

  return {
    name: "Marko",
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      markoControlFlow,
      markoEventAttribute,
      {
        begin: SCRIPT_TS_BEGIN,
        end: /<\/script>/gm,
        subLanguage: "typescript",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: SCRIPT_JS_BEGIN,
        end: /<\/script>/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        // Not anchored to line starts: `<style>.a { }</style>` on one line
        // is valid, and an anchored `end` never matched it, so the css mode
        // swallowed the rest of the document.
        begin: /<style[^>]*>/,
        end: /<\/style>/,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /\$\{/,
        end: /\}/,
        subLanguage: "javascript",
        relevance: 10,
        contains: [markoImplicitVariable],
      },
      {
        begin: /^class\s*\{/m,
        end: /^\}/m,
        subLanguage: "javascript",
        excludeEnd: true,
        relevance: 100,
      },
      markoTopLevelStatement,
      markoHtmlTag,
      markoConciseTag,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("typescript", typescriptRegister);
  hljs.registerLanguage("javascript", javascriptRegister);
  hljs.registerLanguage("css", cssRegister);
  return defineMarko(hljs);
}

export const marko = { name: "marko", register };
export default marko;
