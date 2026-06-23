const BICEP_KEYWORDS =
  "targetScope resource module param var output existing for in if func type import metadata assert provider extends with using as";

const BICEP_TYPES = "string int bool object array secureString secureObject";

const BICEP_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBicep(hljs) {
  const NUMBER = {
    className: "number",
    begin: /\b\d+\b/,
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    keywords: { keyword: BICEP_KEYWORDS, literal: BICEP_LITERALS },
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /'''/, end: /'''/ },
      {
        begin: /'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  const DECORATOR = {
    className: "meta",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const RESOURCE_TYPE = {
    className: "type",
    begin: /'[A-Za-z][\w.]+\/[\w./]+@[\d-]+'/,
    relevance: 0,
  };

  return {
    name: "Bicep",
    aliases: ["bicep"],
    keywords: {
      keyword: BICEP_KEYWORDS,
      type: BICEP_TYPES,
      literal: BICEP_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      DECORATOR,
      RESOURCE_TYPE,
      STRING,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBicep(hljs);
}

export const bicep = { name: "bicep", register };
export default bicep;
