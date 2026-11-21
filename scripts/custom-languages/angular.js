import javascriptRegister from "highlight.js/lib/languages/javascript";
import html from "./html.js";

const ANGULAR_BLOCKS =
  "if|else|for|empty|switch|case|default|defer|placeholder|loading|error";

// Words that open a clause inside block parameters: `track` in `@for`,
// triggers in `@defer`, timings in `@placeholder` and `@loading`.
const BLOCK_PARAM_KEYWORDS = "track|on|when|prefetch|hydrate|minimum|after";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineAngular(hljs) {
  // `@else if` is one directive; list it before the shorter `@else`.
  const controlFlowKeyword = new RegExp(
    String.raw`@(?:else\s+if|${ANGULAR_BLOCKS})\b`,
  );

  const controlFlow = {
    begin: controlFlowKeyword,
    className: "keyword",
    relevance: 10,
  };

  // A clause keyword opens a clause (after `(`, `;`, `prefetch`, or
  // `hydrate`) and is followed by an operand, so `@if (on)` and
  // `@if (on && x)` keep `on` as a variable. `never` only follows `hydrate`.
  // Each match consumes the clause start, so no lookbehind is needed (older
  // Safari cannot compile one).
  const clauseKeyword = new RegExp(
    String.raw`(?:${BLOCK_PARAM_KEYWORDS})\b(?=\s+[\w$(!"'\`])(?!\s+(?:of|in|as|instanceof)\b)`,
  );
  const triggerClause = [
    /(?:prefetch|hydrate)\b/,
    /\s+/,
    /(?:on|when|never)\b/,
  ];

  // `; track item.id`, `; prefetch on idle`, `; hydrate never`.
  const nextClause = [
    {
      begin: [/;\s*/, ...triggerClause],
      beginScope: { 2: "keyword", 4: "keyword" },
    },
    { begin: [/;\s*/, clauseKeyword], beginScope: { 2: "keyword" } },
  ];

  // `@if (expr)`, `@for (item of items; track item.id)`, `@defer (on idle)`.
  // The parameters are JavaScript; nested parens are balanced so the mode
  // closes at its own `)`. The variants also claim a keyword that opens the
  // first clause.
  const openParams = [controlFlowKeyword, /\s*\(\s*/];
  const blockParams = {
    variants: [
      {
        begin: [...openParams, ...triggerClause],
        beginScope: { 1: "keyword", 3: "keyword", 5: "keyword" },
      },
      {
        begin: [...openParams, clauseKeyword],
        beginScope: { 1: "keyword", 3: "keyword" },
      },
      { begin: openParams, beginScope: { 1: "keyword" } },
    ],
    end: /\)/,
    excludeEnd: true,
    subLanguage: "javascript",
    contains: [
      ...nextClause,
      {
        begin: /\(/,
        end: /\)/,
        skip: true,
        contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
          "self",
        ]),
      },
    ],
    relevance: 10,
  };

  // `@let name = expr;` (Angular 18.1, stable in 19). The initializer is
  // JavaScript up to the `;`, or the end of the line if the `;` is missing.
  const letDeclaration = {
    begin: [/@let\b/, /\s+/, /[A-Za-z_$][\w$]*/],
    beginScope: { 1: "keyword", 3: "variable" },
    end: /;|$/,
    excludeEnd: true,
    subLanguage: "javascript",
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
      letDeclaration,
      blockParams,
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
