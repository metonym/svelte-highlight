function ci(word) {
  return word
    .split("")
    .map((ch) => {
      const upper = ch.toUpperCase();
      const lower = ch.toLowerCase();
      return upper === lower ? ch : `[${upper}${lower}]`;
    })
    .join("");
}

function ciAlt(words) {
  return words.map(ci).join("|");
}

function defineLog() {
  const ISO_TIMESTAMP = {
    className: "number",
    begin: /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[.,]\d+Z?\b/,
    relevance: 5,
  };

  const OTHER_TIMESTAMP = {
    className: "number",
    variants: [
      { begin: /\b[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\b/ },
      {
        begin: /\[\d{2}\/[A-Z][a-z]{2}\/\d{4}:\d{2}:\d{2}:\d{2}\s[+-]\d{4}\]/,
      },
      { begin: /\b1\d{9}(?:\.\d+)?\b/ },
      { begin: /\b\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\b/ },
    ],
    relevance: 0,
  };

  const LEVEL_INFO = {
    className: "keyword",
    begin: new RegExp(`\\b(?:${ciAlt(["INFO", "DEBUG", "TRACE"])})\\b`),
    relevance: 3,
  };

  const LEVEL_ERROR = {
    className: "deletion",
    begin: new RegExp(
      `\\b(?:${ciAlt(["ERROR", "ERR", "FATAL", "CRITICAL", "CRIT", "PANIC"])})\\b`,
    ),
    relevance: 3,
  };

  const LEVEL_WARN = {
    className: "addition",
    begin: new RegExp(`\\b(?:${ciAlt(["WARNING", "WARN"])})\\b`),
    relevance: 3,
  };

  const LEVEL_OTHER = {
    className: "keyword",
    begin: new RegExp(
      `\\b(?:${ciAlt(["NOTICE", "SEVERE", "FINEST", "FINER", "FINE", "EMERG", "ALERT"])})\\b`,
    ),
    relevance: 0,
  };

  const BRACKETED_TAG = {
    className: "meta",
    begin: /\[[\w.-]+\]/,
    relevance: 0,
  };

  const PID = {
    className: "meta",
    begin: /\bpid\[\d+\]/,
    relevance: 0,
  };

  const KEY_VALUE = {
    className: "attr",
    begin: /\b[A-Za-z_][\w.-]*(?==)/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/ },
      { begin: /'/, end: /'/ },
    ],
    relevance: 0,
  };

  const URL = {
    className: "link",
    begin: /\bhttps?:\/\/\S+/,
    relevance: 0,
  };

  const IP_ADDRESS = {
    className: "link",
    begin: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
    relevance: 0,
  };

  const UUID = {
    className: "link",
    begin:
      /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/,
    relevance: 0,
  };

  const HEX_ID = {
    className: "link",
    begin: /\b0x[0-9a-fA-F]+\b|\b[0-9a-fA-F]{7,40}\b/,
    relevance: 0,
  };

  const HTTP_METHOD = {
    className: "built_in",
    begin: /\b(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/,
    relevance: 0,
  };

  const HTTP_STATUS = {
    className: "number",
    begin: /\b[1-5]\d{2}\b/,
    relevance: 0,
  };

  const EXCEPTION_WORD = {
    className: "keyword",
    begin: /\b(?:Exception|Error|Traceback)\b/,
    relevance: 0,
  };

  const STACK_FRAME = {
    className: "title function_",
    begin: /\bat\s+[\w$]+(?:\.[\w$]+)*\([^)\n]*\)/,
    relevance: 0,
  };

  return {
    name: "Log file",
    aliases: ["logfile", "syslog"],
    case_insensitive: false,
    contains: [
      ISO_TIMESTAMP,
      OTHER_TIMESTAMP,
      LEVEL_ERROR,
      LEVEL_WARN,
      LEVEL_INFO,
      LEVEL_OTHER,
      PID,
      BRACKETED_TAG,
      STRING,
      URL,
      UUID,
      IP_ADDRESS,
      HEX_ID,
      HTTP_METHOD,
      HTTP_STATUS,
      STACK_FRAME,
      EXCEPTION_WORD,
      KEY_VALUE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(_hljs) {
  return defineLog();
}

export const log = { name: "log", register };
export default log;
