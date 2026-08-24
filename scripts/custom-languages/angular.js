import javascriptRegister from "highlight.js/lib/languages/javascript";
import html from "./html.js";

const ANGULAR_BLOCKS =
  "if|else|for|empty|switch|case|default|defer|placeholder|loading|error";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineAngular(hljs) {
  // `@else if` is one directive; list it before the shorter `@else`.
  const controlFlow = {
    begin: new RegExp(String.raw`@(?:else\s+if|${ANGULAR_BLOCKS})\b`),
    className: "keyword",
    relevance: 10,
  };

  const structuralDirective = {
    begin: /\*[\w-]+/,
    className: "keyword",
    relevance: 10,
  };

  // `[(ngModel)]` must precede `[prop]` so the opening `[(` is not split.
  const twoWayBinding = {
    begin: /\[\([\w.-]+\)\]/,
    className: "variable",
    relevance: 10,
  };

  const propertyBinding = {
    begin: /\[[\w.-]+\]/,
    className: "variable",
    relevance: 5,
  };

  const eventBinding = {
    begin: /\([\w.-]+\)(?=\s*=)/,
    className: "variable",
    relevance: 5,
  };

  const templateRef = {
    begin: /#[A-Za-z_]\w*/,
    className: "symbol",
    relevance: 5,
  };

  const interpolation = {
    begin: /\{\{/,
    end: /\}\}/,
    subLanguage: "javascript",
    relevance: 10,
  };

  return {
    name: "Angular",
    aliases: ["ng", "angular-html"],
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      controlFlow,
      structuralDirective,
      twoWayBinding,
      propertyBinding,
      eventBinding,
      templateRef,
      interpolation,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("javascript", javascriptRegister);
  return defineAngular(hljs);
}

export const angular = { name: "angular", register };
export default angular;
