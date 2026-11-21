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
// A tag's attributes, skipping over quoted values, so a `>` inside a value
// such as `generics="T extends Array<U>"` doesn't end the tag.
const TAG_ATTRS = String.raw`(?:[^>"']|"[^"]*"|'[^']*')*`;
const SCRIPT_GENERICS_BEGIN = new RegExp(
  String.raw`script(?=${TAG_ATTRS}\sgenerics=)`,
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

  const braceSkip = { begin: /\{/, end: /\}/, skip: true };

  // `{#each items as item, i (item.id)}`: TypeScript reads `i (` as a call
  // and styles the last binding as a function title. The `#each` mode hands
  // the rest of the tag to TypeScript, and its `as` mode claims the binding
  // before the key with a plain match. The iterable before `as` keeps its
  // normal highlighting, so `getItems(x)` is still a call.
  const eachBlock = {
    begin: /#each\b/,
    className: "keyword",
    relevance: 10,
    starts: {
      end: /(?=\})/,
      subLanguage: "typescript",
      contains: [
        braceSkip,
        {
          begin: /\bas\b/,
          className: "keyword",
          starts: {
            end: /(?=\})/,
            subLanguage: "typescript",
            contains: [braceSkip, { begin: /[A-Za-z_$][\w$]*(?=\s*\()/ }],
          },
        },
      ],
    },
  };

  // `{#snippet row<T extends Item>(item: T)}`: TypeScript styles a name as
  // a function only when `(` follows it, so a generic snippet's name was
  // left plain. Claim the name here, then hand the rest of the tag to
  // TypeScript as usual.
  const snippetBlock = {
    begin: [/#snippet/, /\s+/, /[A-Za-z_$][\w$]*/],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 10,
    starts: {
      end: /(?=\})/,
      subLanguage: "typescript",
      contains: [braceSkip],
    },
  };

  const expressionPatterns = [
    hljs.COMMENT(/\/\*/, /\*\//),
    eachBlock,
    snippetBlock,
    braceSkip,
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

  // `<script lang="ts" generics="T extends Item">`: the HTML grammar shows
  // the attribute value as one plain string. When `generics` is present,
  // style the tag here so the value can be highlighted as TypeScript. The
  // attribute only works with TypeScript, so the body is TypeScript too.
  /** @param {string} quote */
  const genericsValue = (quote) => ({
    begin: [/generics/, /=/, new RegExp(quote)],
    beginScope: { 1: "attr", 3: "string" },
    end: new RegExp(quote),
    endScope: "string",
    subLanguage: "typescript",
  });
  const scriptWithGenerics = {
    begin: [/</, SCRIPT_GENERICS_BEGIN],
    beginScope: { 2: "name" },
    scope: "tag",
    end: />/,
    relevance: 10,
    contains: [
      genericsValue('"'),
      genericsValue("'"),
      { begin: /[^\s"'=<>/]+/, scope: "attr" },
      { begin: /"/, end: /"/, scope: "string" },
      { begin: /'/, end: /'/, scope: "string" },
    ],
    starts: {
      end: /<\/script>/,
      subLanguage: "typescript",
      excludeEnd: true,
      contains: commonPatterns,
    },
  };

  return {
    name: "Svelte",
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      svelteDirective,
      svelteEventAttribute,
      scriptWithGenerics,
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
        // Not anchored to line starts: `<style>h1 { }</style>` on one line
        // is valid, and an anchored `end` never matched it, so the css mode
        // swallowed the rest of the document.
        begin: /<style[^>]*>/,
        end: /<\/style>/,
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
