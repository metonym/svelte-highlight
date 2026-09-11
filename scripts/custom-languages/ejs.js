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
      // `<%%` and `%%>` emit a literal `<%` / `%>`. The opener must be
      // consumed before the scriptlet rule below sees its leading `<%`, or
      // the rest of the line is highlighted as JavaScript.
      {
        className: "meta",
        begin: /<%%|%%>/,
        relevance: 0,
      },
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
