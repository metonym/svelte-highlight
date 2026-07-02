const HCL_BLOCK_TYPES =
  "resource data variable output module provider terraform locals " +
  "provisioner connection backend dynamic lifecycle moved import check " +
  "removed";

const HCL_KEYWORDS =
  "for in if else endif endfor for_each count depends_on " +
  "source version providers";

const HCL_LITERALS = "true false null";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHcl(hljs) {
  const NUMBER = {
    className: "number",
    begin: /\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /[$%]\{/,
    end: /\}/,
    keywords: { keyword: HCL_KEYWORDS, literal: HCL_LITERALS },
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      { className: "built_in", begin: /\b[a-z_][\w-]*(?=\()/ },
      "self",
    ]),
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
  };

  const HEREDOC = {
    className: "string",
    begin: /<<-?\s*(["']?)(\w+)\1/,
    end: /^\s*\w+\s*$/,
    contains: [INTERPOLATION],
    relevance: 10,
  };

  return {
    name: "HCL",
    aliases: ["terraform", "tf"],
    keywords: {
      keyword: HCL_KEYWORDS,
      literal: HCL_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      HEREDOC,
      STRING,
      NUMBER,
      {
        begin: [
          new RegExp(
            String.raw`\b(?:${HCL_BLOCK_TYPES.split(" ").join("|")})\b`,
          ),
          /\s+/,
        ],
        beginScope: { 1: "keyword" },
        end: /(?=\{)/,
        contains: [{ className: "string", begin: /"/, end: /"/ }],
      },
      {
        className: "attr",
        begin: /[A-Za-z_][\w-]*(?=\s*=(?!=))/,
        relevance: 0,
      },
      { className: "built_in", begin: /\b[a-z_][\w-]*(?=\()/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineHcl(hljs);
}

export const hcl = { name: "hcl", register };
export default hcl;
