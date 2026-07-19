import typescriptRegister from "highlight.js/lib/languages/typescript";
import html from "./html.js";

const RUNE_NAMES = "state|derived|effect|props|bindable|inspect|host";
const RUNE_SUFFIXES =
  "raw|snapshot|by|eager|pre|tracking|pending|root|id|trace";
const SVELTE_DIRECTIVES =
  "on|bind|use|transition|in|out|animate|class|style|let";
const TS_LANG = "(?:ts|typescript)";
const SCRIPT_TS_BEGIN = new RegExp(
  String.raw`<script(?=[^>]*\slang=["']${TS_LANG}["'])[^>]*>`,
  "m",
);
const SCRIPT_JS_MODULE_BEGIN = new RegExp(
  String.raw`<script(?=[^>]*(?:\scontext=["']module["']|\smodule\b))(?![^>]*\slang=["']${TS_LANG}["'])[^>]*>`,
  "m",
);
const SCRIPT_JS_BEGIN = new RegExp(
  String.raw`<script(?![^>]*\slang=["']${TS_LANG}["'])[^>]*>`,
  "m",
);

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSvelte(hljs) {
  const runePattern = {
    begin: new RegExp(
      String.raw`\$(?:${RUNE_NAMES})(?:\.(?:${RUNE_SUFFIXES}))?(?=\s|\(|,|;|\)|\}|<|$)`,
    ),
    className: "keyword",
    relevance: 10,
  };

  // `$store` auto-subscription: Svelte treats a leading `$` on an
  // identifier (that isn't a rune) as a store subscription, whether it's
  // called as a function (`$store(...)`) or referenced bare, e.g. `{$count}`,
  // `$user.name`, `$count += 1`. The bare form is the common idiom and must
  // not require a trailing `(` to be recognized.
  const storeSubscriptionPattern = {
    // JS/TS identifiers can't contain `-`, so the name itself uses `\w*`
    // (not `[\w-]*`); without this, `{$count-1}` (no spaces) was swallowed
    // whole as a single `$count-1` variable instead of `$count`, `-`, `1`.
    variants: [
      {
        begin: new RegExp(String.raw`\$(?!${RUNE_NAMES})[a-zA-Z_]\w*\s*\(`),
        end: /\(/,
        className: "title function_",
        endsWithParent: true,
        returnBegin: true,
        excludeEnd: true,
        relevance: 10,
      },
      {
        begin: new RegExp(String.raw`\$(?!${RUNE_NAMES})[a-zA-Z_]\w*\b`),
        className: "variable",
        relevance: 10,
      },
    ],
  };

  const svelteDirective = {
    begin: new RegExp(String.raw`\b(?:${SVELTE_DIRECTIVES}):`),
    className: "variable",
    relevance: 10,
  };

  const svelteEventAttribute = {
    begin: /\bon[a-zA-Z][a-zA-Z0-9]*(?==)/,
    className: "variable",
    relevance: 5,
  };

  const expressionPatterns = [
    hljs.COMMENT(/\/\*/, /\*\//),
    { begin: /\{/, end: /\}/, skip: true },
    {
      begin: /:(else if|else|then|catch)\b/,
      className: "keyword",
      relevance: 10,
    },
    {
      begin: /[#@/][a-zA-Z_][\w-]*/,
      className: "keyword",
      relevance: 10,
    },
    runePattern,
    storeSubscriptionPattern,
  ];

  const commonPatterns = [runePattern, storeSubscriptionPattern];

  return {
    name: "Svelte",
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      svelteDirective,
      svelteEventAttribute,
      {
        begin: SCRIPT_TS_BEGIN,
        end: /<\/script>/gm,
        subLanguage: "typescript",
        excludeBegin: true,
        excludeEnd: true,
        contains: commonPatterns,
      },
      {
        begin: SCRIPT_JS_MODULE_BEGIN,
        end: /<\/script>/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
        contains: commonPatterns,
      },
      {
        begin: SCRIPT_JS_BEGIN,
        end: /<\/script>/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
        contains: commonPatterns,
      },
      {
        begin: /^(\s*)(<style[^>]*>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /\{/,
        end: /\}/,
        subLanguage: "typescript",
        contains: expressionPatterns,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("typescript", typescriptRegister);
  return defineSvelte(hljs);
}

export const svelte = { name: "svelte", register };
export default svelte;
