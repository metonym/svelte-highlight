const MODELFILE_INSTRUCTIONS =
  "FROM|PARAMETER|TEMPLATE|SYSTEM|ADAPTER|LICENSE|MESSAGE|REQUIRES|RENDERER|PARSER|DRAFT";

const MODELFILE_PARAMS =
  "temperature|num_ctx|top_k|top_p|min_p|repeat_penalty|repeat_last_n|stop|seed|num_predict|num_gpu|num_thread|mirostat|mirostat_eta|mirostat_tau";

const MODELFILE_ROLES = "system|user|assistant";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineModelfile(hljs) {
  const TEMPLATE_VAR = {
    className: "template-variable",
    begin: /\{\{/,
    end: /\}\}/,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const TRIPLE_STRING = {
    className: "string",
    begin: /"""/,
    end: /"""/,
    contains: [TEMPLATE_VAR],
  };

  const PARAMETER_LINE = {
    begin: [/^PARAMETER/, /\s+/, new RegExp(MODELFILE_PARAMS)],
    beginScope: { 1: "keyword", 3: "attr" },
    relevance: 5,
  };

  const MESSAGE_LINE = {
    begin: [/^MESSAGE/, /\s+/, new RegExp(MODELFILE_ROLES)],
    beginScope: { 1: "keyword", 3: "literal" },
    relevance: 5,
  };

  const FROM_LINE = {
    begin: [/^FROM\b/, /\s+/, /[^\n]+/],
    beginScope: { 1: "keyword", 3: "string" },
    // Keep this at 0: `from employees` in PRQL is a FROM line under
    // case-insensitive matching, and relevance 5 made Modelfile win
    // auto-detect on PRQL samples. PARAMETER/MESSAGE still score 5.
    relevance: 0,
  };

  const INSTRUCTION = {
    className: "keyword",
    begin: new RegExp(`^(?:${MODELFILE_INSTRUCTIONS})\\b`),
    relevance: 0,
  };

  return {
    name: "Modelfile",
    aliases: ["ollama"],
    case_insensitive: true,
    contains: [
      hljs.HASH_COMMENT_MODE,
      TRIPLE_STRING,
      STRING,
      PARAMETER_LINE,
      MESSAGE_LINE,
      FROM_LINE,
      INSTRUCTION,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineModelfile(hljs);
}

export const modelfile = { name: "modelfile", register };
export default modelfile;
