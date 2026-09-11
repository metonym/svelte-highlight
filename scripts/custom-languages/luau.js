const LUAU_KEYWORDS =
  "and break do else elseif end for function goto if in local not or " +
  "repeat return then until while continue export type typeof";

const LUAU_LITERALS = "true false nil";

const LUAU_TYPES =
  "any never unknown string number boolean thread buffer vector userdata";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLuau(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0x[0-9a-fA-F_]+\b/ },
      { begin: /\b0b[01_]+\b/ },
      { begin: /\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const FLOOR_DIV = {
    className: "operator",
    begin: /\/\//,
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    contains: [NUMBER, FLOOR_DIV],
  };

  const STRING = {
    className: "string",
    variants: [
      hljs.END_SAME_AS_BEGIN({
        begin: /\[(=*)\[/,
        end: /\](=*)\]/,
      }),
      {
        begin: /`/,
        end: /`/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const COMMENT = {
    className: "comment",
    variants: [
      hljs.END_SAME_AS_BEGIN({
        begin: /--\[(=*)\[/,
        end: /\](=*)\]/,
      }),
      { begin: /--/, end: /$/ },
    ],
  };

  const ATTRIBUTE = {
    className: "meta",
    variants: [
      { begin: /@[A-Za-z_]\w*/, relevance: 10 },
      {
        begin: /@\[/,
        end: /\]/,
        contains: [STRING],
        relevance: 10,
      },
    ],
  };

  const FUNCTION = {
    beginKeywords: "function",
    end: /\(/,
    excludeEnd: true,
    contains: [
      {
        className: "title.function",
        begin: /[A-Za-z_][\w.]*/,
        relevance: 0,
      },
    ],
  };

  const TYPE_ASSERT = {
    className: "operator",
    begin: /::/,
    relevance: 5,
  };

  const EXPORT_TYPE = {
    className: "keyword",
    begin: /\bexport\s+type\b/,
    relevance: 10,
  };

  return {
    name: "Luau",
    aliases: ["luau"],
    keywords: {
      keyword: LUAU_KEYWORDS,
      literal: LUAU_LITERALS,
      type: LUAU_TYPES,
    },
    contains: [
      COMMENT,
      ATTRIBUTE,
      EXPORT_TYPE,
      STRING,
      FUNCTION,
      TYPE_ASSERT,
      FLOOR_DIV,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineLuau(hljs);
}

export const luau = { name: "luau", register };
export default luau;
