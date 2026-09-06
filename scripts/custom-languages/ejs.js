import javascriptRegister from "highlight.js/lib/languages/javascript";
import xmlRegister from "highlight.js/lib/languages/xml";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineEjs(hljs) {
  return {
    name: "EJS",
    aliases: ["ejs"],
    subLanguage: "xml",
    contains: [
      hljs.COMMENT("<%#", "%>"),
      {
        begin: /<%[-_=]?/,
        end: /[-_]?%>/,
        beginScope: "template-tag",
        endScope: "template-tag",
        subLanguage: "javascript",
        relevance: 5,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("xml", xmlRegister);
  hljs.registerLanguage("javascript", javascriptRegister);
  return defineEjs(hljs);
}

export const ejs = { name: "ejs", register };
export default ejs;
