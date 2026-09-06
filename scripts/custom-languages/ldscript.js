const LDSCRIPT_KEYWORDS = [
  "ENTRY",
  "OUTPUT_FORMAT",
  "OUTPUT_ARCH",
  "OUTPUT",
  "TARGET",
  "SEARCH_DIR",
  "STARTUP",
  "INPUT",
  "GROUP",
  "AS_NEEDED",
  "INCLUDE",
  "MEMORY|10",
  "SECTIONS|10",
  "PHDRS",
  "VERSION",
  "REGION_ALIAS",
  "ASSERT",
  "EXTERN",
  "FORCE_COMMON_ALLOCATION",
  "INHIBIT_COMMON_ALLOCATION",
  "INSERT",
  "NOCROSSREFS",
  "PROVIDE",
  "PROVIDE_HIDDEN",
  "HIDDEN",
  "KEEP",
  "SORT",
  "SORT_BY_NAME",
  "SORT_BY_ALIGNMENT",
  "EXCLUDE_FILE",
  "BYTE",
  "SHORT",
  "LONG",
  "QUAD",
  "SQUAD",
  "FILL",
  "ABSOLUTE",
  "ADDR",
  "ALIGN",
  "ALIGNOF",
  "BLOCK",
  "DATA_SEGMENT_ALIGN",
  "DATA_SEGMENT_END",
  "DATA_SEGMENT_RELRO_END",
  "DEFINED",
  "LENGTH",
  "LOADADDR",
  "LOG2CEIL",
  "MAX",
  "MIN",
  "NEXT",
  "ORIGIN",
  "SEGMENT_START",
  "SIZEOF",
  "SIZEOF_HEADERS",
  "CONSTANT",
  "AT",
  "SUBALIGN",
  "ONLY_IF_RO",
  "ONLY_IF_RW",
  "NOLOAD",
  "COPY",
  "INFO",
  "OVERLAY",
  "DSECT",
  "COMMON",
  "CREATE_OBJECT_SYMBOLS",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineLdscript(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const SECTION_NAME = {
    className: "string",
    begin: /\.[a-zA-Z_][\w.*]*/,
    relevance: 0,
  };

  const LOCATION_COUNTER = {
    className: "variable.language",
    begin: /\./,
    relevance: 0,
  };

  const MEMORY_ATTR = {
    className: "meta",
    begin: /\([a-zA-Z!]+\)/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b(?:0x[0-9a-fA-F]+|\d+[KMG]?)\b/,
    relevance: 0,
  };

  const REGION_ASSIGN = {
    className: "operator",
    begin: /AT>|>/,
    relevance: 0,
  };

  return {
    name: "GNU ld linker script",
    aliases: ["ld", "lds", "linkerscript"],
    keywords: {
      keyword: LDSCRIPT_KEYWORDS,
    },
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      SECTION_NAME,
      MEMORY_ATTR,
      REGION_ASSIGN,
      LOCATION_COUNTER,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineLdscript(hljs);
}

export const ldscript = { name: "ldscript", register };
export default ldscript;
