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

  // Balances a bare (non `$`/`%`-prefixed) `{...}` object/map literal nested
  // inside an interpolation, e.g. `${merge(local.tags, { Name = "x" })}`.
  // Without this, INTERPOLATION's own `end: /\}/` would match the literal's
  // closing brace instead of the interpolation's.
  const NESTED_BRACES = {
    begin: /\{/,
    end: /\}/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /[$%]\{/,
    end: /\}/,
    keywords: { keyword: HCL_KEYWORDS, literal: HCL_LITERALS },
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      { className: "built_in", begin: /\b[a-z_][\w-]*(?=\()/ },
      NESTED_BRACES,
      "self",
    ]),
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
  };

  const HEREDOC = hljs.END_SAME_AS_BEGIN({
    className: "string",
    begin: /<<-?\s*(\w+)\s*\n/,
    end: /^\s*(\w+)\s*$/,
    contains: [INTERPOLATION],
    relevance: 10,
  });

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
