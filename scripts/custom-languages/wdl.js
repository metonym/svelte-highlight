const WDL_KEYWORDS =
  "if|0 then|0 else|0 alias|0 as|0 in|0 left|0 right|0 struct|0 object|0 " +
  "import|0 version|0 true|0 false|0";

const WDL_TYPES =
  "String|0 Int|0 Float|0 Boolean|0 File|0 Array|0 Map|0 Pair|0 Object|0";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineWdl(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /~\{|\$\{/,
    end: /\}/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  // The `command <<< >>>` heredoc body is a shell script; only its
  // `~{}`/`${}` substitutions are WDL syntax, so nest INTERPOLATION only.
  const COMMAND_HEREDOC = {
    className: "string",
    begin: /<<</,
    end: />>>/,
    contains: [INTERPOLATION],
  };

  // The structural anchor: `task Name {` / `workflow Name {`.
  const TASK_OR_WORKFLOW_DECL = {
    begin: [/\b(?:task|workflow)\b/, /\s+/, /[A-Za-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 10,
  };

  // `command <<<` opens the heredoc body above; `command` itself still
  // needs its own keyword span since COMMAND_HEREDOC begins right after it.
  const COMMAND_KEYWORD = {
    className: "keyword",
    begin: /\bcommand\b(?=\s*<<<)/,
    relevance: 10,
  };

  // `input {`/`output {`/`runtime {`/`meta {`/`parameter_meta {` -- relevance
  // 0 since the words themselves (input, output, meta) are common outside
  // WDL (e.g. HCL's `output "x" {}` uses a quoted label, not this shape).
  const SECTION = {
    className: "keyword",
    begin: /\b(?:input|output|runtime|meta|parameter_meta)\b(?=\s*\{)/,
    relevance: 0,
  };

  const SCATTER = {
    className: "keyword",
    begin: /\bscatter\b(?=\s*\()/,
    relevance: 10,
  };

  const CALL = {
    className: "keyword",
    begin: /\bcall\b/,
    relevance: 10,
  };

  return {
    name: "WDL",
    keywords: {
      keyword: WDL_KEYWORDS,
      built_in: WDL_TYPES,
      literal: "true false",
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      STRING,
      TASK_OR_WORKFLOW_DECL,
      COMMAND_KEYWORD,
      COMMAND_HEREDOC,
      SECTION,
      SCATTER,
      CALL,
      {
        className: "number",
        begin: /\b\d+(?:\.\d+)?\b/,
        relevance: 0,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineWdl(hljs);
}

export const wdl = { name: "wdl", register };
export default wdl;
