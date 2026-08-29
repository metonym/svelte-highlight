const JSONATA_KEYWORDS = "function";

const JSONATA_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineJsonata(hljs) {
  const COMMENT = hljs.COMMENT(/\/\*/, /\*\//);

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // Backtick-quoted field names for identifiers with spaces: `Order Item`
  const QUOTED_FIELD = {
    className: "property",
    begin: /`/,
    end: /`/,
  };

  const NUMBER = {
    className: "number",
    begin: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  // Listed ahead of VARIABLE so a known built-in like `$sum` wins the tie at
  // the same starting `$` - see jq.js's INTERPOLATION/BACKSLASH_ESCAPE note.
  const BUILT_IN = {
    className: "built_in",
    begin:
      /\$(?:sum|count|max|min|average|map|filter|sift|each|keys|lookup|merge|append|exists|sort|reverse|shuffle|zip|single|string|length|substringBefore|substringAfter|substring|uppercase|lowercase|trim|pad|contains|split|join|match|replace|eval|formatNumber|formatBase|formatInteger|parseInteger|number|boolean|not|type|now|millis|fromMillis|toMillis|power|sqrt|random|round|abs|floor|ceil|error|assert|distinct|flatten|range|reduce|base64encode|base64decode|encodeUrl|decodeUrl)\b/,
    relevance: 0,
  };

  const VARIABLE = {
    className: "variable",
    begin: /\$\$?[A-Za-z_]\w*|\$/,
    relevance: 0,
  };

  const FIELD = {
    // Dotted field access: Account.Order, .Product
    className: "property",
    begin: /\.[A-Za-z_]\w*/,
    relevance: 0,
  };

  const BRACKET_FIELD = {
    // Predicates and array indices: Order[0], Product[Price > 10]
    className: "property",
    begin: /\[/,
    end: /\]/,
    contains: [STRING, NUMBER],
    relevance: 0,
  };

  return {
    name: "JSONata",
    aliases: ["jsonata"],
    keywords: {
      keyword: JSONATA_KEYWORDS,
      literal: JSONATA_LITERALS,
    },
    contains: [
      COMMENT,
      STRING,
      QUOTED_FIELD,
      BUILT_IN,
      VARIABLE,
      BRACKET_FIELD,
      FIELD,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineJsonata(hljs);
}

export const jsonata = { name: "jsonata", register };
export default jsonata;
