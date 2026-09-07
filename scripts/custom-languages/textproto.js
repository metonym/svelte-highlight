/** @param {import("highlight.js").HLJSApi} hljs */
function defineTextproto(hljs) {
  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
    relevance: 0,
  };

  const HEADER_COMMENT = {
    className: "meta",
    begin: /#\s*proto-(?:file|message):.*$/,
    relevance: 5,
  };

  const EXTENSION_FIELD = {
    className: "meta",
    begin: /\[\w+(?:\.\w+){2,}(?:\/[\w.]+)?\]/,
    relevance: 10,
  };

  const FIELD_NAME = {
    className: "attr",
    begin: /\b[A-Za-z_]\w*(?=\s*[:{<])/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /-?\binf\b/ },
      { begin: /\bnan\b/ },
      { begin: /\b0x[0-9A-Fa-f]+\b/ },
      { begin: /-?\b\d+\.?\d*(?:[eE][+-]?\d+)?[fF]?\b/ },
    ],
    relevance: 0,
  };

  return {
    name: "Protocol Buffer text format",
    aliases: ["pbtxt", "prototext", "textpb"],
    contains: [
      HEADER_COMMENT,
      hljs.HASH_COMMENT_MODE,
      STRING,
      EXTENSION_FIELD,
      FIELD_NAME,
      NUMBER,
      {
        className: "literal",
        begin: /\b[A-Za-z_]\w*\b/,
        relevance: 0,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineTextproto(hljs);
}

export const textproto = { name: "textproto", register };
export default textproto;
