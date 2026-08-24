const LUAU_KEYWORDS =
  "and break do else elseif end for function goto if in local not or " +
  "repeat return then until while continue export type typeof";

const LUAU_LITERALS = "true false nil";

const LUAU_TYPES =
  "any never unknown string number boolean thread buffer vector userdata";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLuau(hljs) {
  const STRING = {
    className: "string",
    variants: [
      hljs.END_SAME_AS_BEGIN({
        begin: /\[(=*)\[/,
        end: /\](=*)\]/,
      }),
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

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0x[0-9a-fA-F]+\b/ },
      { begin: /\b0b[01]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
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
    contains: [COMMENT, EXPORT_TYPE, STRING, FUNCTION, TYPE_ASSERT, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineLuau(hljs);
}

export const luau = { name: "luau", register };
export default luau;
