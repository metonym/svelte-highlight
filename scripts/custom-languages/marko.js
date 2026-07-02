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

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMarko(hljs) {
  const markoControlFlow = {
    begin: /^\s*(?:if|else if|else|for|while)\b/m,
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
    begin:
      /^[ \t]*(?=[a-zA-Z][\w-]*(?:[ \t]*(?:$|--|\/[ \t]*$)|[ \t]+.*[=(]))/m,
    end: /(?=--|\/[ \t]*$|$)/m,
    relevance: 0,
    contains: [
      {
        className: "name",
        begin: /[a-zA-Z][\w-]*/,
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
        begin: /^(\s*)(<style[^>]*>)/gm,
        end: /^(\s*)(<\/style>)/gm,
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
