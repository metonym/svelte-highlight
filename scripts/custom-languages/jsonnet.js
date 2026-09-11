const JSONNET_KEYWORDS =
  "local function if then else for in import importstr importbin error assert tailstrict";

const JSONNET_LITERALS = "true false null self super";

// Only the `std` object itself is a bare built-in; its functions are styled
// through STD_CALL (`std.<name>`) so that a field or parameter that shares a
// function's name (`type: 'ClusterIP'`, `format: 'json'`) stays plain.
const JSONNET_BUILTINS = "std";

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
      { begin: /@"/, end: /"/, contains: [{ begin: /""/, relevance: 0 }] },
      { begin: /@'/, end: /'/, contains: [{ begin: /''/, relevance: 0 }] },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  const FUNCTION = {
    begin: [/\blocal/, /\s+/, /[a-zA-Z_]\w*/, /\s*(?=\()/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  const FIELD_VISIBILITY = {
    className: "operator",
    begin: /\+?:::|\+?::|\+:/,
    relevance: 0,
  };

  // Any `std.<name>` is a standard-library call; the std library grows every
  // release (`std.trim`, `std.sha256`, `std.manifestToml` in 0.20), so the
  // member is matched by shape rather than by a list.
  const STD_CALL = {
    begin: [/\bstd\b/, /\./, /[a-zA-Z_]\w*/],
    beginScope: { 1: "built_in", 3: "built_in" },
    relevance: 0,
  };

  // `$` is the outermost-object reference, the third of the `self`/`super`
  // trio, and can't be a keyword-table entry because it isn't a word.
  const ROOT_REF = {
    className: "literal",
    begin: /\$/,
    relevance: 0,
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
      STD_CALL,
      ROOT_REF,
      FIELD_VISIBILITY,
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
