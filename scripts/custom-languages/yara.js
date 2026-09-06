const YARA_KEYWORDS = [
  "import",
  "include",
  "private",
  "global",
  "and",
  "or",
  "not",
  "any",
  "all",
  "of",
  "them",
  "for",
  "in",
  "at",
  "entrypoint",
  "filesize",
  "contains",
  "icontains",
  "startswith",
  "endswith",
  "matches",
  "defined",
  "ascii",
  "wide",
  "nocase",
  "fullword",
  "xor",
  "base64",
  "base64wide",
];

const YARA_TYPES =
  "int8 int16 int32 uint8 uint16 uint32 int8be int16be int32be uint8be uint16be uint32be";

const YARA_LITERALS = "true false none";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineYara(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const REGEX_LITERAL = {
    className: "regexp",
    begin: /\/(?![*/])/,
    end: /\/[is]*/,
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0,
  };

  const RULE_HEADER = {
    begin: [/\brule\b/, /\s+/, /[A-Za-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 10,
  };

  const SECTION = {
    className: "section",
    begin: /\b(?:meta|strings|condition)\s*:/,
    relevance: 5,
  };

  const STRING_ID = {
    className: "variable",
    begin: /[$#@!][A-Za-z_]\w*|\$/,
    relevance: 0,
  };

  const MODULE_PREFIX = {
    className: "built_in",
    begin: /\b(?:pe|math|hash)\.[A-Za-z_]\w*/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b0x[0-9a-fA-F]+\b|\b\d+(?:KB|MB)?\b/,
    relevance: 0,
  };

  return {
    name: "YARA",
    aliases: ["yar"],
    keywords: {
      keyword: YARA_KEYWORDS,
      type: YARA_TYPES,
      literal: YARA_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      RULE_HEADER,
      SECTION,
      MODULE_PREFIX,
      STRING_ID,
      REGEX_LITERAL,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineYara(hljs);
}

export const yara = { name: "yara", register };
export default yara;
