import cssRegister from "highlight.js/lib/languages/css";
import javascriptRegister from "highlight.js/lib/languages/javascript";
import lessRegister from "highlight.js/lib/languages/less";
import scssRegister from "highlight.js/lib/languages/scss";
import stylusRegister from "highlight.js/lib/languages/stylus";
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
const STYLE_SCSS_BEGIN = /<style(?=[^>]*\slang=["'](?:scss|sass)["'])[^>]*>/gm;
const STYLE_LESS_BEGIN = /<style(?=[^>]*\slang=["']less["'])[^>]*>/gm;
const STYLE_STYLUS_BEGIN = /<style(?=[^>]*\slang=["']stylus["'])[^>]*>/gm;
const STYLE_CSS_BEGIN =
  /<style(?![^>]*\slang=["'](?:scss|sass|less|stylus)["'])[^>]*>/gm;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineVue(hljs) {
  // Match any `v-*` directive, not just the built-in list, so custom
  // user-registered directives (e.g. `v-focus`, `v-tooltip`) are recognized
  // too.
  const vueDirective = {
    // Longhand directives may carry an explicit argument (`v-bind:href`,
    // `v-on:click`, `v-slot:name`, including the dynamic-argument form
    // `v-bind:[key]`) followed by any number of `.modifier`s.
    begin: /\bv-[\w-]+(?::(?:[\w-]+|\[[\w-]+\]))?(?:\.[\w-]+)*(?==|\s|>)/,
    className: "keyword",
    relevance: 10,
  };

  const vueEventAttribute = {
    begin: /@(?:[\w.$-]+|\[[\w.$-]+\])(?==)/,
    className: "variable",
    relevance: 5,
  };

  const vueBindShorthand = {
    begin: /:(?:[\w.$-]+|\[[\w.$-]+\])(?==)/,
    className: "variable",
    relevance: 5,
  };

  const vueSlotShorthand = {
    begin: /#(?:[\w.$-]+|\[[\w.$-]+\])(?==)/,
    className: "variable",
    relevance: 5,
  };

  return {
    name: "Vue",
    aliases: ["vue-sfc"],
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      vueDirective,
      vueEventAttribute,
      vueBindShorthand,
      vueSlotShorthand,
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
        begin: STYLE_SCSS_BEGIN,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "scss",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: STYLE_LESS_BEGIN,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "less",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: STYLE_STYLUS_BEGIN,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "stylus",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: STYLE_CSS_BEGIN,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /\{\{/,
        end: /\}\}/,
        subLanguage: "javascript",
        relevance: 10,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("typescript", typescriptRegister);
  hljs.registerLanguage("javascript", javascriptRegister);
  hljs.registerLanguage("css", cssRegister);
  hljs.registerLanguage("scss", scssRegister);
  hljs.registerLanguage("less", lessRegister);
  hljs.registerLanguage("stylus", stylusRegister);
  return defineVue(hljs);
}

export const vue = { name: "vue", register };
export default vue;
