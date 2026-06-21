import xmlRegister from "highlight.js/lib/languages/xml";

const LIQUID_KEYWORDS =
  "if elsif else endif unless endunless case when endcase for endfor in " +
  "break continue cycle tablerow endtablerow assign capture endcapture " +
  "increment decrement include render section layout liquid echo with as " +
  "empty blank and or not contains comment endcomment raw endraw limit " +
  "offset reversed range";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLiquid(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/ },
      { begin: /'/, end: /'/ },
    ],
  };

  const FILTER = {
    begin: /\|\s*/,
    contains: [{ className: "built_in", begin: /[a-z_]\w*/ }],
    relevance: 0,
  };

  return {
    name: "Liquid",
    aliases: ["liquid"],
    subLanguage: "xml",
    contains: [
      {
        className: "template-tag",
        begin: /\{%-?/,
        end: /-?%\}/,
        keywords: LIQUID_KEYWORDS,
        contains: [STRING, hljs.NUMBER_MODE, FILTER],
      },
      {
        className: "template-variable",
        begin: /\{\{-?/,
        end: /-?\}\}/,
        contains: [STRING, hljs.NUMBER_MODE, FILTER],
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("xml", xmlRegister);
  return defineLiquid(hljs);
}

export const liquid = { name: "liquid", register };
export default liquid;
