import xmlRegister from "highlight.js/lib/languages/xml";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBlade(hljs) {
  const VARIABLE = {
    className: "variable",
    begin: /\$+[A-Za-z_]\w*/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/ },
      { begin: /'/, end: /'/ },
    ],
  };

  const DIRECTIVE = {
    className: "keyword",
    begin: /@[a-zA-Z]\w*/,
    relevance: 10,
  };

  const COMMENT = hljs.COMMENT(/\{\{--/, /--\}\}/);

  const RAW_ECHO = {
    className: "template-variable",
    begin: /\{!!/,
    end: /!!\}/,
    contains: [VARIABLE, STRING, hljs.NUMBER_MODE],
  };

  const ECHO = {
    className: "template-variable",
    begin: /\{\{-?/,
    end: /-?\}\}/,
    contains: [VARIABLE, STRING, hljs.NUMBER_MODE],
  };

  return {
    name: "Blade",
    aliases: ["blade"],
    subLanguage: "xml",
    contains: [COMMENT, DIRECTIVE, RAW_ECHO, ECHO],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("xml", xmlRegister);
  return defineBlade(hljs);
}

export const blade = { name: "blade", register };
export default blade;
