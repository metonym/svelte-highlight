const D2_KEYWORDS =
  "shape style label icon near direction width height tooltip link constraint source-arrowhead target-arrowhead grid-rows grid-columns grid-gap vertical-gap horizontal-gap class classes vars layers scenarios steps suspend unsuspend";

const D2_VALUES =
  "rectangle square page parallelogram document cylinder queue package step callout stored_data person diamond oval circle hexagon cloud text code class sequence_diagram c4-person up down left right none triangle arrow diamond filled-diamond circle filled-circle box cross true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineD2(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      { begin: /'/, end: /'/ },
    ],
  };

  // `|md`, `|go`, or a bare `|` opens a block string closed by a `|` line.
  const BLOCK_STRING = {
    className: "string",
    begin: /\|[\w]*[ \t]*$/,
    end: /^[ \t]*\|[ \t]*$/,
    relevance: 0,
  };

  const CONNECTION = {
    className: "operator",
    begin: /<->|<-|->|--/,
    relevance: 0,
  };

  // Must precede KEY: `suspend model:` would otherwise be one attr token.
  const SUSPEND = {
    className: "keyword",
    begin: /\b(?:suspend|unsuspend)\b/,
    relevance: 0,
  };

  const KEY = {
    className: "attr",
    begin: /[a-zA-Z_][\w -]*(?=\s*:)/,
    relevance: 0,
  };

  const ATTRIBUTE = {
    className: "keyword",
    begin:
      /\.(?:shape|style\.(?:fill|stroke-width|stroke|font-size|bold|italic|underline|opacity|shadow|border-radius|animated|multiple|3d)|style|label|icon|near|direction|width|height|tooltip|link|class)\b/,
    relevance: 0,
  };

  return {
    name: "D2",
    aliases: ["d2"],
    keywords: {
      $pattern: "[a-zA-Z_][\\w-]*",
      keyword: D2_KEYWORDS,
      literal: D2_VALUES,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      BLOCK_STRING,
      STRING,
      INTERPOLATION,
      CONNECTION,
      SUSPEND,
      ATTRIBUTE,
      KEY,
      { className: "number", begin: /\b\d+(?:\.\d+)?\b/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineD2(hljs);
}

export const d2 = { name: "d2", register };
export default d2;
