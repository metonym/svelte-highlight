const JSONNET_KEYWORDS =
  "local function if then else for in import importstr importbin error assert tailstrict";

const JSONNET_LITERALS = "true false null self super";

const JSONNET_BUILTINS =
  "std length type makeArray join split format substr foldl foldr map filter mapWithKey objectFields objectHas mergePatch manifestJson manifestYamlDoc parseJson parseYaml toString prune range";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineJsonnet(hljs) {
  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const TEXT_BLOCK = {
    className: "string",
    begin: /\|\|\|/,
    end: /\|\|\|/,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /@"/, end: /"/ },
      { begin: /@'/, end: /'/ },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const FUNCTION = {
    begin: [/\blocal/, /\s+/, /[a-zA-Z_]\w*/, /\s*(?=\()/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  return {
    name: "Jsonnet",
    aliases: ["jsonnet", "libsonnet"],
    keywords: {
      keyword: JSONNET_KEYWORDS,
      literal: JSONNET_LITERALS,
      built_in: JSONNET_BUILTINS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      TEXT_BLOCK,
      STRING,
      FUNCTION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineJsonnet(hljs);
}

export const jsonnet = { name: "jsonnet", register };
export default jsonnet;
