const GOTMPL_KEYWORDS =
  "if else end range with define template block break continue";

const GOTMPL_BUILT_INS =
  "and or not len index print printf println eq ne lt le gt ge html js urlquery slice call";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineGotmpl(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const RAW_STRING = {
    className: "string",
    begin: /`/,
    end: /`/,
  };

  const VARIABLE = {
    className: "variable",
    begin: /\$[A-Za-z_]\w*|\$/,
    relevance: 0,
  };

  const FIELD = {
    className: "property",
    begin: /\.[A-Za-z_][\w.]*/,
    relevance: 0,
  };

  const BARE_DOT = {
    className: "property",
    begin: /\./,
    relevance: 0,
  };

  const PIPE = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  const COMMENT = {
    className: "comment",
    begin: /\{\{-?\s*\/\*/,
    end: /\*\/\s*-?\}\}/,
  };

  const ACTION = {
    variants: [
      { begin: /\{\{-/, relevance: 5 },
      { begin: /\{\{\s*range\b/, relevance: 5 },
      { begin: /\{\{/, relevance: 0 },
    ],
    end: /-?\}\}/,
    keywords: {
      keyword: GOTMPL_KEYWORDS,
      built_in: GOTMPL_BUILT_INS,
    },
    contains: [
      VARIABLE,
      FIELD,
      BARE_DOT,
      PIPE,
      STRING,
      RAW_STRING,
      hljs.C_NUMBER_MODE,
    ],
  };

  return {
    name: "Go template",
    aliases: ["gotemplate", "go-template", "tmpl"],
    contains: [COMMENT, ACTION],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineGotmpl(hljs);
}

export const gotmpl = { name: "gotmpl", register };
export default gotmpl;
