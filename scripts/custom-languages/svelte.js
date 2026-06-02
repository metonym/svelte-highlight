import typescriptRegister from "highlight.js/lib/languages/typescript";
import html from "./html.js";

const RUNE_NAMES = "state|derived|effect|props|bindable|inspect|host";
const RUNE_SUFFIXES = "raw|snapshot|by|eager";
const SVELTE_DIRECTIVES =
  "on|bind|use|transition|in|out|animate|class|style|let";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSvelte(hljs) {
  const runePattern = {
    begin: new RegExp(
      String.raw`\$(?:${RUNE_NAMES})(?:\.(?:${RUNE_SUFFIXES}))?(?=\s|\(|,|;|\)|\}|$)`,
    ),
    className: "keyword",
    relevance: 10,
  };

  const storeSubscriptionPattern = {
    begin: new RegExp(String.raw`\$(?!${RUNE_NAMES})[a-zA-Z_][\w-]*\s*\(`),
    className: "title function_",
    endsWithParent: true,
    variants: [
      {
        begin: new RegExp(String.raw`\$(?!${RUNE_NAMES})[a-zA-Z_][\w-]*\s*\(`),
        end: /\(/,
        returnBegin: true,
        excludeEnd: true,
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
        begin:
          /<script(?:\s+[^>]*context=["']module["']|\s+module)(?![^>]*lang=["']ts["'])[^>]*>/gm,
        end: /<\/script>/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
        contains: commonPatterns,
      },
      {
        begin: /<script(?!.*lang=["']ts["'])[^>]*>/gm,
        end: /<\/script>/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
        contains: commonPatterns,
      },
      {
        begin: /<script\s+lang=["']ts["'][^>]*>/gm,
        end: /<\/script>/gm,
        subLanguage: "typescript",
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
        subLanguage: "javascript",
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
