const NEXTFLOW_KEYWORDS =
  "def|0 include|0 from|0 as|0 params|0 emit|0 publishDir|0 container|0 " +
  "cpus|0 memory|0 time|0 tag|0 label|0 errorStrategy|0 conda|0 cache|0 " +
  "storeDir|0 true|0 false|0 null|0";

const NEXTFLOW_BUILT_INS =
  "Channel|0 fromPath|0 fromFilePairs|0 of|0 map|0 filter|0 collect|0 " +
  "flatten|0 set|0 view|0";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineNextflow(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /'''/,
        end: /'''/,
      },
      {
        begin: /"""/,
        end: /"""/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      {
        begin: /'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  // Matches the `process Name {` structural anchor, not a bare `process`
  // identifier elsewhere (e.g. `def process = launch()`).
  const PROCESS_DECL = {
    begin: [/\bprocess\b/, /\s+/, /[A-Za-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 10,
  };

  // `workflow` is only the anchor when it opens a block, named or anonymous.
  const WORKFLOW_DECL = {
    begin: [/\bworkflow\b/, /\s*/, /[A-Za-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 10,
  };

  const WORKFLOW_MAIN = {
    className: "keyword",
    begin: /\bworkflow\b(?=\s*\{)/,
    relevance: 10,
  };

  // `input:`/`output:`/etc. section openers -- relevance 0 since the words
  // themselves (input, output) are common outside Nextflow.
  const SECTION = {
    className: "keyword",
    begin:
      /\b(?:input|output|script|shell|exec|when|stub|take|main|emit)(?=\s*:)/,
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /\?\.|\?:|\.\.<|\.\.|->|\|/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)?\b/,
    relevance: 0,
  };

  return {
    name: "Nextflow",
    aliases: ["nf"],
    keywords: {
      keyword: NEXTFLOW_KEYWORDS,
      built_in: NEXTFLOW_BUILT_INS,
      literal: "true false null",
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      INTERPOLATION,
      PROCESS_DECL,
      WORKFLOW_MAIN,
      WORKFLOW_DECL,
      SECTION,
      OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineNextflow(hljs);
}

export const nextflow = { name: "nextflow", register };
export default nextflow;
