import jsonRegister from "highlight.js/lib/languages/json";
import xmlRegister from "highlight.js/lib/languages/xml";

const LIQUID_KEYWORDS = {
  keyword:
    "if elsif else endif unless endunless case when endcase for endfor in " +
    "break continue cycle tablerow endtablerow assign capture endcapture " +
    "increment decrement include render section layout liquid echo with as " +
    "empty blank and or not contains comment endcomment raw endraw limit " +
    "offset reversed range " +
    // Shopify theme tags.
    "schema endschema javascript endjavascript stylesheet endstylesheet " +
    "style endstyle sections form endform paginate endpaginate content_for " +
    "doc enddoc",
  literal: "true false nil null",
};

const LIQUID_LITERALS = { literal: LIQUID_KEYWORDS.literal };

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

  const TAG_OPEN = /\{%-?\s*/;
  const TAG_CLOSE = /\s*-?%\}/;

  // `{% raw %}...{% endraw %}`: the body is literal text, so no nested
  // `{{ }}` / `{% %}` is parsed until the closing tag.
  const RAW = {
    begin: [TAG_OPEN, /raw/, TAG_CLOSE],
    beginScope: { 1: "template-tag", 2: "keyword", 3: "template-tag" },
    end: /\{%-?\s*endraw\s*-?%\}/,
    endScope: "template-tag",
    relevance: 0,
  };

  // `{% schema %}...{% endschema %}` (Shopify sections): the body is JSON.
  // The mode stops just before `{% endschema %}` so the ordinary tag rule
  // styles that closing tag (and its keyword) as usual.
  const SCHEMA = {
    begin: [TAG_OPEN, /schema/, TAG_CLOSE],
    beginScope: { 1: "template-tag", 2: "keyword", 3: "template-tag" },
    end: /(?=\{%-?\s*endschema\s*-?%\})/,
    subLanguage: "json",
    relevance: 0,
  };

  return {
    name: "Liquid",
    aliases: ["liquid"],
    subLanguage: "xml",
    contains: [
      hljs.COMMENT(/\{%-?\s*comment\s*-?%\}/, /\{%-?\s*endcomment\s*-?%\}/),
      // `{% doc %}` (LiquidDoc) bodies are documentation, never rendered.
      hljs.COMMENT(/\{%-?\s*doc\s*-?%\}/, /\{%-?\s*enddoc\s*-?%\}/),
      // Liquid 5.4 inline comments: `{% # ... %}`.
      hljs.COMMENT(/\{%-?\s*#/, /-?%\}/),
      RAW,
      SCHEMA,
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
        keywords: LIQUID_LITERALS,
        contains: [STRING, hljs.NUMBER_MODE, FILTER],
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("xml", xmlRegister);
  hljs.registerLanguage("json", jsonRegister);
  return defineLiquid(hljs);
}

export const liquid = { name: "liquid", register };
export default liquid;
