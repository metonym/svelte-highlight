const BPFTRACE_KEYWORDS = [
  "if",
  "else",
  "while",
  "unroll",
  "return",
  "config",
  "struct",
  "union",
  "enum",
  "sizeof",
  "import",
  "let",
  "macro",
];

const BPFTRACE_BUILT_INS =
  "printf print clear zero delete exit time str ntop kaddr uaddr reg system cat signal strncmp join ksym usym hist lhist count sum avg min max stats cgroupid buf strftime path override bswap macaddr write_user";

const BPFTRACE_BUILT_IN_VARS =
  "pid tid uid gid nsecs elapsed cpu comm kstack ustack args retval func probe curtask rand cgroup leader_tid leader_comm";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBpftrace(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const INCLUDE = {
    className: "meta",
    begin: /#include\s*<[^>]*>/,
  };

  const PROBE = {
    className: "title.function",
    begin:
      /\b(?:BEGIN|END|kprobe|kretprobe|uprobe|uretprobe|tracepoint|usdt|profile|interval|software|hardware|kfunc|kretfunc|fentry|fexit|iter|watchpoint|rawtracepoint)(?::[\w*./@-]*)*/,
    relevance: 10,
  };

  const ARG_VAR = {
    className: "variable.language",
    begin: /\barg\d+\b/,
    relevance: 5,
  };

  const POSITIONAL_PARAM = {
    className: "variable.language",
    begin: /\$\d+/,
    relevance: 5,
  };

  const MAP = {
    className: "variable",
    begin: /@[A-Za-z_]\w*/,
    relevance: 0,
  };

  const SCRATCH_VAR = {
    className: "variable",
    begin: /\$[A-Za-z_]\w*/,
    relevance: 0,
  };

  const PREDICATE = {
    className: "meta",
    begin: /\/(?=[^/\n]*\/\s*\{)/,
    end: /\//,
    relevance: 0,
  };

  return {
    name: "bpftrace",
    aliases: ["bt"],
    keywords: {
      keyword: BPFTRACE_KEYWORDS,
      built_in: `${BPFTRACE_BUILT_INS} ${BPFTRACE_BUILT_IN_VARS}`,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      INCLUDE,
      STRING,
      PROBE,
      ARG_VAR,
      POSITIONAL_PARAM,
      MAP,
      SCRATCH_VAR,
      PREDICATE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBpftrace(hljs);
}

export const bpftrace = { name: "bpftrace", register };
export default bpftrace;
