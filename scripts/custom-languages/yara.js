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
  "istartswith",
  "endswith",
  "iendswith",
  "iequals",
  "matches",
  "defined",
  "with",
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
    begin:
      /\b(?:pe|elf|macho|dotnet|dex|math|hash|time|string|console|magic|cuckoo)\.[A-Za-z_]\w*/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b0x[0-9a-fA-F]+\b|\b\d+\.\d+\b|\b\d+(?:KB|MB)?\b/,
    relevance: 0,
  };

  // `$name = { 6A ?? [4-6] ~90 ( 55 | 56 ) }`: the opening brace is part of
  // `begin`, so the plain NUMBER rule (which styled `40` but not `6A`)
  // never sees the body; every byte, wildcard (`??`, `8?`) and not-byte
  // (`~90`) is one number token and jumps/alternation stay plain.
  const HEX_STRING = {
    begin: [/\$[A-Za-z_]\w*/, /\s*=\s*/, /\{/],
    beginScope: { 1: "variable" },
    end: /\}/,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "number",
        begin: /~?[0-9A-Fa-f?]{2}(?![\w?])/,
      },
    ],
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
      HEX_STRING,
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
