/** @param {import("highlight.js").HLJSApi} hljs */
function defineRon(hljs) {
  const ATTRIBUTE = {
    className: "meta",
    begin: /#!\[[^\]]*\]/,
    relevance: 10,
  };

  const STRUCT_NAME = {
    className: "title class_",
    begin: /\b[A-Z][A-Za-z0-9_]*(?=\s*[({])/,
    relevance: 0,
  };

  const PASCAL_CASE_LITERAL = {
    className: "literal",
    begin: /\b[A-Z][A-Za-z0-9_]*\b/,
    relevance: 0,
  };

  const FIELD_NAME = {
    className: "attr",
    begin: /\b[a-z_][A-Za-z0-9_]*(?=\s*:)/,
    relevance: 0,
  };

  const RAW_STRING = hljs.END_SAME_AS_BEGIN({
    className: "string",
    begin: /r(#*)"/,
    end: /"(#*)/,
  });

  const BYTE_STRING = {
    className: "string",
    begin: /b"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const CHAR = {
    className: "string",
    begin: /'(?:\\.|[^'\\])'/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0x[0-9a-fA-F_]+\b/ },
      { begin: /\b0b[01_]+\b/ },
      { begin: /\b0o[0-7_]+\b/ },
      { begin: /\b(?:inf|NaN)\b/ },
      { begin: /[+-]?\b\d[\d_]*\.?[\d_]*(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  return {
    name: "RON",
    keywords: {
      literal: "true false None",
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ATTRIBUTE,
      RAW_STRING,
      BYTE_STRING,
      STRING,
      CHAR,
      STRUCT_NAME,
      FIELD_NAME,
      NUMBER,
      PASCAL_CASE_LITERAL,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRon(hljs);
}

export const ron = { name: "ron", register };
export default ron;
