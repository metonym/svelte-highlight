import jinja from "./jinja.js";

const BAML_KEYWORDS = [
  "class",
  "enum",
  "function",
  "client",
  "retry_policy",
  "generator",
  "test",
  "template_string",
  "dynamic",
  "type",
  "map",
  "image",
  "audio",
  "string",
  "int",
  "float",
  "bool",
  "provider",
  "options",
];

const BAML_LITERALS = "null true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBaml(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /@{1,2}[A-Za-z_]\w*/,
    relevance: 5,
  };

  const ARROW = {
    className: "operator",
    begin: /->/,
    relevance: 5,
  };

  // Prompt raw string: `#"..."#`, with Jinja expressions inside.
  const PROMPT_BLOCK = {
    className: "string",
    begin: /#"/,
    end: /"#/,
    subLanguage: "jinja",
    relevance: 10,
  };

  return {
    name: "BAML",
    aliases: ["baml"],
    keywords: {
      keyword: BAML_KEYWORDS,
      literal: BAML_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      PROMPT_BLOCK,
      ATTRIBUTE,
      ARROW,
      STRING,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("jinja", jinja.register);
  return defineBaml(hljs);
}

export const baml = { name: "baml", register };
export default baml;
